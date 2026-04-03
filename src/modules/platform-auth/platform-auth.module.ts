import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BcryptPasswordHasher } from '../auth/infrastructure/security/bcrypt-password-hasher';
import { PlatformAdminsController } from './api/platform-admins.controller';
import { PlatformAuthController } from './api/platform-auth.controller';
import { PlatformAdminsService } from './application/platform-admins.service';
import { PlatformAuthService } from './application/platform-auth.service';
import { PlatformAdminRepository } from './infrastructure/platform-admin.repository.postgres';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN),
      },
    }),
  ],
  controllers: [PlatformAuthController, PlatformAdminsController],
  providers: [
    PlatformAuthService,
    PlatformAdminsService,
    PlatformAdminRepository,
    BcryptPasswordHasher,
  ],
})
export class PlatformAuthModule {}
