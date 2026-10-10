import { Router, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { digestService } from '../services/digestService.js';

const router = Router();

router.post('/send-test', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  const targetEmail = req.user?.email;

  if (!targetEmail) {
    res.status(400).json({ error: 'User email not found' });
    return;
  }

  try {
    const result = await digestService.sendTestDigest(targetEmail);
    res.json({ message: 'Test digest triggered successfully', result });
  } catch (error) {
    console.error('Error triggering test digest:', error);
    res.status(500).json({ error: 'Failed to send test digest' });
  }
});

export default router;
