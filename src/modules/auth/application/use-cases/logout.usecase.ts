import { Injectable } from '@nestjs/common';
import { SessionService } from '../session.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly sessionService: SessionService) {}

  async execute(input: { refreshToken: string }) {
    await this.sessionService.invalidateSession(input.refreshToken);

    return { success: true };
  }
}
