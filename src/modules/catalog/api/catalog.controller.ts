import { Controller, Get } from '@nestjs/common';
import { CatalogService } from '../application/catalog.service';

@Controller('catalog')
export class CatalogController {
    constructor(private readonly service: CatalogService) { }

    @Get()
    list() {
        try {
            return this.service.list();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }    
}
