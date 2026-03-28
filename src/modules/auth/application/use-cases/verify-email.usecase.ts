import * as crypto from 'crypto';
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { EmailVerificationTokenRepository } from "../../domain/repositories/email-verification.token.repository";
import type { UserRepository } from "../../domain/repositories/user.repository";
import { VERIFY_MAIL_TOKEN } from '../../constants/verify-mail.tokens';

@Injectable()
export class VerifyEmailUseCase {

  constructor(
    @Inject(VERIFY_MAIL_TOKEN.EMAIL_VERIFICATION_TOKEN_REPO)
    private readonly tokenRepo: EmailVerificationTokenRepository,
    @Inject(VERIFY_MAIL_TOKEN.USER)
    private readonly userRepo: UserRepository,
  ) {}

  async execute(rawToken: string) {

    const hash = this.hash(rawToken);

    const token = await this.tokenRepo.findByHash(hash);

    if (!token || token.isExpired() || token.isConsumed()) {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.userRepo.findById(token.userId);
    if (!user) throw new BadRequestException();

    user.verifyEmail();

    await this.userRepo.save(user);

    token.consume();
    await this.tokenRepo.consume(token);

    return { success: true };
  }

  private hash(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}