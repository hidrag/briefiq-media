import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Category } from '../types/news.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryQuery = req.query.category as string | undefined;
    const pageParam = parseInt(req.query.page as string, 10) || 1;
    const limitParam = parseInt(req.query.limit as string, 10) || 20;

    const page = Math.max(1, pageParam);
    const limit = Math.max(1, Math.min(100, limitParam));
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (categoryQuery && Object.values(Category).includes(categoryQuery.toUpperCase() as Category)) {
      whereClause.category = categoryQuery.toUpperCase();
    }

    const [articles, totalArticles] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalArticles / limit);

    res.json({
      articles,
      pagination: {
        page,
        limit,
        totalArticles,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

export default router;
