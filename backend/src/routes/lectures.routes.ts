import { Router } from 'express';
import { authenticateToken, requireFacultyOrAdmin } from '../middleware/auth';
import { videoUpload } from '../services/r2.service';
import { createLecture, listLectures, getLecture } from '../services/lecture.service';
import multer from 'multer';

const router = Router();

// Multi-file: video + audio (for STT)
const upload = multer().fields([
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);

router.get('/', authenticateToken, async (_req, res) => {
  const list = await listLectures();
  res.json(list);
});

router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const lecture = await getLecture(req.params.id, req.user!.id);
    res.json(lecture);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post(
  '/upload',
  authenticateToken,
  requireFacultyOrAdmin,
  videoUpload.single('video'),
  async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'Video file is required' });

    try {
      const audioFile = (req as any).files?.audio?.[0]; // if you add audio separately
      const lecture = await createLecture(
        req.user!.id,
        `${req.user!.firstName} ${req.user!.lastName}`,
        {
          title: req.body.title,
          description: req.body.description,
          department: req.body.department,
          subject: req.body.subject
        },
        req.file,
        audioFile
      );
      res.json(lecture);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
);

export default router;
