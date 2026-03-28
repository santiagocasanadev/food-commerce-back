import { Inject, Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import type { EmailVerificationTokenRepository } from "../../domain/repositories/email-verification.token.repository";
import type { UserRepository } from "../../domain/repositories/user.repository";
import { EmailVerificationToken } from "../../domain/entities/email-verification.token.entity";
import type { MailService } from "../../mail/mail.service";
import { VERIFY_MAIL_TOKEN } from "../../constants/verify-mail.tokens";
import { AUTH_INJECTION_TOKENS } from "../../constants/injection-tokens";

@Injectable()
export class SendVerificationEmailUseCase {

    constructor(
        @Inject(VERIFY_MAIL_TOKEN.EMAIL_VERIFICATION_TOKEN_REPO)
        private readonly tokenRepo: EmailVerificationTokenRepository,
        @Inject(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
        private readonly userRepo: UserRepository,
        @Inject(VERIFY_MAIL_TOKEN.MAIL_SERVICE)
        private readonly mailService: MailService,
    ) { }

    async execute(userId: string) {

        const user = await this.userRepo.findById(userId);
        if (!user || !user.getEmail()) return;

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hash = this.hash(rawToken);

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

        await this.tokenRepo.deleteByUser(userId);

        await this.tokenRepo.create(
            new EmailVerificationToken(
                crypto.randomUUID(),
                userId,
                hash,
                expiresAt,
                false
            )
        );

        const link = `${process.env.FRONT_URL}/verify-email?token=${rawToken}`;

        const email = user.getEmail();
        if (!email) {
            throw new Error('User has no email');
        }

        await this.mailService.send({
            to: email,
            subject: 'Verify your email',
            html: `<a href="${link}">Verify Email</a>`
        });
    }

    private hash(token: string) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}
