import { Role } from "src/security/roles.enum";

export class User {
  constructor(
    readonly id: string,
    private tenantId: string | null,
    private email: string | null,
    private name: string,
    private imageUrl: string | null,
    private address: string | null,
    private birthDate: Date | null,
    private gender: string | null,
    private emailVerified: boolean,
    private emailVerifiedAt: Date | null,
    private marketingOptIn: boolean,
    private marketingConsentAt: Date | null,
    private termsAcceptedAt: Date | null,
    private privacyAcceptedAt: Date | null,
    readonly createdAt: Date,
    private updatedAt: Date,
    private role: Role,
  ) { }

  getEmail(): string | null {
    return this.email;
  }

  getTenantId(): string | null {
    return this.tenantId;
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

  getEmailVerifiedAt(): Date | null {
    return this.emailVerifiedAt;
  }

  isMarketingOptedIn(): boolean {
    return this.marketingOptIn;
  }

  getMarketingConsentAt(): Date | null {
    return this.marketingConsentAt;
  }

  getTermsAcceptedAt(): Date | null {
    return this.termsAcceptedAt;
  }

  getPrivacyAcceptedAt(): Date | null {
    return this.privacyAcceptedAt;
  }

  verifyEmail() {
    if (this.emailVerified) return;
    this.emailVerified = true;
    this.emailVerifiedAt = new Date();
  }

  isEmailVerified() {
    return this.emailVerified;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateProfile(data: {
    tenantId?: string | null;
    role?: Role;
    email?: string | null;
    name?: string | null;
    imageUrl?: string | null;
    address?: string | null;
    birthDate?: Date | null;
    gender?: string | null;
    emailVerified?: boolean;
    emailVerifiedAt?: Date | null;
    marketingOptIn?: boolean;
    marketingConsentAt?: Date | null;
    termsAcceptedAt?: Date | null;
    privacyAcceptedAt?: Date | null;
  }) {
    if (data.tenantId !== undefined) {
      this.tenantId = data.tenantId;
    }

    if (data.role !== undefined) {
      this.role = data.role;
    }

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

    if (data.emailVerifiedAt !== undefined) {
      this.emailVerifiedAt = data.emailVerifiedAt;
    }

    if (typeof data.marketingOptIn === 'boolean') {
      this.marketingOptIn = data.marketingOptIn;
    }

    if (data.marketingConsentAt !== undefined) {
      this.marketingConsentAt = data.marketingConsentAt;
    }

    if (data.termsAcceptedAt !== undefined) {
      this.termsAcceptedAt = data.termsAcceptedAt;
    }

    if (data.privacyAcceptedAt !== undefined) {
      this.privacyAcceptedAt = data.privacyAcceptedAt;
    }

    this.updatedAt = new Date();
  }

  updatePreferences(data: {
    marketingOptIn?: boolean;
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
  }) {
    const now = new Date();

    if (typeof data.marketingOptIn === 'boolean') {
      this.marketingOptIn = data.marketingOptIn;
      if (data.marketingOptIn) {
        this.marketingConsentAt = now;
      }
    }

    if (data.acceptTerms) {
      this.termsAcceptedAt = this.termsAcceptedAt ?? now;
    }

    if (data.acceptPrivacy) {
      this.privacyAcceptedAt = this.privacyAcceptedAt ?? now;
    }

    this.updatedAt = now;
  }
}
