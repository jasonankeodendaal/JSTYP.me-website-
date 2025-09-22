import fs from 'fs/promises';
import path from 'path';
// FIX: Add imports for Buffer and __dirname polyfill
import { Buffer } from 'buffer';
import { fileURLToPath } from 'url';

// FIX: Polyfill __dirname for ES modules environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This path corresponds to the disk mount path in render.yaml
const UPLOADS_DIR = process.env.NODE_ENV === 'production' 
    ? '/var/data/uploads' 
    : path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists on server startup
export const ensureUploadsDir = async () => {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        console.log(`Uploads directory ensured at: ${UPLOADS_DIR}`);
    } catch (error) {
        console.error("Error creating uploads directory:", error);
    }
};

export const saveBase64Image = async (base64: string): Promise<string> => {
    // If it's not a base64 string, assume it's already a URL or empty, and return it.
    if (!base64 || !base64.startsWith('data:image')) {
        return base64;
    }

    const mimeTypeMatch = base64.match(/data:(image\/\w+);base64,/);
    if (!mimeTypeMatch) {
        throw new Error("Invalid base64 image format");
    }
    
    const mimeType = mimeTypeMatch[1];
    const extension = mimeType.split('/')[1] || 'png';
    const base64Data = base64.split(',')[1];
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await fs.writeFile(filePath, fileBuffer);

    // Construct the public URL using the BACKEND_URL environment variable from Render
    const publicUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
    return publicUrl;
};

export const saveVideoBuffer = async (buffer: Buffer): Promise<string> => {
    const extension = 'mp4';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
    return publicUrl;
};
