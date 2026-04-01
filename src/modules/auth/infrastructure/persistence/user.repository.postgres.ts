import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { getPgPool } from 'src/infrastructure/database/postgres.connection';
import { UserMapper } from 'src/infrastructure/mappers/user.mapper';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Role } from 'src/security/roles.enum';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    return rows[0] ? UserMapper.toDomain(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email],
    );

    return rows[0] ? UserMapper.toDomain(rows[0]) : null;
  }

  async findAll(): Promise<User[]> {
    const { rows } = await getPgPool().query(
      `
      SELECT *
      FROM users
      ORDER BY created_at DESC
      `,
    );

    return rows.map((row) => UserMapper.toDomain(row));
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    const { rows } = await getPgPool().query(
      `
      SELECT *
      FROM users
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId],
    );

    return rows.map((row) => UserMapper.toDomain(row));
  }

  async create(data: {
    tenantId?: string | null;
    email?: string | null;
    name: string;
    imageUrl?: string | null;
    address?: string | null;
    birthDate?: Date | null;
    gender?: string | null;
    role?: Role;
    emailVerified?: boolean;
    emailVerifiedAt?: Date | null;
    marketingOptIn?: boolean;
    marketingConsentAt?: Date | null;
    termsAcceptedAt?: Date | null;
    privacyAcceptedAt?: Date | null;
  }): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();

    const { rows } = await getPgPool().query(
      `
      INSERT INTO users (
        id,
        tenant_id,
        email,
        name,
        image_url,
        address,
        birth_date,
        gender,
        email_verified,
        email_verified_at,
        marketing_opt_in,
        marketing_consent_at,
        terms_accepted_at,
        privacy_accepted_at,
        created_at,
        updated_at,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
      `,
      [
        id,
        data.tenantId ?? null,
        data.email ?? null,
        data.name,
        data.imageUrl ?? null,
        data.address ?? null,
        data.birthDate ?? null,
        data.gender ?? null,
        data.emailVerified ?? false,
        data.emailVerifiedAt ?? null,
        data.marketingOptIn ?? false,
        data.marketingConsentAt ?? null,
        data.termsAcceptedAt ?? null,
        data.privacyAcceptedAt ?? null,
        now,
        now,
        data.role ?? Role.CUSTOMER,
      ],
    );

    return UserMapper.toDomain(rows[0]);
  }

  async save(user: User): Promise<void> {

    await getPgPool().query(
      `
    UPDATE users
    SET
      tenant_id = $1,
      email = $2,
      email_verified = $3,
      name = $4,
      image_url = $5,
      address = $6,
      birth_date = $7,
      gender = $8,
      role = $9,
      email_verified_at = $10,
      marketing_opt_in = $11,
      marketing_consent_at = $12,
      terms_accepted_at = $13,
      privacy_accepted_at = $14,
      updated_at = NOW()
    WHERE id = $15
    `,
      [
        user.getTenantId(),
        user.getEmail(),
        user.isEmailVerified(),
        user.getName(),
        user.getImageUrl(),
        user.getAddress(),
        user.getBirthDate(),
        user.getGender(),
        user.getRole(),
        user.getEmailVerifiedAt(),
        user.isMarketingOptedIn(),
        user.getMarketingConsentAt(),
        user.getTermsAcceptedAt(),
        user.getPrivacyAcceptedAt(),
        user.id
      ]
    );
  }

  async deleteById(id: string): Promise<void> {
    await getPgPool().query(
      `
      DELETE FROM users
      WHERE id = $1
      `,
      [id],
    );
  }
}
