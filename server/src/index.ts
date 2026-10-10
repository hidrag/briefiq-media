import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articleRoutes from './routes/articles.js';
import factCheckRoutes from './routes/factCheck.js';
import { startNewsCronJob } from './jobs/newsCron.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/articles', articleRoutes);
app.use('/api/fact-check', factCheckRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  startNewsCronJob();
});
