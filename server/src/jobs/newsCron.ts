import cron from 'node-cron';
import { newsService } from '../services/newsService.js';

export function startNewsCronJob(): void {
  // Cron schedule: every 30 minutes ('*/30 * * * *')
  cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Starting periodic news sync (every 30 mins)...');
    try {
      const result = await newsService.syncNews();
      console.log(`[CRON] News sync completed. Synced: ${result.syncedCount}, Errors: ${result.errorsCount}`);
    } catch (error) {
      console.error('[CRON] Error during news sync cron job:', error);
    }
  });

  console.log('[CRON] News sync background cron job initialized (runs every 30 minutes).');
}
