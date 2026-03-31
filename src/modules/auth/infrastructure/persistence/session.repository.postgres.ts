import { getPgPool } from "src/infrastructure/database/postgres.connection";
import { Injectable } from "@nestjs/common";
import { SessionRepository } from "../../domain/repositories/auth-session.repository";
import { AuthSession } from "../../domain/entities/auth-session.identity";

@Injectable()
export class PostgresSessionRepository implements SessionRepository {
  async create(data: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }): Promise<AuthSession> {
    const { rows } = await getPgPool().query(
      `
      INSERT INTO auth_sessions (
        id,
        user_id,
        refresh_token,
        user_agent,
        ip_address,
        expires_at,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        data.id,
        data.userId,
        data.refreshTokenHash,
        data.userAgent ?? null,
        data.ipAddress ?? null,
        data.expiresAt,
        new Date(),
      ],
    );

    return this.mapRow(rows[0]);
  }

  async findById(id: string): Promise<AuthSession | null> {
    const { rows } = await getPgPool().query(
      `SELECT * FROM auth_sessions WHERE id = $1 LIMIT 1`,
      [id],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<AuthSession | null> {
    const { rows } = await getPgPool().query(
      `SELECT * FROM auth_sessions WHERE refresh_token = $1 LIMIT 1`,
      [refreshTokenHash],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<AuthSession[]> {
    const { rows } = await getPgPool().query(
      `
      SELECT *
      FROM auth_sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  async delete(id: string): Promise<void> {
    await getPgPool().query(`DELETE FROM auth_sessions WHERE id = $1`, [id]);
  }

  async deleteByIdAndUserId(id: string, userId: string): Promise<void> {
    await getPgPool().query(
      `DELETE FROM auth_sessions WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
  }

  async deleteByUserId(userId: string): Promise<void> {
    await getPgPool().query(`DELETE FROM auth_sessions WHERE user_id = $1`, [
      userId,
    ]);
  }

  async deleteByRefreshTokenHash(refreshTokenHash: string): Promise<void> {
    await getPgPool().query(
      `DELETE FROM auth_sessions WHERE refresh_token = $1`,
      [refreshTokenHash],
    );
  }

  private mapRow(row: any): AuthSession {
    return new AuthSession(
      row.id,
      row.user_id,
      row.refresh_token,
      row.user_agent ?? null,
      row.ip_address ?? null,
      new Date(row.expires_at),
      new Date(row.created_at),
    );
  }
}
