import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshToken } from 'src/modules/auth/domain/refresh-token.entity';
import type { RefreshTokenRepository } from '../domain/refresh-token.repository';
import type { CustomerRepository } from 'src/modules/customers/domain/customers.repository';
import { GoogleAuthService } from './google-auth.service';
import { CartService } from 'src/modules/cart/application/cart.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cartService: CartService,
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    private readonly googleAuthService: GoogleAuthService
  ) {}

  async login(userId: string, guestId?: string) {
    
    const customer = await this.customerRepository.findById(userId);

    if (!customer) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: customer.id,
      role: customer.role
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const entity = new RefreshToken(
      crypto.randomUUID(),
      userId,
      tokenHash,
      expiresAt,
      false
    );

    await this.refreshTokenRepository.save(entity);

    if (guestId) {
      await this.cartService.mergeCart(
        guestId,
        customer.id
      );
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored =
      await this.refreshTokenRepository.findByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedException();
    }

    if (stored.isExpired() || stored.isRevoked()) {
      throw new UnauthorizedException();
    }

    //ROTATION: revocar el actual
    stored.revoke();
    await this.refreshTokenRepository.save(stored);

    //generar nuevo refresh
    const newRefreshToken = this.generateRefreshToken();
    const newHash = this.hashToken(newRefreshToken);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    const newEntity = new RefreshToken(
      crypto.randomUUID(),
      stored.userId,
      newHash,
      newExpiresAt,
      false
    );

    await this.refreshTokenRepository.save(newEntity);

    const customer =
      await this.customerRepository.findById(stored.userId);

    if (!customer) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: customer.id,
      role: customer.role
    };

    const newAccessToken = this.jwtService.sign(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }


  async logout(userId: string, refreshToken: string) {
  const tokenHash = this.hashToken(refreshToken);
  const stored =
    await this.refreshTokenRepository.findByHash(tokenHash);

  if (!stored || stored.userId !== userId)
    throw new UnauthorizedException();

  stored.revoke();

  await this.refreshTokenRepository.save(stored);
  return { success: true };
}

  async loginWithGoogle(idToken: string) {

    const googleUser =
      await this.googleAuthService.verifyIdToken(idToken);

    // 1️⃣ Buscar usuario por email
    let customer =
      await this.customerRepository.findByEmail(googleUser.email);

    // 2️⃣ Si no existe → crear
    if (!customer) {
      if (!googleUser.email || !googleUser.name || !googleUser.googleId) {
        throw new Error('Missing required Google user fields');
      }
      customer = await this.customerRepository.createFromGoogle({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
      });
    }

    // 3️⃣ Generar JWT normal
    return this.login(customer.id);
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

}

