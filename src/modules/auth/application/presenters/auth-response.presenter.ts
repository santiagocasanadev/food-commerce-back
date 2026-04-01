import { AuthIdentity } from '../../domain/entities/auth-identity.entity';
import { User } from '../../domain/entities/user.entity';

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userId: string;
  sessionId: string;
  customerId: string | null;
  tenantId: string | null;
};

export class AuthResponsePresenter {
  static withUser(session: SessionTokens, user: User) {
    return {
      ...session,
      user: this.user(user),
    };
  }

  static withUserAndIdentity(
    session: SessionTokens,
    user: User,
    identity: AuthIdentity,
  ) {
    return {
      ...this.withUser(session, user),
      identity: {
        id: identity.id,
        provider: identity.provider,
      },
    };
  }

  private static user(user: User) {
    return {
      id: user.id,
      tenantId: user.getTenantId(),
      email: user.getEmail(),
      name: user.getName(),
      imageUrl: user.getImageUrl(),
      address: user.getAddress(),
      birthDate: user.getBirthDate(),
      gender: user.getGender(),
      emailVerified: user.isEmailVerified(),
      emailVerifiedAt: user.getEmailVerifiedAt(),
      marketingOptIn: user.isMarketingOptedIn(),
      marketingConsentAt: user.getMarketingConsentAt(),
      termsAcceptedAt: user.getTermsAcceptedAt(),
      privacyAcceptedAt: user.getPrivacyAcceptedAt(),
      role: user.getRole(),
    };
  }
}
