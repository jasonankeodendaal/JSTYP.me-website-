import { Router } from 'express';
import { pool } from '../db';
import { GoogleGenAI } from '@google/genai';
import { saveVideoBuffer } from '../uploader';
import { Buffer } from 'buffer';
import type { Video } from '../../types';

const router = Router();

// Ensure API_KEY is checked once
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// GET all completed videos
router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query<Video>(`SELECT * FROM videos WHERE status = 'completed' ORDER BY "createdAt" DESC;`);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ message: (error as Error).message });
    }
});

// POST to start a new video generation
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const newVideo: Video = {
            id: new Date().toISOString() + Math.random(),
            prompt,
            status: 'processing',
            createdAt: new Date().toISOString(),
        };
        await pool.query(
            `INSERT INTO videos (id, prompt, status, "createdAt") VALUES ($1, $2, $3, $4);`,
            [newVideo.id, newVideo.prompt, newVideo.status, newVideo.createdAt]
        );
        
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: { numberOfVideos: 1 }
        });

        res.status(202).json({ video: newVideo, operationName: operation.name });

    } catch (error) {
        console.error("Error starting video generation:", error);
        res.status(500).json({ message: (error as Error).message });
    }
});

// GET to check the status of an operation and finalize the video
router.get('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { operationName } = req.query;

    if (!operationName || typeof operationName !== 'string') {
        return res.status(400).json({ message: 'operationName query parameter is required' });
    }

    try {
        let operation = await ai.operations.getVideosOperation({ operation: { name: operationName } });
        
        if (!operation.done) {
            return res.status(200).json({ status: 'processing' });
        }

        if (operation.error) {
            await pool.query(`UPDATE videos SET status = 'failed' WHERE id = $1;`, [id]);
            return res.status(500).json({ status: 'failed', message: operation.error.message });
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            await pool.query(`UPDATE videos SET status = 'failed' WHERE id = $1;`, [id]);
            return res.status(500).json({ status: 'failed', message: 'Video generation finished but no download link was found.' });
        }
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.statusText}`);
        }
        const videoArrayBuffer = await videoResponse.arrayBuffer();
        const videoBuffer = Buffer.from(videoArrayBuffer);
        
        const videoUrl = await saveVideoBuffer(videoBuffer);

        const { rows } = await pool.query(
            `UPDATE videos SET status = 'completed', "videoUrl" = $1 WHERE id = $2 RETURNING *;`,
            [videoUrl, id]
        );

        res.status(200).json({ status: 'completed', video: rows[0] });

    } catch (error) {
        console.error(`Error checking status for video ${id}:`, error);
        await pool.query(`UPDATE videos SET status = 'failed' WHERE id = $1;`).catch(console.error);
        res.status(500).json({ status: 'failed', message: (error as Error).message });
    }
});


export default router;
