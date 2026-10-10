import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'HEALTHY'
    });
  } catch (error) {
    console.error('Healthcheck DB ping failed:', error);
    res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      database: 'UNHEALTHY'
    });
  }
});

export default router;
