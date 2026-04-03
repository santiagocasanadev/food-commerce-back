import { Injectable } from '@nestjs/common';
import { getPlatformPool } from 'src/infrastructure/database/platform.connection';
import { PlatformAdmin } from '../domain/platform-admin.entity';

@Injectable()
export class PlatformAdminRepository {
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
