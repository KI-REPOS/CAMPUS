import { getMySQLPool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { uploadLectureVideo } from './r2.service';
import { transcribeAudioBuffer } from './transcription.service';
import { CaptionSegment } from './transcription.service';

export async function createLecture(
  facultyId: string,
  facultyName: string,
  data: {
    title: string;
    description: string;
    department: string;
    subject: string;
  },
  videoFile: Express.Multer.File,
  audioFile?: Express.Multer.File
) {
  const id = uuidv4();
  const videoUrl = await uploadLectureVideo(videoFile, id);

  let transcript = '';
  let captions: CaptionSegment[] = [];

  if (audioFile) {
    const result = await transcribeAudioBuffer(audioFile.buffer);
    transcript = result.transcript;
    captions = result.captions;
  }

  const pool = getMySQLPool();
  await pool.query(
    `INSERT INTO lectures
     (id, title, description, faculty_id, faculty_name, video_url, video_duration, transcript, captions, department, subject)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.description,
      facultyId,
      facultyName,
      videoUrl,
      0,
      transcript,
      JSON.stringify(captions),
      data.department,
      data.subject
    ]
  );

  return { id, videoUrl, transcript, captions };
}

export async function listLectures() {
  const pool = getMySQLPool();
  const [rows] = await pool.query(`SELECT * FROM lectures ORDER BY upload_date DESC`);
  return rows;
}

export async function getLecture(id: string, userId: string) {
  const pool = getMySQLPool();
  const [rows] = await pool.query(`SELECT * FROM lectures WHERE id = ?`, [id]);
  const list = rows as any[];
  if (!list.length) throw new Error('Lecture not found');
  const lecture = list[0];
  lecture.captions = JSON.parse(lecture.captions || '[]');

  // log view
  await pool.query(`INSERT INTO views_log (lecture_id, user_id) VALUES (?, ?)`, [id, userId]);
  await pool.query(`UPDATE lectures SET views = views + 1 WHERE id = ?`, [id]);

  return lecture;
}
