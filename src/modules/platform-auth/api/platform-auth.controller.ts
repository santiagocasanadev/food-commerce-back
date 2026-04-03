import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from 'src/security/decorators/public.decorator';
import { Roles } from 'src/security/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { RequestUser } from 'src/security/request-user';
import { Role } from 'src/security/roles.enum';
import { PlatformAuthService } from '../application/platform-auth.service';
import { PlatformLoginDto } from '../dto/platform-login.dto';

@Controller('platform/auth')
export class PlatformAuthController {
  constructor(private readonly platformAuthService: PlatformAuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: PlatformLoginDto) {
    return this.platformAuthService.login(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN)
  @Get('me')
  me(@Req() req: { user: RequestUser }) {
    return this.platformAuthService.me(req.user.userId);
  }
}
