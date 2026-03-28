import { Role } from "src/security/roles.enum";

export class User {
  constructor(
    readonly id: string,
    private email: string | null,
    private name: string,
    private imageUrl: string | null,
    private address: string | null,
    private birthDate: Date | null,
    private gender: string | null,
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

  getImageUrl(): string | null {
    return this.imageUrl;
  }

  getAddress(): string | null {
    return this.address;
  }

  getBirthDate(): Date | null {
    return this.birthDate;
  }

  getGender(): string | null {
    return this.gender;
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
    imageUrl?: string | null;
    address?: string | null;
    birthDate?: Date | null;
    gender?: string | null;
    emailVerified?: boolean;
  }) {
    if (data.email !== undefined) {
      this.email = data.email;
    }

    if (data.name !== undefined && data.name !== null) {
      this.name = data.name;
    }

    if (data.imageUrl !== undefined) {
      this.imageUrl = data.imageUrl;
    }

    if (data.address !== undefined) {
      this.address = data.address;
    }

    if (data.birthDate !== undefined) {
      this.birthDate = data.birthDate;
    }

    if (data.gender !== undefined) {
      this.gender = data.gender;
    }

    if (typeof data.emailVerified === 'boolean') {
      this.emailVerified = this.emailVerified || data.emailVerified;
    }

    this.updatedAt = new Date();
  }
}
