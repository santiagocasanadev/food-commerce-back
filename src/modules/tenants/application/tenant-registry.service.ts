import { Injectable, Logger } from '@nestjs/common';
import { getOrCreateTenantPool } from 'src/infrastructure/database/tenant-pool.manager';
import { PlatformTenant } from '../domain/platform-tenant.entity';
import { PlatformTenantRepository } from '../infrastructure/platform-tenant.repository.postgres';

@Injectable()
export class TenantRegistryService {
  private readonly logger = new Logger(TenantRegistryService.name);
  private readonly cacheById = new Map<
    string,
    { tenant: PlatformTenant | null; expiresAt: number }
  >();
  private readonly cacheBySlug = new Map<
    string,
    { tenant: PlatformTenant | null; expiresAt: number }
  >();
  private readonly cacheTtlMs = 60_000;

  constructor(
    private readonly platformTenantRepository: PlatformTenantRepository,
  ) {}

  isEnabled() {
    return (
      Boolean(process.env.PLATFORM_DATABASE_URL?.trim()) ||
      Boolean(process.env.TENANT_DOMAIN_SUFFIX?.trim()) ||
      Boolean(process.env.REQUIRE_TENANT_RESOLUTION === 'true')
    );
  }

  async resolveTenantFromRequest(input: {
    tenantId?: string | string[];
    tenantSlug?: string | string[];
    host?: string;
  }) {
    const tenantId = firstHeaderValue(input.tenantId);
    const tenantSlugHeader = firstHeaderValue(input.tenantSlug);

    if (tenantId) {
      return this.findByIdCached(tenantId);
    }

    const slugFromHost = this.resolveSlugFromHost(input.host);
    const slug = tenantSlugHeader ?? slugFromHost;

    if (!slug) {
      return null;
    }

    return this.findBySlugCached(slug);
  }

  async resolveTenantPool(dbConnectionUrl: string, tenantId: string) {
    return getOrCreateTenantPool(`tenant:${tenantId}`, {
      connectionString: dbConnectionUrl,
    });
  }

  invalidateTenantCache(input: { tenantId?: string; slug?: string }) {
    if (input.tenantId) {
      this.cacheById.delete(input.tenantId);
    }

    if (input.slug) {
      this.cacheBySlug.delete(input.slug);
    }
  }

  private async findByIdCached(id: string) {
    const cached = this.getCached(this.cacheById, id);

    if (cached !== undefined) {
      return cached;
    }

    const tenant = await this.platformTenantRepository.findById(id);
    this.storeTenant(tenant);
    return tenant;
  }

  private async findBySlugCached(slug: string) {
    const normalizedSlug = slug.trim().toLowerCase();
    const cached = this.getCached(this.cacheBySlug, normalizedSlug);

    if (cached !== undefined) {
      return cached;
    }

    const tenant = await this.platformTenantRepository.findBySlug(normalizedSlug);
    this.storeTenant(tenant);
    if (!tenant) {
      this.cacheBySlug.set(normalizedSlug, {
        tenant: null,
        expiresAt: Date.now() + this.cacheTtlMs,
      });
    }
    return tenant;
  }

  private getCached(
    store: Map<string, { tenant: PlatformTenant | null; expiresAt: number }>,
    key: string,
  ) {
    const entry = store.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt < Date.now()) {
      store.delete(key);
      return undefined;
    }

    return entry.tenant;
  }

  private storeTenant(tenant: PlatformTenant | null) {
    if (!tenant) {
      return;
    }

    const entry = {
      tenant,
      expiresAt: Date.now() + this.cacheTtlMs,
    };

    this.cacheById.set(tenant.id, entry);
    this.cacheBySlug.set(tenant.getSlug(), entry);
  }

  private resolveSlugFromHost(host?: string) {
    if (!host) {
      return null;
    }

    const suffix = process.env.TENANT_DOMAIN_SUFFIX?.trim();

    if (!suffix) {
      return null;
    }

    const normalizedHost = host.split(':')[0].toLowerCase();
    const normalizedSuffix = suffix.toLowerCase();

    if (!normalizedHost.endsWith(normalizedSuffix)) {
      return null;
    }

    const suffixIndex = normalizedHost.length - normalizedSuffix.length;
    const candidate = normalizedHost.slice(0, suffixIndex).replace(/\.$/, '');

    if (!candidate || candidate === 'www' || candidate === 'api') {
      return null;
    }

    this.logger.debug(`Resolved tenant slug "${candidate}" from host ${host}`);
    return candidate;
  }
}

function firstHeaderValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
