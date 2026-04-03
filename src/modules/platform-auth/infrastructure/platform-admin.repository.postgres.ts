import { Injectable } from '@nestjs/common';
import { getPlatformPool } from 'src/infrastructure/database/platform.connection';
import { PlatformAdmin } from '../domain/platform-admin.entity';

@Injectable()
export class PlatformAdminRepository {
  async findAll(): Promise<PlatformAdmin[]> {
    const { rows } = await getPlatformPool().query(
      `
      SELECT id, email, name, password_hash, active, created_at, updated_at
      FROM platform_admins
      ORDER BY created_at DESC
      `,
    );

    return rows.map((row) => this.mapRow(row));
  }

  async findByEmail(email: string): Promise<PlatformAdmin | null> {
    const { rows } = await getPlatformPool().query(
      `
      SELECT id, email, name, password_hash, active, created_at, updated_at
      FROM platform_admins
      WHERE email = $1
      LIMIT 1
      `,
      [email.toLowerCase()],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findById(id: string): Promise<PlatformAdmin | null> {
    const { rows } = await getPlatformPool().query(
      `
      SELECT id, email, name, password_hash, active, created_at, updated_at
      FROM platform_admins
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async create(payload: {
    email: string;
    name: string;
    passwordHash: string;
    active?: boolean;
  }): Promise<PlatformAdmin> {
    const { rows } = await getPlatformPool().query(
      `
      INSERT INTO platform_admins (
        id, email, name, password_hash, active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, COALESCE($5, TRUE), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, name, password_hash, active, created_at, updated_at
      `,
      [
        crypto.randomUUID(),
        payload.email,
        payload.name,
        payload.passwordHash,
        payload.active,
      ],
    );

    return this.mapRow(rows[0]);
  }

  async save(admin: PlatformAdmin): Promise<void> {
    await getPlatformPool().query(
      `
      UPDATE platform_admins
      SET email = $2,
          name = $3,
          password_hash = $4,
          active = $5,
          updated_at = $6
      WHERE id = $1
      `,
      [
        admin.id,
        admin.email,
        admin.name,
        admin.passwordHash,
        admin.active,
        admin.updatedAt,
      ],
    );
  }

  async deleteById(id: string): Promise<void> {
    await getPlatformPool().query(
      `
      DELETE FROM platform_admins
      WHERE id = $1
      `,
      [id],
    );
  }

  private mapRow(row: any): PlatformAdmin {
    return new PlatformAdmin(
      row.id,
      row.email,
      row.name,
      row.password_hash,
      Boolean(row.active),
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }
}
