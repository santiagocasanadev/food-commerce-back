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

  async create(data: {
    email?: string | null;
    name: string;
    imageUrl?: string | null;
    address?: string | null;
    birthDate?: Date | null;
    gender?: string | null;
    role?: Role;
    emailVerified?: boolean;
  }): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();

    const { rows } = await getPgPool().query(
      `
      INSERT INTO users (
        id,
        email,
        name,
        image_url,
        address,
        birth_date,
        gender,
        email_verified,
        created_at,
        updated_at,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        id,
        data.email ?? null,
        data.name,
        data.imageUrl ?? null,
        data.address ?? null,
        data.birthDate ?? null,
        data.gender ?? null,
        data.emailVerified ?? false,
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
      email = $1,
      email_verified = $2,
      name = $3,
      image_url = $4,
      address = $5,
      birth_date = $6,
      gender = $7,
      role = $8,
      updated_at = NOW()
    WHERE id = $9
    `,
      [
        user.getEmail(),
        user.isEmailVerified(),
        user.getName(),
        user.getImageUrl(),
        user.getAddress(),
        user.getBirthDate(),
        user.getGender(),
        user.getRole(),
        user.id
      ]
    );
  }
}
