import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import * as crypto from 'crypto';

process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '3600';
process.env.FRONT_URL = 'http://localhost:3001';

import { AuthModule } from './auth.module';
import { AUTH_INJECTION_TOKENS } from './constants/injection-tokens';
import { VERIFY_MAIL_TOKEN } from './constants/verify-mail.tokens';
import { User } from './domain/entities/user.entity';
import { Role } from 'src/security/roles.enum';
import { AuthIdentity } from './domain/entities/auth-identity.entity';
import { AuthProvider } from './domain/authProviders';
import { AuthSession } from './domain/entities/auth-session.identity';
import { EmailVerificationToken } from './domain/entities/email-verification.token.entity';
import { PasswordResetToken } from './domain/entities/password-reset.token.entity';
import { CustomerContextService } from '../customers/application/customer-context.service';
import { CartService } from '../cart/application/cart.service';
import { Customer } from '../customers/domain/customers.entity';
import { OAuthProviderFactory } from './infrastructure/oauth-provider.factory';

class InMemoryUserRepository {
  users = new Map<string, User>();

  async findById(id: string) {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string) {
    const normalized = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.getEmail()?.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  async create(data: {
    email?: string | null;
    name: string;
    imageUrl?: string | null;
    address?: string | null;
    birthDate?: Date | null;
    gender?: string | null;
    role?: Role;
    emailVerified?: boolean;
  }) {
    const now = new Date();
    const user = new User(
      crypto.randomUUID(),
      data.email ?? null,
      data.name,
      data.imageUrl ?? null,
      data.address ?? null,
      data.birthDate ?? null,
      data.gender ?? null,
      data.emailVerified ?? false,
      now,
      now,
      data.role ?? Role.CUSTOMER,
    );
    this.users.set(user.id, user);
    return user;
  }

  async save(user: User) {
    this.users.set(user.id, user);
  }
}

class InMemoryAuthIdentityRepository {
  identities = new Map<string, AuthIdentity>();

  async findByUserId(userId: string) {
    return [...this.identities.values()].filter((identity) => identity.userId === userId);
  }

  async findByUserIdAndProvider(userId: string, provider: AuthProvider) {
    return (
      [...this.identities.values()].find(
        (identity) => identity.userId === userId && identity.provider === provider,
      ) ?? null
    );
  }

  async findByProviderUserId(provider: AuthProvider, providerUserId: string) {
    for (const identity of this.identities.values()) {
      if (
        identity.provider === provider &&
        identity.providerUserId === providerUserId
      ) {
        return identity;
      }
    }
    return null;
  }

  async findEmailIdentityByEmail(email: string) {
    const normalized = email.toLowerCase();
    for (const identity of this.identities.values()) {
      if (
        identity.provider === AuthProvider.EMAIL &&
        identity.email?.toLowerCase() === normalized
      ) {
        return identity;
      }
    }
    return null;
  }

  async create(data: {
    userId: string;
    provider: AuthProvider;
    providerUserId?: string | null;
    email?: string | null;
    passwordHash?: string | null;
  }) {
    const now = new Date();
    const identity = new AuthIdentity(
      crypto.randomUUID(),
      data.userId,
      data.provider,
      data.providerUserId ?? null,
      data.email ?? null,
      data.passwordHash ?? null,
      now,
      now,
    );
    this.identities.set(identity.id, identity);
    return identity;
  }

  async save(identity: AuthIdentity) {
    this.identities.set(identity.id, identity);
  }
}

class InMemorySessionRepository {
  sessions = new Map<string, AuthSession>();

  async create(data: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }) {
    const session = new AuthSession(
      data.id,
      data.userId,
      data.refreshTokenHash,
      data.userAgent ?? null,
      data.ipAddress ?? null,
      data.expiresAt,
      new Date(),
    );
    this.sessions.set(session.id, session);
    return session;
  }

  async findById(id: string) {
    return this.sessions.get(id) ?? null;
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    for (const session of this.sessions.values()) {
      if (session.getRefreshTokenHash() === refreshTokenHash) {
        return session;
      }
    }
    return null;
  }

  async findByUserId(userId: string) {
    return [...this.sessions.values()].filter((session) => session.userId === userId);
  }

  async delete(id: string) {
    this.sessions.delete(id);
  }

