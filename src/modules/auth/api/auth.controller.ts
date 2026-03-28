import { Body, Controller, Headers, Ip, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../../security/decorators/public.decorator';
import { JwtAuthGuard } from '../../../security/guards/jwt-auth.guard';
import { AuthOrchestrator } from '../application/auth.orchestrator';
import { AuthProvider } from '../domain/authProviders';
import { LoginAppleDto } from '../dto/login-apple.dto';
import { LoginEmailDto } from '../dto/login-email.dto';
import { LoginFacebookDto } from '../dto/login-facebook.dto';
import { LoginGoogleDto } from '../dto/login-google.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { SignupEmailDto } from '../dto/signup-email.dto';
import { ResendVerificationUseCase } from '../application/use-cases/resend-verification.usecase';
import { VerifyEmailUseCase } from '../application/use-cases/verify-email.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authOrchestrator: AuthOrchestrator, 
    private readonly verifyEmailUseCase: VerifyEmailUseCase, 
    private readonly resendVerificationUseCase: ResendVerificationUseCase
  ) { }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup/email')
  signupEmail(
    @Body() dto: SignupEmailDto,
    @Headers('x-guest-id') guestId: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    return this.authOrchestrator.signupWithEmail({
      ...dto,
      guestId,
      userAgent,
      ipAddress,
    });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login/email')
  loginEmail(
    @Body() dto: LoginEmailDto,
    @Headers('x-guest-id') guestId: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    return this.authOrchestrator.loginWithEmail({
      ...dto,
      guestId,
      userAgent,
      ipAddress,
    });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login/oauth/google')
  loginGoogle(
    @Body() dto: LoginGoogleDto,
    @Headers('x-guest-id') guestId: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    return this.authOrchestrator.loginWithOAuth({
      provider: AuthProvider.GOOGLE,
      token: dto.idToken,
      guestId,
      userAgent,
      ipAddress,
    });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login/oauth/facebook')
  loginFacebook(
    @Body() dto: LoginFacebookDto,
    @Headers('x-guest-id') guestId: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    return this.authOrchestrator.loginWithOAuth({
      provider: AuthProvider.FACEBOOK,
      token: dto.accessToken,
      guestId,
      userAgent,
      ipAddress,
    });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login/oauth/apple')
  loginApple(
    @Body() dto: LoginAppleDto,
    @Headers('x-guest-id') guestId: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    return this.authOrchestrator.loginWithOAuth({
      provider: AuthProvider.APPLE,
      token: dto.idToken,
      guestId,
      userAgent,
      ipAddress,
    });
  }

  @Public()
  @Throttle({ refresh: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  refresh(
    @Body() dto: RefreshDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    return this.authOrchestrator.refresh({
      refreshToken: dto.refreshToken,
      userAgent,
      ipAddress,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.authOrchestrator.logout(dto);
  }

  @Post('verify-email')
  @Public()
  verifyEmail(@Body() dto: { token: string }) {
    return this.verifyEmailUseCase.execute(dto.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  resend(@Req() req) {
    return this.resendVerificationUseCase.execute(req.user.userId);
  }
}
