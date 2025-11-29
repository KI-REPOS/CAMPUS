import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let mysqlPool: mysql.Pool;

export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI!;
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
}

export function getMySQLPool() {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST!,
      user: process.env.MYSQL_USER!,
      password: process.env.MYSQL_PASSWORD!,
      database: process.env.MYSQL_DATABASE!,
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4'
    });
  }
  return mysqlPool;
}

export async function connectMySQL() {
  const pool = getMySQLPool();
  await pool.query('SELECT 1');
  console.log('✅ MySQL connected');
}

export async function connectDatabases() {
  await connectMongoDB();
  // await connectMySQL();
}