  async deleteByIdAndUserId(id: string, userId: string) {
    const session = this.sessions.get(id);
    if (session?.userId === userId) {
      this.sessions.delete(id);
    }
  }

  async deleteByUserId(userId: string) {
    for (const [id, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(id);
      }
    }
  }

  async deleteByRefreshTokenHash(refreshTokenHash: string) {
    for (const [id, session] of this.sessions.entries()) {
      if (session.getRefreshTokenHash() === refreshTokenHash) {
        this.sessions.delete(id);
      }
    }
  }
}

class InMemoryEmailVerificationTokenRepository {
  tokens = new Map<string, EmailVerificationToken>();

  async create(token: EmailVerificationToken) {
    this.tokens.set(token.tokenHash, token);
  }

  async findByHash(hash: string) {
    return this.tokens.get(hash) ?? null;
  }

  async consume(token: EmailVerificationToken) {
    token.consume();
    this.tokens.set(token.tokenHash, token);
  }

  async deleteByUser(userId: string) {
    for (const [hash, token] of this.tokens.entries()) {
      if (token.userId === userId) {
        this.tokens.delete(hash);
      }
    }
  }
}

class InMemoryPasswordResetTokenRepository {
  tokens = new Map<string, PasswordResetToken>();

  async create(token: PasswordResetToken) {
    this.tokens.set(token.tokenHash, token);
  }

  async findByHash(hash: string) {
    return this.tokens.get(hash) ?? null;
  }

  async consume(token: PasswordResetToken) {
    token.consume();
    this.tokens.set(token.tokenHash, token);
  }

  async deleteByUser(userId: string) {
    for (const [hash, token] of this.tokens.entries()) {
      if (token.userId === userId) {
        this.tokens.delete(hash);
      }
    }
  }
}

class FakePasswordHasher {
  async hash(value: string) {
    return `hashed:${value}`;
  }

  async compare(value: string, hashedValue: string) {
    return hashedValue === `hashed:${value}`;
  }
}

class FakeMailService {
  sent: Array<{ to: string; subject: string; html: string }> = [];

  async send(input: { to: string; subject: string; html: string }) {
    this.sent.push(input);
  }
}

class FakeCustomerContextService {
  customers = new Map<string, Customer>();

  async ensureCustomerByUserId(userId: string) {
    const existing = this.customers.get(userId);
    if (existing) {
      return existing;
    }

    const customer = new Customer(crypto.randomUUID(), userId, Role.CUSTOMER);
    this.customers.set(userId, customer);
    return customer;
  }

