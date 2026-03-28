import { Role } from "src/security/roles.enum";

export class User {
  constructor(
    readonly id: string,
    private email: string | null,
    private name: string,
    private avatarUrl: string | null,
    private emailVerified: boolean,
    readonly createdAt: Date,
    private updatedAt: Date,
    private role: Role,
  ) { }

  getEmail(): string | null {
    return this.email;
  }

  getRole(): Role {
    return this.role;
  }

  getName(): string {
    return this.name;
  }

  getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  verifyEmail() {
    if (this.emailVerified) return;
    this.emailVerified = true;
  }

  isEmailVerified() {
    return this.emailVerified;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateProfile(data: {
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    emailVerified?: boolean;
  }) {
    if (data.email !== undefined) {
      this.email = data.email;
    }

    if (data.name) {
      this.name = data.name;
    }

    if (data.avatarUrl !== undefined) {
      this.avatarUrl = data.avatarUrl;
    }

    if (typeof data.emailVerified === 'boolean') {
      this.emailVerified = this.emailVerified || data.emailVerified;
    }

    this.updatedAt = new Date();
  }
}
