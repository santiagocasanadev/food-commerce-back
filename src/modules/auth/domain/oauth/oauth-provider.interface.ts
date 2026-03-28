import { AuthProvider } from "../authProviders";

export type OAuthUserProfile = {
  provider: AuthProvider;
  providerUserId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
};

export interface OAuthProvider {
  readonly provider: AuthProvider;
  validateToken(token: string): Promise<OAuthUserProfile>;
}
