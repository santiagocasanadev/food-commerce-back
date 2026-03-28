import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthProvider } from '../../domain/authProviders';
import {
  OAuthProvider,
  OAuthUserProfile,
} from '../../domain/oauth/oauth-provider.interface';

@Injectable()
export class GoogleOAuthProvider implements OAuthProvider {
  readonly provider = AuthProvider.GOOGLE;
  private readonly client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async validateToken(idToken: string): Promise<OAuthUserProfile> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return {
      provider: AuthProvider.GOOGLE,
      providerUserId: payload.sub,
      email: payload.email ?? null,
      name: payload.name ?? null,
      avatarUrl: payload.picture ?? null,
      emailVerified: Boolean(payload.email_verified),
    };
  }
}
