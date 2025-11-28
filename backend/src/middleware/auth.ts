import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getMySQLPool } from '../config/database';
import { UserRow } from '../models/types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE id = ? AND is_suspended = FALSE`,
      [decoded.userId]
    );
    const users = rows as UserRow[];

    if (!users.length) return res.status(401).json({ error: 'User not found or suspended' });

    const u = users[0];
    req.user = {
      id: u.id,
      email: u.email,
      role: u.role,
      firstName: u.first_name,
      lastName: u.last_name
    };
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export const requireAdmin = requireRole(['admin']);
export const requireFacultyOrAdmin = requireRole(['faculty', 'admin']);
export const requireStudentOrAbove = requireRole(['student', 'faculty', 'alumni', 'admin']);
