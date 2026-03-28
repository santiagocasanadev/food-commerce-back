import { AuthSession } from "../entities/auth-session.identity";

export interface SessionRepository {
  create(data: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }): Promise<AuthSession>;

  findById(id: string): Promise<AuthSession | null>;

  findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSession | null>;

  delete(id: string): Promise<void>;

  deleteByRefreshTokenHash(refreshTokenHash: string): Promise<void>;
}
