import { AuthProvider } from "../authProviders";

export class AuthIdentity {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly provider: AuthProvider,
    readonly providerUserId: string | null,
    readonly email: string | null,
    private passwordHash: string | null,
    readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  getPasswordHash(): string | null {
    return this.passwordHash;
  }

  setPasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
