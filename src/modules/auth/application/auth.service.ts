import { Injectable } from '@nestjs/common';
import { AuthProvider } from '../domain/authProviders';
import { LoginEmailUseCase } from './use-cases/login-email.usecase';
import { LoginOAuthUseCase } from './use-cases/login-oauth.usecase';
import { LogoutUseCase } from './use-cases/logout.usecase';
import { RefreshSessionUseCase } from './use-cases/refresh-session.usecase';
import { SignupEmailUseCase } from './use-cases/signup-email.usecase';

@Injectable()
export class AuthService {
  constructor(
    private readonly signupEmailUseCase: SignupEmailUseCase,
    private readonly loginEmailUseCase: LoginEmailUseCase,
    private readonly loginOAuthUseCase: LoginOAuthUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  async signupWithEmail(payload: {
    email: string;
    password: string;
    name?: string;
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
}
