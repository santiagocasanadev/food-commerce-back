import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from '../session.service';

@Injectable()
export class RefreshSessionUseCase {
  constructor(private readonly sessionService: SessionService) {}

  async execute(input: {
    refreshToken: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }) {
    const session = await this.sessionService.refreshSession(input);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return session;
  }
}
