export class AuthSession {
  constructor(
    readonly id: string,
    readonly userId: string,
    private refreshTokenHash: string,
    readonly userAgent: string | null,
    readonly ipAddress: string | null,
    private expiresAt: Date,
    readonly createdAt: Date,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  getRefreshTokenHash(): string {
    return this.refreshTokenHash;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  rotate(refreshTokenHash: string, expiresAt: Date) {
    this.refreshTokenHash = refreshTokenHash;
    this.expiresAt = expiresAt;
  }
}
