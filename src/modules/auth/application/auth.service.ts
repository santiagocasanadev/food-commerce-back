import { Injectable } from '@nestjs/common';
import { AuthProvider } from '../domain/authProviders';
import { LinkOAuthIdentityUseCase } from './use-cases/link-oauth-identity.usecase';
import { LoginEmailUseCase } from './use-cases/login-email.usecase';
import { LoginOAuthUseCase } from './use-cases/login-oauth.usecase';
import { ListIdentitiesUseCase } from './use-cases/list-identities.usecase';
import { LogoutUseCase } from './use-cases/logout.usecase';
import { RequestPasswordResetUseCase } from './use-cases/request-password-reset.usecase';
import { RefreshSessionUseCase } from './use-cases/refresh-session.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { SignupEmailUseCase } from './use-cases/signup-email.usecase';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly signupEmailUseCase: SignupEmailUseCase,
    private readonly loginEmailUseCase: LoginEmailUseCase,
    private readonly loginOAuthUseCase: LoginOAuthUseCase,
    private readonly listIdentitiesUseCase: ListIdentitiesUseCase,
    private readonly linkOAuthIdentityUseCase: LinkOAuthIdentityUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly sessionService: SessionService,
  ) {}

  async signupWithEmail(payload: {
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.signupEmailUseCase.execute(payload);
  }

  async loginWithEmail(payload: {
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.loginEmailUseCase.execute(payload);
  }

  async loginWithOAuth(payload: {
    provider: AuthProvider;
    token: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.loginOAuthUseCase.execute(payload);
  }

  async login(payload:
    | {
        type: 'email';
        email: string;
        password: string;
        userAgent?: string | null;
        ipAddress?: string | null;
      }
    | {
        type: 'social';
        provider: AuthProvider;
        token: string;
        userAgent?: string | null;
        ipAddress?: string | null;
      }) {
    if (payload.type === 'email') {
      return this.loginEmailUseCase.execute(payload);
    }

    return this.loginOAuthUseCase.execute(payload);
  }

  async refresh(payload: {
    refreshToken: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.refreshSessionUseCase.execute(payload);
  }

  async logout(payload: { refreshToken: string }) {
    return this.logoutUseCase.execute(payload);
  }

  async listSessions(userId: string) {
    return this.sessionService.listUserSessions(userId);
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.sessionService.revokeSession(userId, sessionId);
    return { success: true };
  }

  async requestPasswordReset(email: string) {
    return this.requestPasswordResetUseCase.execute(email);
  }

  async resetPassword(payload: { token: string; newPassword: string }) {
    return this.resetPasswordUseCase.execute(payload);
  }

  async listIdentities(userId: string) {
    return this.listIdentitiesUseCase.execute(userId);
  }

  async linkIdentity(payload: {
    userId: string;
    provider: AuthProvider;
    token: string;
  }) {
    return this.linkOAuthIdentityUseCase.execute(payload);
  }
}
