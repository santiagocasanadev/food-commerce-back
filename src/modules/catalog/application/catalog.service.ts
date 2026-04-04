import { Catalog } from '../domain/catalog.entity';
import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import type { CatalogRepository } from '../domain/catalog.repository';
import * as crypto from 'crypto';

@Injectable()
export class CatalogService {
    constructor(
        @Inject('CatalogRepository')
        private readonly repository: CatalogRepository) { }

    async list(): Promise<Catalog[]> {
        const catalogs = await this.repository.findAll();
        return catalogs.filter((catalog) => catalog.getStatus());
    }

    listAdmin(): Promise<Catalog[]> {
        return this.repository.findAll();
    }

    async activate(id: string) {
        const c = await this.repository.findById(id);
        if (!c) throw new NotFoundException('Catalog not found');
        c.activate();
        await this.repository.save(c);
        return c;
    }

    async deactivate(id: string) {
        const c = await this.repository.findById(id);
        if (!c) throw new NotFoundException('Catalog not found');
        c.deactivate();
        await this.repository.save(c);
        return c;
    }

    async getById(id: string): Promise<Catalog> {
        const catalog = await this.repository.findById(id);

        if (!catalog) {
            throw new NotFoundException('Catalog not found');
        }

        return catalog;
    }

    async create(input: { id?: string; name: string }): Promise<Catalog> {
        const name = input.name?.trim();

        if (!name) {
            throw new BadRequestException('Catalog name is required');
        }

        const catalog = new Catalog(
            input.id?.trim() || crypto.randomUUID(),
            name,
            true
        );
        await this.repository.save(catalog);
        return catalog;
    }

    async update(id: string, input: { name?: string }): Promise<Catalog> {
        const catalog = await this.getById(id);

        if (input.name !== undefined) {
            const nextName = input.name.trim();

            if (!nextName) {
                throw new BadRequestException('Catalog name cannot be empty');
            }

            catalog.rename(nextName);
        }

        await this.repository.save(catalog);
        return catalog;
    }

    async remove(id: string) {
        await this.getById(id);
        await this.repository.deleteById(id);
        return { success: true };
    }
}

