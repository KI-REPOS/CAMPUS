import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getAnalytics } from '../services/analytics.service';

const router = Router();

router.get('/', authenticateToken, requireAdmin, async (_req, res) => {
  const stats = await getAnalytics();
  res.json(stats);
});

export default router;
