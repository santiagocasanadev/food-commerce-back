import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { VERIFY_MAIL_TOKEN } from '../../constants/verify-mail.tokens';
import { PasswordResetToken } from '../../domain/entities/password-reset.token.entity';
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset.token.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { MailService } from '../../mail/mail.service';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(VERIFY_MAIL_TOKEN.PASSWORD_RESET_TOKEN_REPO)
    private readonly tokenRepo: PasswordResetTokenRepository,
    @Inject(VERIFY_MAIL_TOKEN.USER)
    private readonly userRepo: UserRepository,
    @Inject(VERIFY_MAIL_TOKEN.MAIL_SERVICE)
    private readonly mailService: MailService,
  ) {}

  async execute(rawEmail: string) {
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(normalizedEmail);
    const email = user?.getEmail() ?? null;

    if (!user || !email) {
      return { success: true };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hash(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.tokenRepo.deleteByUser(user.id);
    await this.tokenRepo.create(
      new PasswordResetToken(
        crypto.randomUUID(),
        user.id,
        tokenHash,
        expiresAt,
        false,
      ),
    );

    const resetLink = `${process.env.FRONT_URL}/reset-password?token=${rawToken}`;

    await this.mailService.send({
      to: email,
      subject: 'Reset your password',
      html: `<a href="${resetLink}">Reset password</a>`,
    });

    return { success: true };
  }

  private hash(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
