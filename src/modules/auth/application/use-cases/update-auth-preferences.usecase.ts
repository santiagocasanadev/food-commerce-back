import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUTH_INJECTION_TOKENS } from '../../constants/injection-tokens';
import type { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class UpdateAuthPreferencesUseCase {
  constructor(
    @Inject(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: {
    userId: string;
    marketingOptIn?: boolean;
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
  }) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.updatePreferences({
      marketingOptIn: input.marketingOptIn,
      acceptTerms: input.acceptTerms,
      acceptPrivacy: input.acceptPrivacy,
    });

    await this.userRepository.save(user);

    return {
      emailVerified: user.isEmailVerified(),
      emailVerifiedAt: user.getEmailVerifiedAt(),
      marketingOptIn: user.isMarketingOptedIn(),
      marketingConsentAt: user.getMarketingConsentAt(),
      termsAcceptedAt: user.getTermsAcceptedAt(),
      privacyAcceptedAt: user.getPrivacyAcceptedAt(),
    };
  }
}
