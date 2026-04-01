import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { RequestUser } from 'src/security/request-user';
import { UsersService } from '../application/users.service';
import { UpdateMeDto } from '../dto/update-me.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: RequestUser }) {
    return this.usersService.getMe(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: { user: RequestUser }, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(req.user.userId, dto);
  }
}
