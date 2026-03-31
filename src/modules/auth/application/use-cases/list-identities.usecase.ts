import { Inject, Injectable } from '@nestjs/common';
import { AUTH_INJECTION_TOKENS } from '../../constants/injection-tokens';
import type { AuthIdentityRepository } from '../../domain/repositories/auth-identity.repository';

@Injectable()
export class ListIdentitiesUseCase {
  constructor(
    @Inject(AUTH_INJECTION_TOKENS.AUTH_IDENTITY_REPOSITORY)
    private readonly authIdentityRepository: AuthIdentityRepository,
  ) {}

  async execute(userId: string) {
    return this.authIdentityRepository.findByUserId(userId);
  }
}
