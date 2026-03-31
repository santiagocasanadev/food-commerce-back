import { PasswordResetToken } from "../entities/password-reset.token.entity";

export interface PasswordResetTokenRepository {
  create(token: PasswordResetToken): Promise<void>;
  findByHash(hash: string): Promise<PasswordResetToken | null>;
  consume(token: PasswordResetToken): Promise<void>;
  deleteByUser(userId: string): Promise<void>;
}
