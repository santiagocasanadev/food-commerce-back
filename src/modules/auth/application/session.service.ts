import * as crypto from 'crypto';
import { Inject, Injectable } from "@nestjs/common";
import type { SessionRepository } from "../domain/repositories/auth-session.repository";
import { AuthSession } from '../domain/entities/auth-session.identity';
import { AUTH_INJECTION_TOKENS } from "../constants/injection-tokens";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SessionService {
  constructor(
    @Inject(AUTH_INJECTION_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,
    private readonly jwtService: JwtService,
  ) { }

  async createSession(params: {
    userId: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    console.log('Creating session for userId:', params.userId);
    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hash(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    console.log('Creating session in repository');

    await this.sessionRepo.create({
      id: crypto.randomUUID(),
      userId: params.userId,
      refreshTokenHash,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      expiresAt,
    });
    console.log('Session created in repository');

    const accessToken = this.jwtService.sign({
      sub: params.userId,
    });

    return {
      accessToken,
      refreshToken,
      expiresAt,
      userId: params.userId,
    };
  }

  async refreshSession(params: {
    refreshToken: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    const currentTokenHash = this.hash(params.refreshToken);
    const session = await this.sessionRepo.findByRefreshTokenHash(currentTokenHash);

    if (!session) {
      return null;
    }

    if (session.isExpired()) {
      await this.sessionRepo.delete(session.id);
      return null;
    }

    await this.sessionRepo.delete(session.id);

    return this.createSession({
      userId: session.userId,
      userAgent: params.userAgent ?? session.userAgent,
      ipAddress: params.ipAddress ?? session.ipAddress,
    });
  }

  async invalidateSession(refreshToken: string): Promise<void> {
    await this.sessionRepo.deleteByRefreshTokenHash(this.hash(refreshToken));
  }

  async validateSession(sessionId: string): Promise<AuthSession | null> {
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      return null;
    }

    if (session.isExpired()) {
      await this.sessionRepo.delete(session.id);
      return null;
    }

    return session;
  }
  private generateRefreshToken(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  private hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
