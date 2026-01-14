import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoApiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.brevoApiKey = this.configService.get('BREVO_API_KEY') || '';
    this.senderEmail = this.configService.get('BREVO_SENDER_EMAIL') || '';
    this.senderName =
      this.configService.get('BREVO_SENDER_NAME') || 'Portfolio';
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const { to, subject, htmlContent, textContent } = params;

    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [
            {
              email: to,
            },
          ],
          subject,
          htmlContent,
          textContent: textContent || this.stripHtml(htmlContent),
        },
        {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      // Log success
      await this.logEmail({
        toEmail: to,
        fromEmail: this.senderEmail,
        subject,
        body: htmlContent,
        status: 'sent',
        messageId: response.data.messageId,
      });

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);

      // Log failure
      await this.logEmail({
        toEmail: to,
        fromEmail: this.senderEmail,
        subject,
        body: htmlContent,
        status: 'failed',
        errorMsg: error.message,
      });

      throw error;
    }
  }

  async sendContactNotification(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const adminEmail = this.configService.get('BREVO_ADMIN_EMAIL') || '';

    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `New Contact: ${subject}`,
      htmlContent,
    });
  }

  async sendContactConfirmation(name: string, email: string): Promise<void> {
    const htmlContent = `
      <h2>Thank you for contacting us!</h2>
      <p>Hi ${name},</p>
      <p>We've received your message and will get back to you as soon as possible.</p>
      <p>Best regards,<br>${this.senderName}</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Message Received - Thank You',
      htmlContent,
    });
  }

  private async logEmail(data: {
    toEmail: string;
    fromEmail: string;
    subject: string;
    body: string;
    status: string;
    messageId?: string;
    errorMsg?: string;
  }): Promise<void> {
    try {
      await this.prisma.emailLog.create({
        data: {
          ...data,
          provider: 'brevo',
        },
      });
    } catch (error) {
      this.logger.error('Failed to log email:', error);
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }
}
