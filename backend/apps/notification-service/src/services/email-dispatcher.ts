import type { EmailService } from "@servicehubuae/utils";

export interface EmailDispatcher {
  send(to: string, subject: string, htmlBody: string): Promise<void>;
}

export class StubEmailDispatcher implements EmailDispatcher {
  async send(to: string, subject: string, _htmlBody: string): Promise<void> {
    console.log(`[StubEmail] To: ${to} | Subject: ${subject}`);
  }
}

/**
 * Real email transport for the notification dispatcher, backed by the shared
 * SES `EmailService`. Replaces the stub so notification types that also have
 * email enabled (booking_confirmed, booking_reminder, payout_sent, …) actually
 * deliver.
 */
export class SesEmailDispatcher implements EmailDispatcher {
  constructor(private readonly emailService: EmailService) {}

  async send(to: string, subject: string, htmlBody: string): Promise<void> {
    await this.emailService.sendTransactional(to, subject, htmlBody);
  }
}
