import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import healthRoutes from './routes/health.js';
import articleRoutes from './routes/articles.js';
import factCheckRoutes from './routes/factCheck.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import commentRoutes from './routes/comments.js';
import digestRoutes from './routes/digest.js';

import { newsService } from './services/newsService.js';
import { startNewsCronJob } from './jobs/newsCron.js';
import { startDigestCronJob } from './jobs/digestCron.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin || allowedOrigin === '*') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'AI summarization rate limit reached, please wait a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/fact-check', factCheckRoutes);
app.use('/api/digest', digestRoutes);
app.use('/api/articles/:id/summarize', aiLimiter);
app.use('/api', aiRoutes);
app.use('/api', userRoutes);
app.use('/api', commentRoutes);

// Explicitly initialize cron schedulers
startNewsCronJob();
startDigestCronJob();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  // Immediate non-blocking startup news sync
  (async () => {
    console.log('[BOOT] Triggering automatic startup news sync...');
    try {
      const result = await newsService.syncNews();
      console.log(`[BOOT] Startup news sync completed. Synced: ${result.syncedCount}, Errors: ${result.errorsCount}`);
    } catch (error) {
      console.error('[BOOT] Error during automatic startup news sync:', error);
    }
  })();
});
