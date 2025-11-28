import { getMySQLPool } from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { isAllowedDomain } from '../config/authDomains';
import { signAccessToken } from '../utils/jwt';
import { UserRow } from '../models/types';
import { verifyGoogleIdToken } from '../config/googleAuth';

export async function registerUser(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'faculty' | 'alumni';
}) {
  if (!isAllowedDomain(payload.email)) throw new Error('Email domain not allowed');

  const pool = getMySQLPool();
  const id = uuidv4();
  const hashed = await bcrypt.hash(payload.password, 10);

  await pool.query(
    `INSERT INTO users (id, email, password, first_name, last_name, role, is_email_verified)
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [id, payload.email, hashed, payload.firstName, payload.lastName, payload.role]
  );

  const token = signAccessToken(id);
  return { token, userId: id };
}

export async function loginUser(email: string, password: string) {
  const pool = getMySQLPool();
  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
  const users = rows as UserRow[];

  if (!users.length) throw new Error('Invalid credentials');
  const u = users[0];
  const ok = await bcrypt.compare(password, u.password);
  if (!ok) throw new Error('Invalid credentials');
  if (u.is_suspended) throw new Error('Account suspended');

  const token = signAccessToken(u.id);
  return {
    token,
    user: {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role
    }
  };
}

// Google OAuth: front-end sends id_token from Google Identity Services
export async function loginWithGoogle(idToken: string) {
  const payload = await verifyGoogleIdToken(idToken);
  if (!payload.emailVerified) throw new Error('Google email not verified');
  if (!isAllowedDomain(payload.email)) throw new Error('Email domain not allowed');

  const pool = getMySQLPool();
  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [payload.email]);
  const users = rows as UserRow[];

  let user: UserRow;
  if (!users.length) {
    // default: student role for new accounts, you can adjust
    const id = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role, is_email_verified)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [id, payload.email, '', payload.name.split(' ')[0], payload.name.split(' ').slice(1).join(' '), 'student']
    );
    const [rowsNew] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    user = (rowsNew as UserRow[])[0];
  } else {
    user = users[0];
  }

  if (user.is_suspended) throw new Error('Account suspended');

  const token = signAccessToken(user.id);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    }
  };
}
