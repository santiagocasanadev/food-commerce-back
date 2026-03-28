import { Role } from 'src/security/roles.enum';
import { AuthIdentity } from '../../domain/entities/auth-identity.entity';
import { User } from '../../domain/entities/user.entity';

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userId: string;
};

export class AuthResponsePresenter {
  static withUser(session: SessionTokens, user: User) {
    console.log('Mapping session response with user data for userId:', user.id);
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
      email: user.getEmail(),
      name: user.getName(),
      avatarUrl: user.getAvatarUrl(),
      emailVerified: user.isEmailVerified(),
    };
  }
}
