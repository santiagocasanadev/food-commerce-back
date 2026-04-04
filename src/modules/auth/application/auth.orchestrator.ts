import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CartService } from 'src/modules/cart/application/cart.service';
import { CustomerContextService } from 'src/modules/customers/application/customer-context.service';
import { AuthService } from './auth.service';
import { AuthProvider } from '../domain/authProviders';

@Injectable()
export class AuthOrchestrator {
  private readonly logger = new Logger(AuthOrchestrator.name);

  constructor(
    private readonly authService: AuthService,
    private readonly customerContextService: CustomerContextService,
    private readonly cartService: CartService,
  ) { }

  async signupWithEmail(payload: {
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    guestId?: string | null;
  }) {
    const authResult = await this.authService.signupWithEmail({
      email: payload.email,
      password: payload.password,
      userAgent: payload.userAgent,
      ipAddress: payload.ipAddress,
    });
    return this.attachCustomerContext(authResult, payload.guestId);
  }

  async loginWithEmail(payload: {
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    guestId?: string | null;
  }) {
    const authResult = await this.authService.loginWithEmail({
      email: payload.email,
      password: payload.password,
      userAgent: payload.userAgent,
      ipAddress: payload.ipAddress,
    });

    return this.attachCustomerContext(authResult, payload.guestId);
  }

  async login(payload:
    | {
        type: 'email';
        email: string;
        password: string;
        userAgent?: string | null;
        ipAddress?: string | null;
        guestId?: string | null;
      }
    | {
        type: 'social';
        provider: AuthProvider;
        token: string;
        userAgent?: string | null;
        ipAddress?: string | null;
        guestId?: string | null;
      }) {
    const authResult = await this.authService.login(payload);

    return this.attachCustomerContext(authResult, payload.guestId);
  }

  async loginWithOAuth(payload: {
    provider: AuthProvider;
    token: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    guestId?: string | null;
  }) {
    const authResult = await this.authService.loginWithOAuth({
      provider: payload.provider,
      token: payload.token,
      userAgent: payload.userAgent,
      ipAddress: payload.ipAddress,
    });

    return this.attachCustomerContext(authResult, payload.guestId);
  }

  async refresh(payload: {
    refreshToken: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    return this.authService.refresh(payload);
  }

  async logout(payload: { refreshToken: string }) {
    return this.authService.logout(payload);
  }

  async listSessions(payload: { userId: string; currentSessionId?: string | null }) {
    const sessions = await this.authService.listSessions(payload.userId);

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      expiresAt: session.getExpiresAt(),
      current: payload.currentSessionId === session.id,
    }));
  }

  async revokeSession(payload: { userId: string; sessionId: string }) {
    return this.authService.revokeSession(payload.userId, payload.sessionId);
  }

  async requestPasswordReset(payload: { email: string }) {
    return this.authService.requestPasswordReset(payload.email);
  }

  async resetPassword(payload: { token: string; newPassword: string }) {
    return this.authService.resetPassword(payload);
  }

  async getPreferences(userId: string) {
    return this.authService.getPreferences(userId);
  }

  async updatePreferences(payload: {
    userId: string;
    marketingOptIn?: boolean;
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
  }) {
    return this.authService.updatePreferences(payload);
  }

  async listIdentities(userId: string) {
    const identities = await this.authService.listIdentities(userId);

    return identities.map((identity) => ({
      id: identity.id,
      provider: identity.provider,
      email: identity.email,
      linkedAt: identity.createdAt,
    }));
  }

  async linkIdentity(payload: {
    userId: string;
    provider: AuthProvider;
    token: string;
  }) {
    const identity = await this.authService.linkIdentity(payload);

    return {
      id: identity.id,
      provider: identity.provider,
      email: identity.email,
      linkedAt: identity.createdAt,
    };
  }

  getAuthMetrics() {
    return this.authService.getAuthMetrics();
  }

  private async attachCustomerContext(
    authResult: {
      userId: string;
      customerId: string | null;
      user?: { id: string; role?: string };
    },
    guestId?: string | null,
  ) {
    const requiresCustomer = authResult.user?.role === 'CUSTOMER';
    const customer =
      authResult.customerId || !requiresCustomer
        ? authResult.customerId
          ? { id: authResult.customerId }
          : null
        : await this.customerContextService.ensureCustomerByUserId(authResult.userId);
    if (guestId && customer) {
      try {
        await this.cartService.mergeCart(guestId, customer.id);
      } catch (error) {
        if (isMissingGuestCartError(error)) {
          this.logger.warn(
            `Guest cart merge skipped for guestId "${guestId}" and customer "${customer.id}" because no active guest cart exists`,
          );
        } else {
          throw error;
        }
      }
    }
    return {
      ...authResult,
      customerId: customer?.id ?? null,
    };
  }
}

function isMissingGuestCartError(error: unknown) {
  if (!(error instanceof BadRequestException)) {
    return false;
  }

  const response = error.getResponse();
  const message =
    typeof response === 'string'
      ? response
      : Array.isArray((response as any)?.message)
      ? (response as any).message.join(' ')
      : (response as any)?.message;

  return typeof message === 'string' && message.includes('No active cart for guest');
}
