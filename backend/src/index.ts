import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectDatabases } from './config/database';
import authRoutes from './routes/auth.routes';
import lectureRoutes from './routes/lectures.routes';
import alumniRoutes from './routes/alumni.routes';
import forumRoutes from './routes/forum.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './socket/socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200'
  }
});

initSocket(io);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDatabases();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
})();
