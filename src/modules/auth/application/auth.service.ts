import { Injectable } from '@nestjs/common';
import { AuthProvider } from '../domain/authProviders';
import { AuthTelemetryService } from './auth-telemetry.service';
import { GetAuthPreferencesUseCase } from './use-cases/get-auth-preferences.usecase';
import { LinkOAuthIdentityUseCase } from './use-cases/link-oauth-identity.usecase';
import { LoginEmailUseCase } from './use-cases/login-email.usecase';
import { LoginOAuthUseCase } from './use-cases/login-oauth.usecase';
import { ListIdentitiesUseCase } from './use-cases/list-identities.usecase';
import { LogoutUseCase } from './use-cases/logout.usecase';
import { RequestPasswordResetUseCase } from './use-cases/request-password-reset.usecase';
import { RefreshSessionUseCase } from './use-cases/refresh-session.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { SignupEmailUseCase } from './use-cases/signup-email.usecase';
import { UpdateAuthPreferencesUseCase } from './use-cases/update-auth-preferences.usecase';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly signupEmailUseCase: SignupEmailUseCase,
    private readonly loginEmailUseCase: LoginEmailUseCase,
    private readonly loginOAuthUseCase: LoginOAuthUseCase,
    private readonly getAuthPreferencesUseCase: GetAuthPreferencesUseCase,
    private readonly updateAuthPreferencesUseCase: UpdateAuthPreferencesUseCase,
    private readonly listIdentitiesUseCase: ListIdentitiesUseCase,
    private readonly linkOAuthIdentityUseCase: LinkOAuthIdentityUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly sessionService: SessionService,
    private readonly telemetry: AuthTelemetryService,
  ) {}

  async signupWithEmail(payload: {
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.telemetry.track('SignupEmailUseCase', {}, () =>
      this.signupEmailUseCase.execute(payload),
    );
  }

  async loginWithEmail(payload: {
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.telemetry.track('LoginEmailUseCase', {}, () =>
      this.loginEmailUseCase.execute(payload),
    );
  }

  async loginWithOAuth(payload: {
    provider: AuthProvider;
    token: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.telemetry.track(
      'LoginOAuthUseCase',
      { provider: payload.provider },
      () => this.loginOAuthUseCase.execute(payload),
    );
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
      return this.telemetry.track('UnifiedLoginEmail', {}, () =>
        this.loginEmailUseCase.execute(payload),
      );
    }

    return this.telemetry.track(
      'UnifiedLoginSocial',
      { provider: payload.provider },
      () => this.loginOAuthUseCase.execute(payload),
    );
  }

  async refresh(payload: {
    refreshToken: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.telemetry.track('RefreshSessionUseCase', {}, () =>
      this.refreshSessionUseCase.execute(payload),
    );
  }

  async logout(payload: { refreshToken: string }) {
    return this.telemetry.track('LogoutUseCase', {}, () =>
      this.logoutUseCase.execute(payload),
    );
  }

  async listSessions(userId: string) {
    return this.telemetry.track('ListSessions', { userId }, () =>
      this.sessionService.listUserSessions(userId),
    );
  }

  async revokeSession(userId: string, sessionId: string) {
    return this.telemetry.track(
      'RevokeSession',
      { userId, sessionId },
      async () => {
        await this.sessionService.revokeSession(userId, sessionId);
        return { success: true };
      },
    );
  }

  async requestPasswordReset(email: string) {
    return this.telemetry.track('RequestPasswordResetUseCase', {}, () =>
      this.requestPasswordResetUseCase.execute(email),
    );
  }

  async resetPassword(payload: { token: string; newPassword: string }) {
    return this.telemetry.track('ResetPasswordUseCase', {}, () =>
      this.resetPasswordUseCase.execute(payload),
    );
  }

  async listIdentities(userId: string) {
    return this.telemetry.track('ListIdentitiesUseCase', { userId }, () =>
      this.listIdentitiesUseCase.execute(userId),
    );
  }

  async linkIdentity(payload: {
    userId: string;
    provider: AuthProvider;
    token: string;
  }) {
    return this.telemetry.track(
      'LinkOAuthIdentityUseCase',
      { userId: payload.userId, provider: payload.provider },
      () => this.linkOAuthIdentityUseCase.execute(payload),
    );
  }

  async getPreferences(userId: string) {
    return this.telemetry.track('GetAuthPreferencesUseCase', { userId }, () =>
      this.getAuthPreferencesUseCase.execute(userId),
    );
  }

  async updatePreferences(payload: {
    userId: string;
    marketingOptIn?: boolean;
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
  }) {
    return this.telemetry.track(
      'UpdateAuthPreferencesUseCase',
      { userId: payload.userId },
      () => this.updateAuthPreferencesUseCase.execute(payload),
    );
  }

  getAuthMetrics() {
    return this.telemetry.getMetrics();
  }
}
