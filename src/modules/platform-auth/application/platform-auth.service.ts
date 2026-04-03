import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BcryptPasswordHasher } from 'src/modules/auth/infrastructure/security/bcrypt-password-hasher';
import { Role } from 'src/security/roles.enum';
import { PlatformAdminRepository } from '../infrastructure/platform-admin.repository.postgres';

@Injectable()
export class PlatformAuthService {
  constructor(
    private readonly platformAdminRepository: PlatformAdminRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: { email: string; password: string }) {
    const admin = await this.platformAdminRepository.findByEmail(
      payload.email.trim().toLowerCase(),
    );

    if (!admin) {
      throw new UnauthorizedException('Invalid platform credentials');
    }

    if (!admin.active) {
      throw new ForbiddenException('Platform admin is inactive');
    }

    const passwordMatches = await this.passwordHasher.compare(
      payload.password,
      admin.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid platform credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: admin.id,
      role: Role.PLATFORM_ADMIN,
      platformScope: true,
    });

    return {
      accessToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: Role.PLATFORM_ADMIN,
      },
    };
  }

  async me(userId: string) {
    const admin = await this.platformAdminRepository.findById(userId);

    if (!admin) {
      throw new UnauthorizedException('Platform admin not found');
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: Role.PLATFORM_ADMIN,
      active: admin.active,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
