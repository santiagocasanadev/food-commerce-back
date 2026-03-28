import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { getPgPool } from 'src/infrastructure/database/postgres.connection';
import { AuthProvider } from '../../domain/authProviders';
import { AuthIdentity } from '../../domain/entities/auth-identity.entity';
import { AuthIdentityRepository } from '../../domain/repositories/auth-identity.repository';

@Injectable()
export class PostgresAuthIdentityRepository implements AuthIdentityRepository {
  async findByProviderUserId(
    provider: AuthProvider,
    providerUserId: string,
  ): Promise<AuthIdentity | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT id, user_id, provider, provider_user_id, email, password_hash, created_at, updated_at
      FROM auth_identities
      WHERE provider = $1 AND provider_user_id = $2
      LIMIT 1
      `,
      [provider, providerUserId],
    );

    const row = rows[0];

    return row
      ? new AuthIdentity(
          row.id,
          row.user_id,
          row.provider,
          row.provider_user_id ?? null,
          row.email ?? null,
          row.password_hash ?? null,
          new Date(row.created_at),
          new Date(row.updated_at),
        )
      : null;
  }

  async findEmailIdentityByEmail(email: string): Promise<AuthIdentity | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT id, user_id, provider, provider_user_id, email, password_hash, created_at, updated_at
      FROM auth_identities
      WHERE provider = $1 AND email = $2
      LIMIT 1
      `,
      [AuthProvider.EMAIL, email.toLowerCase()],
    );

    const row = rows[0];

    return row
      ? new AuthIdentity(
          row.id,
          row.user_id,
          row.provider,
          row.provider_user_id ?? null,
          row.email ?? null,
          row.password_hash ?? null,
          new Date(row.created_at),
          new Date(row.updated_at),
        )
      : null;
  }

  async create(data: {
    userId: string;
    provider: AuthProvider;
    providerUserId?: string | null;
    email?: string | null;
    passwordHash?: string | null;
  }): Promise<AuthIdentity> {
    const now = new Date();
    const { rows } = await getPgPool().query(
      `
      INSERT INTO auth_identities (
        id,
        user_id,
        provider,
        provider_user_id,
        email,
        password_hash,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, user_id, provider, provider_user_id, email, password_hash, created_at, updated_at
      `,
      [
        crypto.randomUUID(),
        data.userId,
        data.provider,
        data.providerUserId ?? null,
        data.email ?? null,
        data.passwordHash ?? null,
        now,
        now,
      ],
    );

    const row = rows[0];

    return new AuthIdentity(
      row.id,
      row.user_id,
      row.provider,
      row.provider_user_id ?? null,
      row.email ?? null,
      row.password_hash ?? null,
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }
}
