import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/security/decorators/roles.decorator';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { RequestUser } from 'src/security/request-user';
import { Role } from 'src/security/roles.enum';
import { PlatformAdminsService } from '../application/platform-admins.service';
import { CreatePlatformAdminDto } from '../dto/create-platform-admin.dto';
import { UpdatePlatformAdminDto } from '../dto/update-platform-admin.dto';

@UseGuards(RolesGuard)
@Roles(Role.PLATFORM_ADMIN)
@Controller('platform/admins')
export class PlatformAdminsController {
  constructor(private readonly platformAdminsService: PlatformAdminsService) {}

  @Get()
  list() {
    return this.platformAdminsService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.platformAdminsService.get(id);
  }

  @Post()
  create(@Body() dto: CreatePlatformAdminDto) {
    return this.platformAdminsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformAdminDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.platformAdminsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: RequestUser }) {
    return this.platformAdminsService.remove(id, req.user.userId);
  }
}
