import { AuthProvider } from "../authProviders";

export class AuthIdentity {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly provider: AuthProvider,
    readonly providerUserId: string | null,
    email: string | null,
    private passwordHash: string | null,
    readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    this.email = email;
  }

  email: string | null;

  getPasswordHash(): string | null {
    return this.passwordHash;
  }

  setEmail(email: string | null) {
    this.email = email;
    this.updatedAt = new Date();
  }

  setPasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
