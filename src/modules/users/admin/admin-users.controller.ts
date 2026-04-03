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
  UseInterceptors,
} from '@nestjs/common';
import { AuditInterceptor } from 'src/infrastructure/logging/audit.interceptor';
import { Roles } from 'src/security/decorators/roles.decorator';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { RequestUser } from 'src/security/request-user';
import { TENANT_ADMIN_ROLES } from 'src/security/roles.enum';
import { UsersService } from '../application/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(...TENANT_ADMIN_ROLES)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Req() req: { user: RequestUser }) {
    return this.usersService.list(req.user);
  }

  @Get(':id')
  get(@Req() req: { user: RequestUser }, @Param('id') id: string) {
    return this.usersService.getById(req.user, id);
  }

  @Post()
  create(@Req() req: { user: RequestUser }, @Body() dto: CreateUserDto) {
    return this.usersService.create(req.user, dto);
  }

  @Patch(':id')
  update(
    @Req() req: { user: RequestUser },
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: { user: RequestUser }, @Param('id') id: string) {
    return this.usersService.remove(req.user, id);
  }
}
