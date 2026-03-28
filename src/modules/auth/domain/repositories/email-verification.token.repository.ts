import { EmailVerificationToken } from "../entities/email-verification.token.entity";

export interface EmailVerificationTokenRepository {
  create(token: EmailVerificationToken): Promise<void>;
  findByHash(hash: string): Promise<EmailVerificationToken | null>;
  consume(token: EmailVerificationToken): Promise<void>;
  deleteByUser(userId: string): Promise<void>;
}