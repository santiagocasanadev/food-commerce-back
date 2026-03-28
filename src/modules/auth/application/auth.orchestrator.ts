import { Injectable } from '@nestjs/common';
import { CartService } from 'src/modules/cart/application/cart.service';
import { CustomerContextService } from 'src/modules/customers/application/customer-context.service';
import { AuthService } from './auth.service';
import { AuthProvider } from '../domain/authProviders';

@Injectable()
export class AuthOrchestrator {
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

  private async attachCustomerContext(
    authResult: { userId: string; customerId: string | null; user?: { id: string } },
    guestId?: string | null,
  ) {
    const customer =
      authResult.customerId
        ? { id: authResult.customerId }
        : await this.customerContextService.ensureCustomerByUserId(authResult.userId);
    if (guestId) {
      await this.cartService.mergeCart(guestId, customer.id);
    }
    return {
      ...authResult,
      customerId: customer.id,
    };
  }
}
