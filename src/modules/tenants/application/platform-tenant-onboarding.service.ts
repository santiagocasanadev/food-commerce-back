import * as crypto from 'crypto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BcryptPasswordHasher } from 'src/modules/auth/infrastructure/security/bcrypt-password-hasher';
import { Role } from 'src/security/roles.enum';
import { describeConnectionTarget } from '../utils/masked-connection';
import { PlatformTenantRepository } from '../infrastructure/platform-tenant.repository.postgres';
import { PlatformTenantConnectionService } from './platform-tenant-connection.service';
import { TenantRegistryService } from './tenant-registry.service';
import { Pool } from 'pg';

@Injectable()
export class PlatformTenantOnboardingService {
  private readonly logger = new Logger(PlatformTenantOnboardingService.name);

  constructor(
    private readonly platformTenantRepository: PlatformTenantRepository,
    private readonly tenantRegistryService: TenantRegistryService,
    private readonly platformTenantConnectionService: PlatformTenantConnectionService,
    private readonly passwordHasher: BcryptPasswordHasher,
  ) {}

  async onboardTenant(payload: {
    slug: string;
    name: string;
    dbConnectionUrl: string;
    adminEmail: string;
    adminName: string;
    adminPassword: string;
    active?: boolean;
  }) {
    const slug = normalizeSlug(payload.slug);
    const adminEmail = payload.adminEmail.trim().toLowerCase();
    const dbConnectionUrl = payload.dbConnectionUrl.trim();

    const existingTenant = await this.platformTenantRepository.findBySlug(slug);

    if (existingTenant) {
      throw new ConflictException('Platform tenant slug already exists');
    }

    const targetPool = new Pool({
      connectionString: dbConnectionUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    let createdTenantId: string | null = null;

    try {
      this.logger.log(
        `Starting tenant onboarding for slug "${slug}" using ${JSON.stringify(
          describeConnectionTarget(dbConnectionUrl),
        )}`,
      );

      await this.platformTenantConnectionService.testConnection({
        dbConnectionUrl,
      });

      const emailAvailability = await targetPool.query(
        `
        SELECT EXISTS (
          SELECT 1 FROM users WHERE email = $1
        ) AS user_exists,
        EXISTS (
          SELECT 1 FROM auth_identities WHERE provider = 'email' AND email = $1
        ) AS identity_exists
        `,
        [adminEmail],
      );

      const duplicateEmail =
        Boolean(emailAvailability.rows[0]?.user_exists) ||
        Boolean(emailAvailability.rows[0]?.identity_exists);

      if (duplicateEmail) {
        throw new ConflictException(
          'Initial tenant admin email already exists in tenant database',
        );
      }

      const tenant = await this.platformTenantRepository.create({
        slug,
        name: payload.name.trim(),
        dbConnectionUrl,
        active: payload.active,
      });
      createdTenantId = tenant.id;

      const passwordHash = await this.passwordHasher.hash(payload.adminPassword);
      const userId = crypto.randomUUID();
      const authIdentityId = crypto.randomUUID();

      const client = await targetPool.connect();

      try {
        await client.query('BEGIN');
        await client.query(
          `
          INSERT INTO users (
            id,
            tenant_id,
            email,
            name,
            email_verified,
            marketing_opt_in,
            created_at,
            updated_at,
            role
          )
          VALUES ($1, $2, $3, $4, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5)
          `,
          [userId, tenant.id, adminEmail, payload.adminName.trim(), Role.TENANT_ADMIN],
        );

        await client.query(
          `
          INSERT INTO auth_identities (
            id,
            user_id,
            provider,
            email,
            password_hash,
            created_at,
            updated_at
          )
          VALUES ($1, $2, 'email', $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
          [authIdentityId, userId, adminEmail, passwordHash],
        );

        await client.query('COMMIT');
      } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      this.tenantRegistryService.invalidateTenantCache({
        tenantId: tenant.id,
        slug: tenant.getSlug(),
      });

      return {
        tenant: {
          id: tenant.id,
          slug: tenant.getSlug(),
          name: tenant.getName(),
          dbConnectionUrl: tenant.getDbConnectionUrl(),
          active: tenant.isActive(),
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
        },
        initialAdmin: {
          id: userId,
          tenantId: tenant.id,
          email: adminEmail,
          name: payload.adminName.trim(),
          role: Role.TENANT_ADMIN,
        },
      };
    } catch (error: unknown) {
      if (createdTenantId) {
        await this.platformTenantRepository.deleteById(createdTenantId);
        this.tenantRegistryService.invalidateTenantCache({
          tenantId: createdTenantId,
          slug,
        });
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      if (isPgUniqueViolation(error)) {
        throw new ConflictException(
          'Initial tenant admin email already exists in tenant database',
        );
      }

      this.logger.error(
        `Tenant onboarding failed for slug "${slug}": ${getErrorMessage(error)}`,
      );
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('Tenant onboarding failed');
    } finally {
      await targetPool.end();
    }
  }
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isPgUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}
