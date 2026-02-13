import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';

import { LoginDto } from '../dto/login.dto';
import { Public } from '../../../security/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler/dist/throttler.decorator';
import { RefreshDto } from '../dto/refresh.dto';
import { JwtAuthGuard } from '../../../security/guards/jwt-auth.guard';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.userId, dto.role);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req, @Body() dto: RefreshDto) {
    return this.authService.logout(req.user.id, dto.refreshToken);
  }

  @Post('google')
  @Public()
  async googleLogin(@Body('idToken') idToken: string) {
    return this.authService.loginWithGoogle(idToken);
  }
}
