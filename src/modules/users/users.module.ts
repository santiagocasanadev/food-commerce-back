import { Module } from '@nestjs/common';
import { PostgresAuthIdentityRepository } from '../auth/infrastructure/persistence/auth-identity.repository.postgres';
import { PostgresUserRepository } from '../auth/infrastructure/persistence/user.repository.postgres';
import { BcryptPasswordHasher } from '../auth/infrastructure/security/bcrypt-password-hasher';
import { CustomersModule } from '../customers/customers.module';
import { UsersService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { AdminUsersController } from './admin/admin-users.controller';

@Module({
  imports: [CustomersModule],
  controllers: [UsersController, AdminUsersController],
  providers: [
    UsersService,
    PostgresUserRepository,
    PostgresAuthIdentityRepository,
    BcryptPasswordHasher,
  ],
})
export class UsersModule {}
