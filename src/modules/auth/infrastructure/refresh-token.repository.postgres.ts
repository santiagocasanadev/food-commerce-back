import { PoolClient } from 'pg';
import { RefreshTokenRepository } from '../domain/refresh-token.repository';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { RefreshToken } from 'src/modules/auth/domain/refresh-token.entity';

export class PostgresRefreshTokenRepository
  implements RefreshTokenRepository
{
  async save(
    token: RefreshToken,
    client?: PoolClient
  ): Promise<void> {
    const executor = client ?? getPgPool();

    await executor.query(
      `
      INSERT INTO refresh_tokens (
        id,
        user_id,
        token_hash,
        expires_at,
        revoked
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id)
      DO UPDATE SET
        revoked = EXCLUDED.revoked
      `,
      [
        token.id,
        token.userId,
        token.tokenHash,
        token.expiresAt,
        token.isRevoked()
      ]
    );
  }

  async findByHash(
    tokenHash: string,
    client?: PoolClient
  ): Promise<RefreshToken | null> {
    const executor = client ?? getPgPool();

    const result = await executor.query(
      `
      SELECT *
      FROM refresh_tokens
      WHERE token_hash = $1
      LIMIT 1
      `,
      [tokenHash]
    );

    if (!result.rows.length) return null;

    const row = result.rows[0];

    const revoked =
      row.revoked === true ||
      row.revoked === 't' ||
      row.revoked === 'true';

    return new RefreshToken(
      row.id,
      row.user_id,
      row.token_hash,
      new Date(row.expires_at),
      revoked
    );
  }
}
