import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { AuthOrchestrator } from './application/auth.orchestrator';
import { AuthController } from './api/auth.controller';
import { JwtStrategy } from './domain/strategies/jwt.strategy';
import { CustomersModule } from '../customers/customers.module';
import { CartModule } from '../cart/cart.module';
import { OAuthProviderFactory } from './infrastructure/oauth-provider.factory';
import { GoogleOAuthProvider } from './infrastructure/oauth/google.provider';
import { FacebookOAuthProvider } from './infrastructure/oauth/facebook.provider';
import { AppleOAuthProvider } from './infrastructure/oauth/apple.provider';
import { SessionService } from './application/session.service';
import { AUTH_INJECTION_TOKENS } from './constants/injection-tokens';
import { PostgresUserRepository } from './infrastructure/persistence/user.repository.postgres';
import { PostgresAuthIdentityRepository } from './infrastructure/persistence/auth-identity.repository.postgres';
import { PostgresSessionRepository } from './infrastructure/persistence/session.repository.postgres';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { SignupEmailUseCase } from './application/use-cases/signup-email.usecase';
import { LoginEmailUseCase } from './application/use-cases/login-email.usecase';
import { LoginOAuthUseCase } from './application/use-cases/login-oauth.usecase';
import { LogoutUseCase } from './application/use-cases/logout.usecase';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.usecase';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.usecase';
import { ResendVerificationUseCase } from './application/use-cases/resend-verification.usecase';
import { SendVerificationEmailUseCase } from './application/use-cases/email-verification.token.usecase';
import { VERIFY_MAIL_TOKEN } from './constants/verify-mail.tokens';
import { PostgresEmailVerificationTokenRepository } from './infrastructure/persistence/email-verification.token.repository.postgres';
import { ConsoleMailService } from './mail/console-mail.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN)
      },
    }),
    CustomersModule,
    CartModule,
  ],
  providers: [
    AuthService,
    AuthOrchestrator,
    JwtStrategy,
    OAuthProviderFactory,
    GoogleOAuthProvider,
    SessionService,
    SignupEmailUseCase,
    LoginEmailUseCase,
    LoginOAuthUseCase,
    LogoutUseCase,
    RefreshSessionUseCase,
    VerifyEmailUseCase,
    ResendVerificationUseCase,
    SendVerificationEmailUseCase,
    FacebookOAuthProvider,
    AppleOAuthProvider,
    {
      provide: AUTH_INJECTION_TOKENS.USER_REPOSITORY,
      useClass: PostgresUserRepository,
    },
    {
      provide: AUTH_INJECTION_TOKENS.AUTH_IDENTITY_REPOSITORY,
      useClass: PostgresAuthIdentityRepository,
    },
    {
      provide: AUTH_INJECTION_TOKENS.SESSION_REPOSITORY,
      useClass: PostgresSessionRepository,
    },
    {
      provide: AUTH_INJECTION_TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: VERIFY_MAIL_TOKEN.EMAIL_VERIFICATION_TOKEN_REPO,
      useClass: PostgresEmailVerificationTokenRepository,
    },
    {
      provide: VERIFY_MAIL_TOKEN.USER,
      useClass: PostgresUserRepository,
    },
    {
      provide: VERIFY_MAIL_TOKEN.MAIL_SERVICE,
      useClass: ConsoleMailService,
    }
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule { }
