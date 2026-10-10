import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { digestService } from '../services/digestService.js';

const prisma = new PrismaClient();

export function startDigestCronJob(): void {
  // Cron schedule: 08:00 AM daily ('0 8 * * *')
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Starting daily 08:00 AM digest dispatch...');
    try {
      const users = await prisma.user.findMany({ select: { email: true } });
      for (const user of users) {
        await digestService.sendTestDigest(user.email);
      }
      console.log(`[CRON] Daily digest dispatch completed for ${users.length} users.`);
    } catch (error) {
      console.error('[CRON] Error sending daily digest emails:', error);
    }
  });

  console.log('[CRON] Daily digest email cron job initialized (runs at 08:00 AM daily).');
}
