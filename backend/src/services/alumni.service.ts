import { getMySQLPool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { UserRow } from '../models/types';

export async function listAlumni() {
  const pool = getMySQLPool();
  const [rows] = await pool.query(
    `SELECT id, first_name, last_name, department, graduation_year,
            company, position, linkedin_profile, mentorship_available
     FROM users WHERE role = 'alumni' ORDER BY graduation_year DESC`
  );
  return rows;
}

export async function getAlumniProfile(id: string, requesterId: string) {
  const pool = getMySQLPool();
  const [rows] = await pool.query(`SELECT * FROM users WHERE id = ? AND role='alumni'`, [id]);
  const users = rows as UserRow[];
  if (!users.length) throw new Error('Alumni not found');
  const a = users[0];

  // Protect contact data: don't return email here, or any phone (if you add).
  return {
    id: a.id,
    firstName: a.first_name,
    lastName: a.last_name,
    department: a.department,
    graduationYear: a.graduation_year,
    company: a.company,
    position: a.position,
    linkedinProfile: a.linkedin_profile,
    mentorshipAvailable: a.mentorship_available
    // contact info remains internal; use messaging / mentorship requests.
  };
}

export async function requestMentorship(
  studentId: string,
  alumniId: string,
  message: string
) {
  const pool = getMySQLPool();
  const id = uuidv4();

  await pool.query(
    `INSERT INTO mentorship_requests (id, student_id, alumni_id, message)
     VALUES (?, ?, ?, ?)`,
    [id, studentId, alumniId, message]
  );

  return { id };
}

export async function getMentorshipRequestsForAlumni(alumniId: string) {
  const pool = getMySQLPool();
  const [rows] = await pool.query(
    `SELECT mr.id, mr.message, mr.status, mr.created_at,
            u.first_name AS student_first_name, u.last_name AS student_last_name
     FROM mentorship_requests mr
     JOIN users u ON u.id = mr.student_id
     WHERE mr.alumni_id = ?
     ORDER BY mr.created_at DESC`,
    [alumniId]
  );
  return rows;
}

export async function respondToMentorshipRequest(
  alumniId: string,
  requestId: string,
  status: 'accepted' | 'rejected'
) {
  const pool = getMySQLPool();
  await pool.query(
    `UPDATE mentorship_requests
     SET status = ?, responded_at = NOW()
     WHERE id = ? AND alumni_id = ?`,
    [status, requestId, alumniId]
  );
  return { ok: true };
}
