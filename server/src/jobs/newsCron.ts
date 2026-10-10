import cron from 'node-cron';
import { newsService } from '../services/newsService.js';

export function startNewsCronJob(): void {
  // Cron schedule: every 60 minutes ('0 * * * *')
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Starting scheduled news sync...');
    try {
      const result = await newsService.syncNews();
      console.log(`[CRON] News sync complete. Synced: ${result.syncedCount}, Errors: ${result.errorsCount}`);
    } catch (error) {
      console.error('[CRON] Error during news sync cron job:', error);
    }
  });

  console.log('[CRON] News sync background cron job initialized (runs every 60 minutes).');
}
