import * as crypto from 'crypto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AuthProvider } from '../../domain/authProviders';
import { AUTH_INJECTION_TOKENS } from '../../constants/injection-tokens';
import { VERIFY_MAIL_TOKEN } from '../../constants/verify-mail.tokens';
import type { AuthIdentityRepository } from '../../domain/repositories/auth-identity.repository';
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset.token.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { PasswordHasher } from '../ports/password-hasher';
import { SessionService } from '../session.service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(VERIFY_MAIL_TOKEN.PASSWORD_RESET_TOKEN_REPO)
    private readonly tokenRepo: PasswordResetTokenRepository,
    @Inject(VERIFY_MAIL_TOKEN.USER)
    private readonly userRepo: UserRepository,
    @Inject(AUTH_INJECTION_TOKENS.AUTH_IDENTITY_REPOSITORY)
    private readonly authIdentityRepository: AuthIdentityRepository,
    @Inject(AUTH_INJECTION_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionService: SessionService,
  ) {}

  async execute(input: { token: string; newPassword: string }) {
    const tokenHash = this.hash(input.token);
    const resetToken = await this.tokenRepo.findByHash(tokenHash);

    if (!resetToken || resetToken.isExpired() || resetToken.isConsumed()) {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.userRepo.findById(resetToken.userId);
    const email = user?.getEmail() ?? null;

    if (!user || !email) {
      throw new BadRequestException('Invalid token');
    }

    const identity = await this.authIdentityRepository.findEmailIdentityByEmail(
      email,
    );

    if (!identity || identity.provider !== AuthProvider.EMAIL) {
      throw new BadRequestException('User has no email/password credentials');
    }

    identity.setPasswordHash(
      await this.passwordHasher.hash(input.newPassword),
    );
    await this.authIdentityRepository.save(identity);

    resetToken.consume();
    await this.tokenRepo.consume(resetToken);
    await this.tokenRepo.deleteByUser(user.id);
    await this.sessionService.revokeAllUserSessions(user.id);

    return { success: true };
  }

  private hash(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
