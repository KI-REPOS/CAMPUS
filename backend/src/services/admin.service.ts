import { getMySQLPool } from '../config/database';
import { ModerationLog } from '../models/mongoModels';

export async function listUsers() {
  const pool = getMySQLPool();
  const [rows] = await pool.query(
    `SELECT id, email, first_name, last_name, role,
            is_suspended, suspension_reason, suspension_end
     FROM users ORDER BY created_at DESC`
  );
  return rows;
}

export async function suspendUser(id: string, reason: string) {
  const pool = getMySQLPool();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  await pool.query(
    `UPDATE users SET is_suspended = TRUE, suspension_reason = ?, suspension_end = ? WHERE id = ?`,
    [reason, end, id]
  );
}

export async function unsuspendUser(id: string) {
  const pool = getMySQLPool();
  await pool.query(
    `UPDATE users
     SET is_suspended = FALSE, suspension_reason = NULL, suspension_end = NULL
     WHERE id = ?`,
    [id]
  );
}

export async function listModerationLogs(limit = 100) {
  return ModerationLog.find().sort({ createdAt: -1 }).limit(limit).lean();
}
