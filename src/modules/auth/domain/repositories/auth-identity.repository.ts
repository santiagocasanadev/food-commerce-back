import { AuthProvider } from "../authProviders";
import { AuthIdentity } from "../entities/auth-identity.entity";

export interface AuthIdentityRepository {
  findByUserId(userId: string): Promise<AuthIdentity[]>;

  findByUserIdAndProvider(
    userId: string,
    provider: AuthProvider
  ): Promise<AuthIdentity | null>;

  findByProviderUserId(
    provider: AuthProvider,
    providerUserId: string
  ): Promise<AuthIdentity | null>;

  findEmailIdentityByEmail(email: string): Promise<AuthIdentity | null>;

  create(data: {
    userId: string;
    provider: AuthProvider;
    providerUserId?: string | null;
    email?: string | null;
    passwordHash?: string | null;
  }): Promise<AuthIdentity>;

  save(identity: AuthIdentity): Promise<void>;
}
