import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/aiService.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/articles/:id/summarize', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    if (article.summary) {
      res.json({
        articleId: article.id,
        summary: article.summary,
        cached: true
      });
      return;
    }

    const contentToSummarize = article.content || article.description || article.title;
    if (!contentToSummarize) {
      res.status(400).json({ error: 'Article has no content or description to summarize' });
      return;
    }

    const summaryResult = await aiService.generateSummary(contentToSummarize);

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        summary: summaryResult as any
      }
    });

    res.json({
      articleId: updatedArticle.id,
      summary: updatedArticle.summary,
      cached: false
    });
  } catch (error) {
    console.error(`Error summarizing article ${id}:`, error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;
