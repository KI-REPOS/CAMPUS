import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getMySQLPool } from '../config/database';
import { ChatMessage } from '../models/mongoModels';
import { moderateAndPossiblySuspend } from '../services/contentModeration.service';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

interface UserContext {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function initSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Token required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      const pool = getMySQLPool();
      const [rows] = await pool.query(
        `SELECT id, email, role, first_name, last_name, is_suspended
         FROM users WHERE id = ?`,
        [decoded.userId]
      );
      const users = rows as any[];
      if (!users.length || users[0].is_suspended) {
        return next(new Error('User suspended or not found'));
      }

      const u = users[0];
      (socket as any).user = {
        id: u.id,
        email: u.email,
        role: u.role,
        name: `${u.first_name} ${u.last_name}`
      } as UserContext;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', socket => {
    const user = (socket as any).user as UserContext;
    console.log(`🔌 Socket connected: ${user.name}`);

    socket.on('joinRoom', (room: string) => {
      socket.join(room);
    });

    socket.on('message', async ({ room, message }: { room: string; message: string }) => {
      const ctx = (socket as any).user as UserContext;

      const moderation = await moderateAndPossiblySuspend(
        message,
        ctx.id,
        ctx.name,
        'chat',
        'socket:' + Date.now()
      );

      if (moderation.action === 'suspension') {
        socket.emit('suspended', { reason: 'Policy violation' });
        socket.disconnect();
        return;
      }

      if (!moderation.isAppropriate && moderation.action === 'content_removed') {
        socket.emit('message-rejected', { reason: 'Message removed by moderation' });
        return;
      }

      const saved = await ChatMessage.create({
        userId: ctx.id,
        userName: ctx.name,
        room,
        message,
        isModerated: !moderation.isAppropriate,
        moderationFlags: moderation.flags
      });

      io.to(room).emit('message', {
        id: saved.id,
        userId: ctx.id,
        userName: ctx.name,
        room,
        message,
        createdAt: saved.createdAt
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${user.name}`);
    });
  });
}
