import { Injectable, Logger } from '@nestjs/common';
import { getOrCreateTenantPool } from 'src/infrastructure/database/tenant-pool.manager';
import { PlatformTenantRepository } from '../infrastructure/platform-tenant.repository.postgres';

@Injectable()
export class TenantRegistryService {
  private readonly logger = new Logger(TenantRegistryService.name);

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
      return this.platformTenantRepository.findById(tenantId);
    }

    const slugFromHost = this.resolveSlugFromHost(input.host);
    const slug = tenantSlugHeader ?? slugFromHost;

    if (!slug) {
      return null;
    }

    return this.platformTenantRepository.findBySlug(slug);
  }

  async resolveTenantPool(dbConnectionUrl: string, tenantId: string) {
    return getOrCreateTenantPool(`tenant:${tenantId}`, {
      connectionString: dbConnectionUrl,
    });
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
