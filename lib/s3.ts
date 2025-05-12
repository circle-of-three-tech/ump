import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_BUCKET_NAME) {
  throw new Error('Missing required AWS environment variables');
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = '',
  acl: 'public-read' | 'private' = 'public-read'
): Promise<string> {
  const key = folder ? `${folder}/${fileName}` : fileName;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: acl,
  });

  await s3Client.send(command);
  
  if (acl === 'private') {
    // For private files, return a pre-signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  }
  
  // For public files, return the permanent public URL
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// Helper to generate a unique file name
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
}