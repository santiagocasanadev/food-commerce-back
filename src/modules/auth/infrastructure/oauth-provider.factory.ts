import { Injectable } from "@nestjs/common";
import { AuthProvider } from "../domain/authProviders";
import { OAuthProvider } from "../domain/oauth/oauth-provider.interface";
import { GoogleOAuthProvider } from "./oauth/google.provider";
import { FacebookOAuthProvider } from "./oauth/facebook.provider";
import { AppleOAuthProvider } from "./oauth/apple.provider";

@Injectable()
export class OAuthProviderFactory {

  constructor(
    private readonly google: GoogleOAuthProvider,
    private readonly facebook: FacebookOAuthProvider,
    private readonly apple: AppleOAuthProvider,
  ) { }

  get(provider: AuthProvider): OAuthProvider {

    switch (provider) {

      case AuthProvider.GOOGLE:
        return this.google;

      case AuthProvider.FACEBOOK:
        return this.facebook;

      case AuthProvider.APPLE:
        return this.apple;

      default:
        throw new Error('Invalid provider');
    }
  }
}
