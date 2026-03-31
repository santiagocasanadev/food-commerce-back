import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AUTH_INJECTION_TOKENS } from '../../constants/injection-tokens';
import { AuthProvider } from '../../domain/authProviders';
import type { AuthIdentityRepository } from '../../domain/repositories/auth-identity.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { OAuthProviderFactory } from '../../infrastructure/oauth-provider.factory';

@Injectable()
export class LinkOAuthIdentityUseCase {
  constructor(
    private readonly oauthProviderFactory: OAuthProviderFactory,
    @Inject(AUTH_INJECTION_TOKENS.AUTH_IDENTITY_REPOSITORY)
    private readonly authIdentityRepository: AuthIdentityRepository,
    @Inject(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: {
    userId: string;
    provider: AuthProvider;
    token: string;
  }) {
    if (input.provider === AuthProvider.EMAIL) {
      throw new ConflictException('Email provider cannot be linked via OAuth');
    }

    const oauthProvider = this.oauthProviderFactory.get(input.provider);
    const profile = await oauthProvider.validateToken(input.token);

    const linkedToProvider = await this.authIdentityRepository.findByProviderUserId(
      input.provider,
      profile.providerUserId,
    );

    if (linkedToProvider && linkedToProvider.userId !== input.userId) {
      throw new ConflictException('This social account is already linked to another user');
    }

    const existingIdentity =
      await this.authIdentityRepository.findByUserIdAndProvider(
        input.userId,
        input.provider,
      );

    if (existingIdentity) {
      if (existingIdentity.providerUserId !== profile.providerUserId) {
        throw new ConflictException('This provider is already linked to another social account');
      }

      return existingIdentity;
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new ConflictException('User not found');
    }

    const normalizedEmail = profile.email?.toLowerCase() ?? null;
    user.updateProfile({
      email:
        user.getEmail() ?? normalizedEmail,
      imageUrl: profile.avatarUrl ?? user.getImageUrl(),
      emailVerified:
        normalizedEmail !== null && normalizedEmail === user.getEmail()
          ? profile.emailVerified
          : false,
    });
    await this.userRepository.save(user);

    return this.authIdentityRepository.create({
      userId: input.userId,
      provider: input.provider,
      providerUserId: profile.providerUserId,
      email: normalizedEmail,
    });
  }
}
