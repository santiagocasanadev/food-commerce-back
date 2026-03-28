import { Injectable, Logger } from '@nestjs/common';
import { MailService } from './mail.service';

@Injectable()
export class ConsoleMailService implements MailService {
  private readonly logger = new Logger(ConsoleMailService.name);

  async send(input: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    this.logger.log(
      `Mock email sent to ${input.to} with subject "${input.subject}"`,
    );
    this.logger.debug(input.html);
  }
}
