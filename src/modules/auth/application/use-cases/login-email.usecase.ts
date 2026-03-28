import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_INJECTION_TOKENS } from '../../constants/injection-tokens';
import type { AuthIdentityRepository } from '../../domain/repositories/auth-identity.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { PasswordHasher } from '../ports/password-hasher';
import { AuthResponsePresenter } from '../presenters/auth-response.presenter';
import { SessionService } from '../session.service';

@Injectable()
export class LoginEmailUseCase {
  constructor(
    @Inject(AUTH_INJECTION_TOKENS.AUTH_IDENTITY_REPOSITORY)
    private readonly authIdentityRepository: AuthIdentityRepository,
    @Inject(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(AUTH_INJECTION_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionService: SessionService,
  ) {}

  async execute(input: {
    email: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const identity =
      await this.authIdentityRepository.findEmailIdentityByEmail(normalizedEmail);

    if (!identity || !identity.getPasswordHash()) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.passwordHasher.compare(
      input.password,
      identity.getPasswordHash()!,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.userRepository.findById(identity.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const session = await this.sessionService.createSession({
      userId: user.id,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    return AuthResponsePresenter.withUser(session, user);
  }
}
