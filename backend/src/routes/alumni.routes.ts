import { Router } from 'express';
import { authenticateToken, requireStudentOrAbove } from '../middleware/auth';
import {
  listAlumni,
  getAlumniProfile,
  requestMentorship,
  getMentorshipRequestsForAlumni,
  respondToMentorshipRequest
} from '../services/alumni.service';

const router = Router();

router.get('/', authenticateToken, requireStudentOrAbove, async (_req, res) => {
  const list = await listAlumni();
  res.json(list);
});

router.get('/:id', authenticateToken, requireStudentOrAbove, async (req: any, res) => {
  try {
    const profile = await getAlumniProfile(req.params.id, req.user!.id);
    res.json(profile);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post('/:id/mentorship', authenticateToken, requireStudentOrAbove, async (req: any, res) => {
  try {
    const result = await requestMentorship(req.user!.id, req.params.id, req.body.message);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get(
  '/me/requests',
  authenticateToken,
  async (req: any, res) => {
    if (req.user!.role !== 'alumni') return res.status(403).json({ error: 'Only alumni' });
    const list = await getMentorshipRequestsForAlumni(req.user!.id);
    res.json(list);
  }
);

router.post(
  '/requests/:requestId/respond',
  authenticateToken,
  async (req: any, res) => {
    if (req.user!.role !== 'alumni') return res.status(403).json({ error: 'Only alumni' });
    try {
      await respondToMentorshipRequest(req.user!.id, req.params.requestId, req.body.status);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
);

export default router;
