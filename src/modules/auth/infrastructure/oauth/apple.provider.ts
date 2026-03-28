import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { AuthProvider } from '../../domain/authProviders';
import {
  OAuthProvider,
  OAuthUserProfile,
} from '../../domain/oauth/oauth-provider.interface';

@Injectable()
export class AppleOAuthProvider implements OAuthProvider {
  readonly provider = AuthProvider.APPLE;

  async validateToken(idToken: string): Promise<OAuthUserProfile> {
    const keysResponse = await fetch('https://appleid.apple.com/auth/keys');
    const keysPayload = (await keysResponse.json()) as {
      keys: Array<Record<string, unknown>>;
    };

    const decodedHeader = jwt.decode(idToken, { complete: true }) as
      | { header?: { kid?: string } }
      | null;

    if (!decodedHeader?.header?.kid) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    const key = keysPayload.keys.find(
      (currentKey: any) => currentKey.kid === decodedHeader.header!.kid,
    );

    if (!key) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    const publicKey = jwkToPem(key as any);
    const payload = jwt.verify(idToken, publicKey) as jwt.JwtPayload;

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    return {
      provider: AuthProvider.APPLE,
      providerUserId: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : null,
      name: null,
      avatarUrl: null,
      emailVerified: typeof payload.email_verified === 'boolean'
        ? payload.email_verified
        : payload.email_verified === 'true',
    };
  }
}
