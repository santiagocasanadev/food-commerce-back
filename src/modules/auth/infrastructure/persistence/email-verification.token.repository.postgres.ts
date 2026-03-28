import { Injectable } from "@nestjs/common";
import { getPgPool } from "src/infrastructure/database/postgres.connection";
import { EmailVerificationToken } from "../../domain/entities/email-verification.token.entity";
import { EmailVerificationTokenRepository } from "../../domain/repositories/email-verification.token.repository";

@Injectable()
export class PostgresEmailVerificationTokenRepository
  implements EmailVerificationTokenRepository {

  async create(token: EmailVerificationToken) {
    await getPgPool().query(
      `INSERT INTO email_verification_tokens
       (id, user_id, token_hash, expires_at, consumed)
       VALUES ($1,$2,$3,$4,$5)`,
      [token.id, token.userId, token.tokenHash, token.expiresAt, false]
    );
  }

  async findByHash(hash: string) {
    const { rows } = await getPgPool().query(
      `SELECT * FROM email_verification_tokens
       WHERE token_hash=$1`,
      [hash]
    );

    if (!rows.length) return null;

    const r = rows[0];

    return new EmailVerificationToken(
      r.id,
      r.user_id,
      r.token_hash,
      r.expires_at,
      r.consumed
    );
  }

  async consume(token: EmailVerificationToken) {
    await getPgPool().query(
      `UPDATE email_verification_tokens
       SET consumed=true
       WHERE id=$1`,
      [token.id]
    );
  }

  async deleteByUser(userId: string) {
    await getPgPool().query(
      `DELETE FROM email_verification_tokens
       WHERE user_id=$1`,
      [userId]
    );
  }
}
