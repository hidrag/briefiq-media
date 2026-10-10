import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DigestService {
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== 'your-resend-api-key') {
      this.resend = new Resend(apiKey);
    } else {
      console.warn('RESEND_API_KEY is not configured or using default placeholder.');
    }
  }

  async generateDigestHTML(): Promise<{ html: string; count: number }> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const topArticles = await prisma.article.findMany({
      where: {
        publishedAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    // Fallback if no articles in the last 24h
    const articles = topArticles.length > 0
      ? topArticles
      : await prisma.article.findMany({ orderBy: { publishedAt: 'desc' }, take: 5 });

    const articleItemsHTML = articles
      .map(
        (art) => `
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <span style="font-size: 11px; font-weight: bold; color: #2563eb; text-transform: uppercase;">${art.sourceName} • ${art.category}</span>
        <h3 style="margin: 6px 0; font-size: 18px; color: #0f172a;">
          <a href="${art.sourceUrl}" style="color: #0f172a; text-decoration: none;">${art.title}</a>
        </h3>
        <p style="margin: 4px 0 12px 0; font-size: 14px; color: #475569; line-height: 1.5;">${art.description || 'No summary available.'}</p>
        <a href="${art.sourceUrl}" style="display: inline-block; font-size: 12px; font-weight: 600; color: #2563eb; text-decoration: none;">Read full story &rarr;</a>
      </div>
    `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Daily News Briefing</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px; margin: 0;">
        <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="margin: 0; font-size: 24px; color: #0f172a;">Morning News Briefing 🗞️</h1>
            <p style="margin-top: 6px; font-size: 14px; color: #64748b;">Your personalized AI-curated top stories for today</p>
          </div>
          ${articleItemsHTML}
          <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8;">
            <p>Sent by NewsHub AI • Personalized Media Hub</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { html, count: articles.length };
  }

  async sendTestDigest(targetEmail: string): Promise<{ success: boolean; id?: string }> {
    const { html, count } = await this.generateDigestHTML();

    if (!this.resend) {
      console.log(`[MOCK EMAIL] Simulating sending digest email with ${count} articles to ${targetEmail}`);
      return { success: true, id: 'mock-email-id' };
    }

    try {
      const response = await this.resend.emails.send({
        from: 'NewsHub <onboarding@resend.dev>',
        to: [targetEmail],
        subject: 'Your Daily News Briefing 🗞️',
        html,
      });

      return { success: true, id: response.data?.id };
    } catch (error) {
      console.error('Error sending email digest with Resend:', error);
      throw error;
    }
  }
}

export const digestService = new DigestService();
