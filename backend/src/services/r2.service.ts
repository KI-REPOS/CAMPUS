import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
  }
});

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only video files allowed'));
  }
});

export async function uploadLectureVideo(file: Express.Multer.File, lectureId: string) {
  const ext = path.extname(file.originalname) || '.mp4';
  const key = `lectures/${lectureId}${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}
