import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthProvider } from '../../domain/authProviders';
import {
  OAuthProvider,
  OAuthUserProfile,
} from '../../domain/oauth/oauth-provider.interface';

@Injectable()
export class FacebookOAuthProvider implements OAuthProvider {
  readonly provider = AuthProvider.FACEBOOK;

  async validateToken(accessToken: string): Promise<OAuthUserProfile> {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
    );

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    const data = (await response.json()) as {
      id?: string;
      name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    };

    if (!data.id) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    return {
      provider: AuthProvider.FACEBOOK,
      providerUserId: data.id,
      email: data.email ?? null,
      name: data.name ?? null,
      avatarUrl: data.picture?.data?.url ?? null,
      emailVerified: Boolean(data.email),
    };
  }
}
