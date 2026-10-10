import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/articles/:id/comments', async (req: Request, res: Response): Promise<void> => {
  const articleId = String(req.params.id);

  try {
    const comments = await prisma.comment.findMany({
      where: { articleId },
      include: {
        user: {
          select: { id: true, email: true }
        },
        replies: {
          include: {
            user: { select: { id: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/articles/:id/comments', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const articleId = String(req.params.id);
  const { content, parentId } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'Comment content is required' });
    return;
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        userId,
        articleId,
        content: content.trim(),
        parentId: parentId || null
      },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

export default router;
