import { getMySQLPool } from '../config/database';
import { ChatMessage, ForumPost } from '../models/mongoModels';

export async function getAnalytics() {
  const pool = getMySQLPool();

  const [[userCounts]]: any = await pool.query(
    `SELECT
       SUM(role='student') AS students,
       SUM(role='faculty') AS faculty,
       SUM(role='alumni') AS alumni,
       SUM(role='admin') AS admins
     FROM users`
  );

  const [[lectureCounts]]: any = await pool.query(
    `SELECT COUNT(*) AS lectureCount, COALESCE(SUM(views),0) AS totalViews FROM lectures`
  );

  const chatCount = await ChatMessage.countDocuments({});
  const forumCount = await ForumPost.countDocuments({});

  return {
    users: userCounts,
    lectures: lectureCounts,
    chatMessages: chatCount,
    forumPosts: forumCount
  };
}
