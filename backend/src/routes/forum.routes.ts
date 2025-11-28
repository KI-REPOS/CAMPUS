import { Router } from 'express';
import { authenticateToken, requireStudentOrAbove } from '../middleware/auth';
import { createForumPost, listForumPosts, getForumPost } from '../services/forum.service';

const router = Router();

router.get('/', authenticateToken, requireStudentOrAbove, async (_req, res) => {
  const posts = await listForumPosts();
  res.json(posts);
});

router.get('/:id', authenticateToken, requireStudentOrAbove, async (req, res) => {
  try {
    const post = await getForumPost(req.params.id);
    res.json(post);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post('/', authenticateToken, requireStudentOrAbove, async (req: any, res) => {
  try {
    const post = await createForumPost(req.user!.id, `${req.user!.firstName} ${req.user!.lastName}`, {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: req.body.tags || []
    });
    res.json(post);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
