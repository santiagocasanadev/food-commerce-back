import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { LoyaltyService } from "../application/loyalty.service";

@Controller('admin/loyalty')
export class AdminLoyaltyController {
    constructor(private readonly service: LoyaltyService) { }

    @Get(':customerId')
    get(@Param('customerId') customerId: string) {
        return this.service.get(customerId);
    }

    @Patch(':customerId/adjust')
    adjust(
        @Param('customerId') customerId: string,
        @Body('points') points: number
    ) {
        return this.service.adjust(customerId, points);
    }
}
