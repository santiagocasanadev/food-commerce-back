import { Controller, Get } from '@nestjs/common';
import { CatalogService } from '../application/catalog.service';
import { Public } from 'src/security/decorators/public.decorator';

@Controller('catalog')
export class CatalogController {
    constructor(private readonly service: CatalogService) { }

    @Public()
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
