import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/bookmarks', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: { article: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

router.post('/articles/:id/bookmark', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const articleId = String(req.params.id);

  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: { userId, articleId }
      }
    });

    if (existing) {
      res.json({ message: 'Article already bookmarked', bookmark: existing });
      return;
    }

    const bookmark = await prisma.bookmark.create({
      data: { userId, articleId }
    });

    res.status(201).json({ message: 'Article bookmarked successfully', bookmark });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ error: 'Failed to bookmark article' });
  }
});

router.delete('/articles/:id/bookmark', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const articleId = String(req.params.id);

  try {
    await prisma.bookmark.delete({
      where: {
        userId_articleId: { userId, articleId }
      }
    });

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

export default router;
