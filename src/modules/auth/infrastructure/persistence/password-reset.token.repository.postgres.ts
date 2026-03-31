import { Injectable } from "@nestjs/common";
import { getPgPool } from "src/infrastructure/database/postgres.connection";
import { PasswordResetToken } from "../../domain/entities/password-reset.token.entity";
import { PasswordResetTokenRepository } from "../../domain/repositories/password-reset.token.repository";

@Injectable()
export class PostgresPasswordResetTokenRepository
  implements PasswordResetTokenRepository {
  async create(token: PasswordResetToken) {
    await getPgPool().query(
      `INSERT INTO password_reset_tokens
       (id, user_id, token_hash, expires_at, consumed)
       VALUES ($1,$2,$3,$4,$5)`,
      [token.id, token.userId, token.tokenHash, token.expiresAt, false],
    );
  }

  async findByHash(hash: string) {
    const { rows } = await getPgPool().query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash=$1`,
      [hash],
    );

    if (!rows.length) return null;

    const row = rows[0];

    return new PasswordResetToken(
      row.id,
      row.user_id,
      row.token_hash,
      new Date(row.expires_at),
      row.consumed,
    );
  }

  async consume(token: PasswordResetToken) {
    await getPgPool().query(
      `UPDATE password_reset_tokens
       SET consumed=true
       WHERE id=$1`,
      [token.id],
    );
  }

  async deleteByUser(userId: string) {
    await getPgPool().query(
      `DELETE FROM password_reset_tokens
       WHERE user_id=$1`,
      [userId],
    );
  }
}
