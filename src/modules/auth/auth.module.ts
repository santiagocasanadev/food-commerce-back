import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PostgresRefreshTokenRepository } from './infrastructure/refresh-token.repository.postgres';
import { CustomersModule } from '../customers/customers.module';
import { GoogleAuthService } from './application/google-auth.service';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN)
      },
    }),
    CustomersModule,
    CartModule
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleAuthService,
    {
      provide: 'RefreshTokenRepository',
      useClass: PostgresRefreshTokenRepository,
    },
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule { }
