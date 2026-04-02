import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantRegistryService } from './tenant-registry.service';
import { PlatformTenantRepository } from '../infrastructure/platform-tenant.repository.postgres';

@Injectable()
export class PlatformTenantsService {
  constructor(
    private readonly platformTenantRepository: PlatformTenantRepository,
    private readonly tenantRegistryService: TenantRegistryService,
  ) {}

  async list() {
    const tenants = await this.platformTenantRepository.findAll();
    return tenants.map((tenant) => this.toView(tenant));
  }

  async get(id: string) {
    const tenant = await this.platformTenantRepository.findById(id);

    if (!tenant) {
      throw new NotFoundException('Platform tenant not found');
    }

    return this.toView(tenant);
  }

  async create(payload: {
    slug: string;
    name: string;
    dbConnectionUrl: string;
    active?: boolean;
  }) {
    const normalizedSlug = normalizeSlug(payload.slug);
    const existing = await this.platformTenantRepository.findBySlug(normalizedSlug);

    if (existing) {
      throw new ConflictException('Platform tenant slug already exists');
    }

    const tenant = await this.platformTenantRepository.create({
      slug: normalizedSlug,
      name: payload.name.trim(),
      dbConnectionUrl: payload.dbConnectionUrl.trim(),
      active: payload.active,
    });
    this.tenantRegistryService.invalidateTenantCache({
      tenantId: tenant.id,
      slug: tenant.getSlug(),
    });

    return this.toView(tenant);
  }

  async update(
    id: string,
    payload: {
      slug?: string;
      name?: string;
      dbConnectionUrl?: string;
      active?: boolean;
    },
  ) {
    const tenant = await this.platformTenantRepository.findById(id);

    if (!tenant) {
      throw new NotFoundException('Platform tenant not found');
    }

    const previousSlug = tenant.getSlug();
    const nextSlug =
      payload.slug !== undefined ? normalizeSlug(payload.slug) : tenant.getSlug();

    if (nextSlug !== tenant.getSlug()) {
      const existing = await this.platformTenantRepository.findBySlug(nextSlug);

      if (existing && existing.id !== tenant.id) {
        throw new ConflictException('Platform tenant slug already exists');
      }
    }

    tenant.update({
      slug: nextSlug,
      name: payload.name?.trim(),
      dbConnectionUrl: payload.dbConnectionUrl?.trim(),
      active: payload.active,
    });

    await this.platformTenantRepository.save(tenant);
    this.tenantRegistryService.invalidateTenantCache({
      tenantId: tenant.id,
      slug: previousSlug,
    });
    this.tenantRegistryService.invalidateTenantCache({
      tenantId: tenant.id,
      slug: tenant.getSlug(),
    });

    return this.toView(tenant);
  }

  async remove(id: string) {
    const tenant = await this.platformTenantRepository.findById(id);

    if (!tenant) {
      throw new NotFoundException('Platform tenant not found');
    }

    await this.platformTenantRepository.deleteById(id);
    this.tenantRegistryService.invalidateTenantCache({
      tenantId: tenant.id,
      slug: tenant.getSlug(),
    });

    return { success: true };
  }

  private toView(tenant: {
    id: string;
    getSlug(): string;
    getName(): string;
    getDbConnectionUrl(): string;
    isActive(): boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: tenant.id,
      slug: tenant.getSlug(),
      name: tenant.getName(),
      dbConnectionUrl: tenant.getDbConnectionUrl(),
      active: tenant.isActive(),
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}
