import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUTH_INJECTION_TOKENS } from '../../constants/injection-tokens';
import type { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class GetAuthPreferencesUseCase {
  constructor(
    @Inject(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

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
