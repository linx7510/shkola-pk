import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const S3_ENDPOINT = process.env.S3_ENDPOINT || '';
const S3_BUCKET = process.env.S3_BUCKET || '';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
const S3_REGION = process.env.S3_REGION || 'ru-1';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client | null {
  if (!S3_ENDPOINT || !S3_ACCESS_KEY_ID) return null;
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: S3_ENDPOINT, region: S3_REGION,
      credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

export function isS3Enabled(): boolean {
  return !!S3_ENDPOINT && !!S3_BUCKET && !!S3_ACCESS_KEY_ID;
}

export async function uploadToS3(key: string, body: Buffer | Readable, contentType: string): Promise<string | null> {
  const client = getS3Client();
  if (!client) return null;
  try {
    await client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: body, ContentType: contentType }));
    return `/api/media/s3/${encodeURIComponent(key)}`;
  } catch (e) { console.error('[S3] Upload error:', e); return null; }
}

export async function deleteFromS3(key: string): Promise<boolean> {
  const client = getS3Client();
  if (!client) return false;
  try { await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })); return true; }
  catch (e) { console.error('[S3] Delete error:', e); return false; }
}

export async function getFromS3(key: string): Promise<Buffer | null> {
  const client = getS3Client();
  if (!client) return null;
  try {
    const r = await client.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    const bytes = await r.Body!.transformToByteArray();
    return Buffer.from(bytes);
  } catch (e) { console.error('[S3] Get error:', e); return null; }
}

export { S3_BUCKET };
