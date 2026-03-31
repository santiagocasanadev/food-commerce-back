import { Injectable } from '@nestjs/common';
import { MailService } from './mail.service';

@Injectable()
export class ResendMailService implements MailService {
  async send(input: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.MAIL_FROM?.trim();
    const replyTo = process.env.MAIL_REPLY_TO?.trim();

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!from) {
      throw new Error('MAIL_FROM is not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (response.ok) {
      return;
    }

    const errorText = await response.text();
    throw new Error(
      `Resend API request failed (${response.status}): ${errorText}`,
    );
  }
}
