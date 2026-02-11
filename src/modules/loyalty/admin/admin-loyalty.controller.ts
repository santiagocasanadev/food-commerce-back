import { Body, Controller, Get, Param, Patch, UseGuards, UseInterceptors } from "@nestjs/common";
import { LoyaltyService } from "../application/loyalty.service";
import { Role } from "src/security/roles.enum";
import { RolesGuard } from "src/security/guards/roles.guard";
import { Roles } from "src/security/decorators/roles.decorator";
import { AuditInterceptor } from "src/infrastructure/logging/audit.interceptor";

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/loyalty')
export class AdminLoyaltyController {
    constructor(private readonly service: LoyaltyService) { }

    @Roles(Role.ADMIN)
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
