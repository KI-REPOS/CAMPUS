import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { listUsers, suspendUser, unsuspendUser, listModerationLogs } from '../services/admin.service';

const router = Router();

router.get('/users', authenticateToken, requireAdmin, async (_req, res) => {
  const users = await listUsers();
  res.json(users);
});

router.post('/users/:id/suspend', authenticateToken, requireAdmin, async (req, res) => {
  await suspendUser(req.params.id, req.body.reason || 'Admin action');
  res.json({ ok: true });
});

router.post('/users/:id/unsuspend', authenticateToken, requireAdmin, async (req, res) => {
  await unsuspendUser(req.params.id);
  res.json({ ok: true });
});

router.get('/moderation-logs', authenticateToken, requireAdmin, async (_req, res) => {
  const logs = await listModerationLogs();
  res.json(logs);
});

export default router;
