import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import 'dotenv/config';
// FIX: Imported Buffer type to resolve the 'Cannot find name Buffer' error.
import { Buffer } from 'buffer';

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    // For S3-compatible services like DigitalOcean Spaces or MinIO, you might need an endpoint URL.
    // endpoint: process.env.AWS_ENDPOINT_URL, 
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export const uploadToS3 = async (fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
    });

    await s3Client.send(command);
    
    // Construct the public URL. This might vary based on S3 provider.
    // For AWS S3:
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};