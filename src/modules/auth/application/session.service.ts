import * as crypto from 'crypto';
import { Inject, Injectable } from "@nestjs/common";
import { CustomerContextService } from 'src/modules/customers/application/customer-context.service';
import { Role } from 'src/security/roles.enum';
import type { SessionRepository } from "../domain/repositories/auth-session.repository";
import { AuthSession } from '../domain/entities/auth-session.identity';
import { AUTH_INJECTION_TOKENS } from "../constants/injection-tokens";
import { JwtService } from '@nestjs/jwt';
import type { UserRepository } from '../domain/repositories/user.repository';

@Injectable()
export class SessionService {
  constructor(
    @Inject(AUTH_INJECTION_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,
    @Inject(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly customerContextService: CustomerContextService,
    private readonly jwtService: JwtService,
  ) { }

  async createSession(params: {
    userId: string;
    role?: Role;
    customerId?: string | null;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    const claims = await this.resolveClaims(params);
    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hash(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.sessionRepo.create({
      id: crypto.randomUUID(),
      userId: params.userId,
      refreshTokenHash,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      expiresAt,
    });

    const accessToken = this.jwtService.sign({
      sub: params.userId,
      role: claims.role,
      customerId: claims.customerId,
    });

    return {
      accessToken,
      refreshToken,
      expiresAt,
      userId: params.userId,
      customerId: claims.customerId,
    };
  }

  async refreshSession(params: {
    refreshToken: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    const currentTokenHash = this.hash(params.refreshToken);
    const session = await this.sessionRepo.findByRefreshTokenHash(currentTokenHash);

    if (!session) {
      return null;
    }

    if (session.isExpired()) {
      await this.sessionRepo.delete(session.id);
      return null;
    }

    await this.sessionRepo.delete(session.id);

    return this.createSession({
      userId: session.userId,
      userAgent: params.userAgent ?? session.userAgent,
      ipAddress: params.ipAddress ?? session.ipAddress,
    });
  }

  async invalidateSession(refreshToken: string): Promise<void> {
    await this.sessionRepo.deleteByRefreshTokenHash(this.hash(refreshToken));
  }

  async validateSession(sessionId: string): Promise<AuthSession | null> {
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      return null;
    }

    if (session.isExpired()) {
      await this.sessionRepo.delete(session.id);
      return null;
    }

    return session;
  }
  private generateRefreshToken(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  private hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async resolveClaims(params: {
    userId: string;
    role?: Role;
    customerId?: string | null;
  }) {
    const user =
      params.role === undefined
        ? await this.userRepository.findById(params.userId)
        : null;
    const customer =
      params.customerId === undefined
        ? await this.customerContextService.ensureCustomerByUserId(params.userId)
        : null;

    return {
      role: params.role ?? user?.getRole() ?? Role.CUSTOMER,
      customerId: params.customerId ?? customer?.id ?? null,
    };
  }
}
