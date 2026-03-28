import { Role } from 'src/security/roles.enum';
import { Inject, Injectable } from '@nestjs/common';
import { AUTH_INJECTION_TOKENS } from '../../constants/injection-tokens';
import { AuthProvider } from '../../domain/authProviders';
import type { AuthIdentityRepository } from '../../domain/repositories/auth-identity.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { OAuthProviderFactory } from '../../infrastructure/oauth-provider.factory';
import { AuthResponsePresenter } from '../presenters/auth-response.presenter';
import { SessionService } from '../session.service';

@Injectable()
export class LoginOAuthUseCase {
  constructor(
    private readonly oauthProviderFactory: OAuthProviderFactory,
    @Inject(AUTH_INJECTION_TOKENS.AUTH_IDENTITY_REPOSITORY)
    private readonly authIdentityRepository: AuthIdentityRepository,
    @Inject(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
  ) {}

  async execute(input: {
    provider: AuthProvider;
    token: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    const oauthProvider = this.oauthProviderFactory.get(input.provider);
    const profile = await oauthProvider.validateToken(input.token);

    let identity = await this.authIdentityRepository.findByProviderUserId(
      input.provider,
      profile.providerUserId,
    );

    let user = identity
      ? await this.userRepository.findById(identity.userId)
      : null;

    if (!user && profile.email) {
      user = await this.userRepository.findByEmail(profile.email.toLowerCase());
    }

    if (!user) {
      user = await this.userRepository.create({
        email: profile.email ? profile.email.toLowerCase() : null,
        name: profile.name ?? this.buildFallbackName(profile.email, input.provider),
        avatarUrl: profile.avatarUrl ?? null,
        role: Role.CUSTOMER,
        emailVerified: profile.emailVerified,
      });
    } else {
      user.updateProfile({
        email: profile.email ? profile.email.toLowerCase() : user.getEmail(),
        name: profile.name ?? user.getName(),
        avatarUrl: profile.avatarUrl ?? user.getAvatarUrl(),
        emailVerified: profile.emailVerified,
      });
      await this.userRepository.save(user);
    }

    if (!identity) {
      identity = await this.authIdentityRepository.create({
        userId: user.id,
        provider: input.provider,
        providerUserId: profile.providerUserId,
        email: profile.email ? profile.email.toLowerCase() : null,
      });
    }

    const session = await this.sessionService.createSession({
      userId: user.id,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    return AuthResponsePresenter.withUserAndIdentity(session, user, identity);
  }

  private buildFallbackName(
    email: string | null,
    provider: AuthProvider,
  ): string {
    if (email) {
      return email.split('@')[0];
    }

    return `${provider}-user`;
  }
}