  async getCustomerByUserId(userId: string) {
    const customer = this.customers.get(userId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }
}

class FakeCartService {
  async mergeCart() {
    return;
  }
}

class FakeOAuthProviderFactory {
  get(provider: AuthProvider) {
    return {
      provider,
      async validateToken(token: string) {
        const profiles: Record<string, any> = {
          'google-login-token': {
            provider,
            providerUserId: 'google-login-user',
            email: 'social@example.com',
            name: 'Social User',
            avatarUrl: 'https://cdn.example.com/social-user.png',
            emailVerified: true,
          },
          'google-link-token': {
            provider,
            providerUserId: 'google-link-user',
            email: 'linked@example.com',
            name: 'Linked User',
            avatarUrl: 'https://cdn.example.com/linked-user.png',
            emailVerified: true,
          },
          'google-conflict-token': {
            provider,
            providerUserId: 'google-conflict-user',
            email: 'conflict@example.com',
            name: 'Conflict User',
            avatarUrl: null,
            emailVerified: true,
          },
        };

        const profile = profiles[token];

        if (!profile) {
          throw new Error(`Unknown OAuth token: ${token}`);
        }

        return profile;
      },
    };
  }
}

describe('Auth integration', () => {
  let app: INestApplication;
  let mailService: FakeMailService;
  let userRepository: InMemoryUserRepository;
  let identityRepository: InMemoryAuthIdentityRepository;
  let sessionRepository: InMemorySessionRepository;
  let emailVerificationRepository: InMemoryEmailVerificationTokenRepository;
  let passwordResetRepository: InMemoryPasswordResetTokenRepository;
  let customerContextService: FakeCustomerContextService;

  beforeAll(async () => {
    mailService = new FakeMailService();
    userRepository = new InMemoryUserRepository();
    identityRepository = new InMemoryAuthIdentityRepository();
    sessionRepository = new InMemorySessionRepository();
    emailVerificationRepository = new InMemoryEmailVerificationTokenRepository();
    passwordResetRepository = new InMemoryPasswordResetTokenRepository();
    customerContextService = new FakeCustomerContextService();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
      .useValue(userRepository)
      .overrideProvider(VERIFY_MAIL_TOKEN.USER)
      .useValue(userRepository)
      .overrideProvider(AUTH_INJECTION_TOKENS.AUTH_IDENTITY_REPOSITORY)
      .useValue(identityRepository)
      .overrideProvider(AUTH_INJECTION_TOKENS.SESSION_REPOSITORY)
      .useValue(sessionRepository)
      .overrideProvider(AUTH_INJECTION_TOKENS.PASSWORD_HASHER)
      .useValue(new FakePasswordHasher())
      .overrideProvider(VERIFY_MAIL_TOKEN.EMAIL_VERIFICATION_TOKEN_REPO)
      .useValue(emailVerificationRepository)
      .overrideProvider(VERIFY_MAIL_TOKEN.PASSWORD_RESET_TOKEN_REPO)
      .useValue(passwordResetRepository)
      .overrideProvider(VERIFY_MAIL_TOKEN.MAIL_SERVICE)
      .useValue(mailService)
      .overrideProvider(CustomerContextService)
      .useValue(customerContextService)
      .overrideProvider(CartService)
      .useValue(new FakeCartService())
      .overrideProvider(OAuthProviderFactory)
      .useValue(new FakeOAuthProviderFactory())
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(() => {
    mailService.sent.length = 0;
    userRepository.users.clear();
    identityRepository.identities.clear();
    sessionRepository.sessions.clear();
    emailVerificationRepository.tokens.clear();
    passwordResetRepository.tokens.clear();
    customerContextService.customers.clear();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('signup returns auth payload and sends verification email automatically', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup/email')
      .send({
        email: 'ana@example.com',
        password: 'Password123',
      })
      .expect(201);

    expect(response.body.user.email).toBe('ana@example.com');
    expect(response.body.user.role).toBe('CUSTOMER');
    expect(response.body.sessionId).toBeTruthy();
    expect(response.body.customerId).toBeTruthy();
    expect(mailService.sent).toHaveLength(1);
    expect(mailService.sent[0].subject).toContain('Verify');
  });

  it('supports login, refresh and logout', async () => {
    await signup(app, 'login@example.com');

    const login = await request(app.getHttpServer())
      .post('/auth/login/email')
      .send({
        email: 'login@example.com',
        password: 'Password123',
      })
      .expect(201);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(201);

    expect(refresh.body.sessionId).toBeTruthy();
    expect(refresh.body.sessionId).not.toBe(login.body.sessionId);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refresh.body.accessToken}`)
      .send({ refreshToken: refresh.body.refreshToken })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: refresh.body.refreshToken })
      .expect(401);
  });

  it('supports unified login with email credentials', async () => {
    await signup(app, 'unified-email@example.com');

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        type: 'email',
        email: 'unified-email@example.com',
        password: 'Password123',
      })
      .expect(201);

    expect(response.body.user.email).toBe('unified-email@example.com');
    expect(response.body.sessionId).toBeTruthy();
  });

  it('supports unified social login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        type: 'social',
        provider: 'google',
        token: 'google-login-token',
      })
      .expect(201);

    expect(response.body.identity.provider).toBe('google');
    expect(response.body.user.email).toBe('social@example.com');
    expect(response.body.user.emailVerified).toBe(true);
  });

  it('supports resend-verification and verify-email', async () => {
    const signupResponse = await signup(app, 'verify@example.com');

    await request(app.getHttpServer())
      .post('/auth/resend-verification')
      .set('Authorization', `Bearer ${signupResponse.accessToken}`)
      .send({})
      .expect(201);

    const verificationMail = findLatestMailBySubject(mailService.sent, 'Verify');
    const token = extractTokenFromHtml(verificationMail.html);

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login/email')
      .send({
        email: 'verify@example.com',
        password: 'Password123',
      })
      .expect(201);

    expect(login.body.user.emailVerified).toBe(true);
  });

  it('lists and revokes individual sessions by device', async () => {
    const signupResponse = await signup(app, 'devices@example.com');

    await request(app.getHttpServer())
      .post('/auth/login/email')
      .set('user-agent', 'device-1')
      .send({
        email: 'devices@example.com',
        password: 'Password123',
      })
      .expect(201);

    const latestLogin = await request(app.getHttpServer())
      .post('/auth/login/email')
      .set('user-agent', 'device-2')
      .send({
        email: 'devices@example.com',
        password: 'Password123',
      })
      .expect(201);

    const sessions = await request(app.getHttpServer())
      .get('/auth/sessions')
      .set('Authorization', `Bearer ${latestLogin.body.accessToken}`)
      .expect(200);

    expect(sessions.body).toHaveLength(3);
    expect(sessions.body.some((session) => session.current === true)).toBe(true);

    const targetSession = sessions.body.find(
      (session) => session.id === signupResponse.sessionId,
    );

    await request(app.getHttpServer())
      .delete(`/auth/sessions/${targetSession.id}`)
      .set('Authorization', `Bearer ${latestLogin.body.accessToken}`)
      .expect(200);

    const sessionsAfterRevocation = await request(app.getHttpServer())
      .get('/auth/sessions')
      .set('Authorization', `Bearer ${latestLogin.body.accessToken}`)
      .expect(200);

    expect(sessionsAfterRevocation.body).toHaveLength(2);
    expect(
      sessionsAfterRevocation.body.find((session) => session.id === targetSession.id),
    ).toBeUndefined();
  });

  it('links a social identity from the authenticated profile and lists identities', async () => {
    const signupResponse = await signup(app, 'linked@example.com');

    const linkedIdentity = await request(app.getHttpServer())
      .post('/auth/identities/link')
      .set('Authorization', `Bearer ${signupResponse.accessToken}`)
      .send({
        provider: 'google',
        token: 'google-link-token',
      })
      .expect(201);

    expect(linkedIdentity.body.provider).toBe('google');

    const identities = await request(app.getHttpServer())
      .get('/auth/identities')
      .set('Authorization', `Bearer ${signupResponse.accessToken}`)
      .expect(200);

    expect(identities.body).toHaveLength(2);
    expect(identities.body.some((identity) => identity.provider === 'email')).toBe(true);
    expect(identities.body.some((identity) => identity.provider === 'google')).toBe(true);
  });

  it('rejects linking a social account already linked to another user', async () => {
    const firstUser = await signup(app, 'conflict1@example.com');
    const secondUser = await signup(app, 'conflict2@example.com');

    await request(app.getHttpServer())
      .post('/auth/identities/link')
      .set('Authorization', `Bearer ${firstUser.accessToken}`)
      .send({
        provider: 'google',
        token: 'google-conflict-token',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/identities/link')
      .set('Authorization', `Bearer ${secondUser.accessToken}`)
      .send({
        provider: 'google',
        token: 'google-conflict-token',
      })
      .expect(409);
  });

  it('resets password and revokes previous sessions', async () => {
    const signupResponse = await signup(app, 'reset@example.com');

    await request(app.getHttpServer())
      .post('/auth/password/forgot')
      .send({ email: 'reset@example.com' })
      .expect(201);

    const resetMail = findLatestMailBySubject(mailService.sent, 'Reset');
    const token = extractTokenFromHtml(resetMail.html);

    await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({
        token,
        newPassword: 'NewPassword123',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: signupResponse.refreshToken })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login/email')
      .send({
        email: 'reset@example.com',
        password: 'Password123',
      })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login/email')
      .send({
        email: 'reset@example.com',
        password: 'NewPassword123',
      })
      .expect(201);
  });
});

async function signup(app: INestApplication, email: string) {
  const response = await request(app.getHttpServer())
    .post('/auth/signup/email')
    .send({
      email,
      password: 'Password123',
    })
    .expect(201);

  return response.body;
}

function findLatestMailBySubject(
  mails: Array<{ subject: string; html: string }>,
  subjectPart: string,
) {
  const mail = [...mails].reverse().find((item) => item.subject.includes(subjectPart));

  if (!mail) {
    throw new Error(`Mail with subject containing "${subjectPart}" not found`);
  }

  return mail;
}

function extractTokenFromHtml(html: string) {
  const match = html.match(/token=([a-f0-9]+)/i);

  if (!match) {
    throw new Error(`Token not found in html: ${html}`);
  }

  return match[1];
}
