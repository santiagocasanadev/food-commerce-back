import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthProvider } from 'src/modules/auth/domain/authProviders';
import { AuthIdentity } from 'src/modules/auth/domain/entities/auth-identity.entity';
import { PostgresAuthIdentityRepository } from 'src/modules/auth/infrastructure/persistence/auth-identity.repository.postgres';
import { PostgresUserRepository } from 'src/modules/auth/infrastructure/persistence/user.repository.postgres';
import { BcryptPasswordHasher } from 'src/modules/auth/infrastructure/security/bcrypt-password-hasher';
import { CustomerContextService } from 'src/modules/customers/application/customer-context.service';
import { RequestUser } from 'src/security/request-user';
import { Role } from 'src/security/roles.enum';

type UserPayload = {
  tenantId?: string | null;
  email?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  address?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  role?: Role;
  password?: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: PostgresUserRepository,
    private readonly authIdentityRepository: PostgresAuthIdentityRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
    private readonly customerContextService: CustomerContextService,
  ) {}

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toView(user);
  }

  async updateMe(userId: string, payload: UserPayload) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.updateProfile({
      name: payload.name,
      imageUrl: payload.imageUrl,
      address: payload.address,
      birthDate: this.parseBirthDate(payload.birthDate),
      gender: payload.gender,
    });

    await this.userRepository.save(user);

    return this.toView(user);
  }

  async list(actor: RequestUser) {
    if (actor.role === Role.PLATFORM_ADMIN) {
      const users = await this.userRepository.findAll();
      return users.map((user) => this.toView(user));
    }

    this.ensureTenantAdmin(actor);

    const users = await this.userRepository.findByTenantId(actor.tenantId!);
    return users.map((user) => this.toView(user));
  }

  async getById(actor: RequestUser, userId: string) {
    const user = await this.mustFindScopedUser(actor, userId);
    return this.toView(user);
  }

  async create(actor: RequestUser, payload: UserPayload) {
    const resolvedRole = this.resolveCreateRole(actor, payload.role);
    const resolvedTenantId = this.resolveCreateTenantId(actor, payload.tenantId);
    const normalizedEmail = payload.email?.trim().toLowerCase() ?? null;

    if (normalizedEmail) {
      await this.assertEmailAvailable(normalizedEmail);
    }

    const user = await this.userRepository.create({
      tenantId: resolvedTenantId,
      email: normalizedEmail,
      name: payload.name?.trim() || normalizedEmail?.split('@')[0] || 'user',
      imageUrl: payload.imageUrl ?? null,
      address: payload.address ?? null,
      birthDate: this.parseBirthDate(payload.birthDate),
      gender: payload.gender ?? null,
      role: resolvedRole,
      emailVerified: false,
    });

    if (payload.password) {
      if (!normalizedEmail) {
        throw new BadRequestException('Email is required when password is provided');
      }

      const passwordHash = await this.passwordHasher.hash(payload.password);
      await this.authIdentityRepository.create({
        userId: user.id,
        provider: AuthProvider.EMAIL,
        email: normalizedEmail,
        passwordHash,
      });
    }

    if (resolvedRole === Role.CUSTOMER) {
      await this.customerContextService.ensureCustomerByUserId(user.id);
    }

    return this.toView(user);
  }

  async update(actor: RequestUser, userId: string, payload: UserPayload) {
    const user = await this.mustFindScopedUser(actor, userId);
    const resolvedRole = this.resolveUpdateRole(actor, payload.role, user.getRole());
    const resolvedTenantId = this.resolveUpdateTenantId(
      actor,
      payload.tenantId,
      user.getTenantId(),
    );
    const nextEmail =
      payload.email !== undefined
        ? payload.email?.trim().toLowerCase() ?? null
        : user.getEmail();

    if (nextEmail && nextEmail !== user.getEmail()) {
      await this.assertEmailAvailable(nextEmail, user.id);
    }

    user.updateProfile({
      tenantId: resolvedTenantId,
      role: resolvedRole,
      email: nextEmail,
      name: payload.name,
      imageUrl: payload.imageUrl,
      address: payload.address,
      birthDate:
        payload.birthDate === undefined
          ? undefined
          : this.parseBirthDate(payload.birthDate),
      gender: payload.gender,
    });

    await this.userRepository.save(user);
    await this.syncEmailIdentity(user.id, nextEmail, payload.password);

    if (resolvedRole === Role.CUSTOMER) {
      await this.customerContextService.ensureCustomerByUserId(user.id);
    }

    return this.toView(user);
  }

  async remove(actor: RequestUser, userId: string) {
    if (actor.userId === userId) {
      throw new BadRequestException('You cannot delete your own user');
    }

    await this.mustFindScopedUser(actor, userId);
    await this.userRepository.deleteById(userId);

    return { success: true };
  }

  private async mustFindScopedUser(actor: RequestUser, userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (actor.role === Role.PLATFORM_ADMIN) {
      return user;
    }

    this.ensureTenantAdmin(actor);

    if (!user.getTenantId() || user.getTenantId() !== actor.tenantId) {
      throw new ForbiddenException('User is outside your tenant scope');
    }

    return user;
  }

  private ensureTenantAdmin(actor: RequestUser) {
    if (actor.role !== Role.TENANT_ADMIN) {
      throw new ForbiddenException('You are not allowed to manage users');
    }

    if (!actor.tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
  }

  private resolveCreateRole(actor: RequestUser, requestedRole?: Role) {
    const role = requestedRole ?? Role.CUSTOMER;

    if (actor.role === Role.PLATFORM_ADMIN) {
      return role;
    }

    this.ensureTenantAdmin(actor);

    if (role === Role.PLATFORM_ADMIN) {
      throw new ForbiddenException('Tenant admins cannot create platform admins');
    }

    return role;
  }

  private resolveUpdateRole(
    actor: RequestUser,
    requestedRole: Role | undefined,
    currentRole: Role,
  ) {
    const role = requestedRole ?? currentRole;

    if (actor.role === Role.PLATFORM_ADMIN) {
      return role;
    }

    this.ensureTenantAdmin(actor);

    if (role === Role.PLATFORM_ADMIN) {
      throw new ForbiddenException('Tenant admins cannot assign platform admins');
    }

    return role;
  }

  private resolveCreateTenantId(actor: RequestUser, requestedTenantId?: string | null) {
    if (actor.role === Role.PLATFORM_ADMIN) {
      return requestedTenantId ?? null;
    }

    this.ensureTenantAdmin(actor);
    return actor.tenantId;
  }

  private resolveUpdateTenantId(
    actor: RequestUser,
    requestedTenantId: string | null | undefined,
    currentTenantId: string | null,
  ) {
    if (actor.role === Role.PLATFORM_ADMIN) {
      return requestedTenantId === undefined ? currentTenantId : requestedTenantId;
    }

    this.ensureTenantAdmin(actor);
    return actor.tenantId;
  }

  private async assertEmailAvailable(email: string, userIdToIgnore?: string) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser && existingUser.id !== userIdToIgnore) {
      throw new ConflictException('Email is already used by another user');
    }

    const existingIdentity = await this.authIdentityRepository.findEmailIdentityByEmail(email);

    if (existingIdentity && existingIdentity.userId !== userIdToIgnore) {
      throw new ConflictException('Email is already registered');
    }
  }

  private async syncEmailIdentity(
    userId: string,
    email: string | null,
    password?: string,
  ) {
    const emailIdentity = await this.authIdentityRepository.findByUserIdAndProvider(
      userId,
      AuthProvider.EMAIL,
    );

    if (!emailIdentity) {
      if (!password) {
        return;
      }

      if (!email) {
        throw new BadRequestException('Email is required to create password credentials');
      }

      const passwordHash = await this.passwordHasher.hash(password);
      await this.authIdentityRepository.create({
        userId,
        provider: AuthProvider.EMAIL,
        email,
        passwordHash,
      });
      return;
    }

    if (email === null) {
      throw new BadRequestException(
        'Email credentials require a non-null email address',
      );
    }

    if (email !== undefined) {
      emailIdentity.setEmail(email);
    }

    if (password) {
      const passwordHash = await this.passwordHasher.hash(password);
      emailIdentity.setPasswordHash(passwordHash);
    }

    await this.authIdentityRepository.save(emailIdentity);
  }

  private parseBirthDate(value?: string | null) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === '') {
      return null;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('birthDate must be a valid date');
    }

    return parsed;
  }

  private toView(user: {
    id: string;
    getTenantId(): string | null;
    getEmail(): string | null;
    getName(): string;
    getImageUrl(): string | null;
    getAddress(): string | null;
    getBirthDate(): Date | null;
    getGender(): string | null;
    isEmailVerified(): boolean;
    getEmailVerifiedAt(): Date | null;
    isMarketingOptedIn(): boolean;
    getMarketingConsentAt(): Date | null;
    getTermsAcceptedAt(): Date | null;
    getPrivacyAcceptedAt(): Date | null;
    getRole(): Role;
    createdAt: Date;
    getUpdatedAt(): Date;
  }) {
    return {
      id: user.id,
      tenantId: user.getTenantId(),
      email: user.getEmail(),
      name: user.getName(),
      imageUrl: user.getImageUrl(),
      address: user.getAddress(),
      birthDate: user.getBirthDate(),
      gender: user.getGender(),
      emailVerified: user.isEmailVerified(),
      emailVerifiedAt: user.getEmailVerifiedAt(),
      marketingOptIn: user.isMarketingOptedIn(),
      marketingConsentAt: user.getMarketingConsentAt(),
      termsAcceptedAt: user.getTermsAcceptedAt(),
      privacyAcceptedAt: user.getPrivacyAcceptedAt(),
      role: user.getRole(),
      createdAt: user.createdAt,
      updatedAt: user.getUpdatedAt(),
    };
  }
}
