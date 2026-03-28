export interface MailService {
  send(input: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}