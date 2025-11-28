import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { loginUser, loginWithGoogle, registerUser } from '../services/auth.service';

const router = Router();

router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('role').isIn(['student', 'faculty', 'alumni']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await registerUser(req.body);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
);

router.post('/login', body('email').isEmail(), body('password').notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Google OAuth: front-end sends idToken from Google
router.post('/google', body('idToken').notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const result = await loginWithGoogle(req.body.idToken);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
