
import { Catalog } from '../domain/catalog.entity';
import { Inject } from '@nestjs/common';
import type { CatalogRepository } from '../domain/catalog.repository';


export class CatalogService {
    constructor(
        @Inject('CatalogRepository')
        private readonly repository: CatalogRepository) { }

    list(): Promise<Catalog[]> {
        return this.repository.findAll();
    }

    async activate(id: string) {
        const c = await this.repository.findById(id);
        if (!c) throw new Error('Catalog not found');
        c.activate();
        await this.repository.save(c);
    }

    async desactivate(id: string) {
        const c = await this.repository.findById(id);
        if (!c) throw new Error('Catalog not found');
        c.desactivate();
        await this.repository.save(c);
    }

    async create(id: string, name: string): Promise<Catalog> {
        const catalog = new Catalog(
            crypto.randomUUID(),
            name,
            true
        );
        await this.repository.save(catalog);
        return catalog;
    }
}

