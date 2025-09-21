import { Router } from 'express';
import { Buffer } from 'buffer';
import { uploadToS3 } from '../s3';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { file } = req.body; // Expects a base64 string
        if (!file) {
            return res.status(400).json({ message: 'No file provided.' });
        }
        const mimeTypeMatch = file.match(/data:(.*);base64,/);
        if (!mimeTypeMatch) {
            return res.status(400).json({ message: 'Invalid base64 file format' });
        }
        const mimeType = mimeTypeMatch[1];
        const base64Data = file.split(',')[1];
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const fileExtension = mimeType.split('/')[1] || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
        
        const url = await uploadToS3(fileBuffer, fileName, mimeType);

        return res.status(200).json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: (error as Error).message });
    }
});

export default router;
