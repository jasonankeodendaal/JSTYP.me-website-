import { Router } from 'express';
import { pool } from '../db';
import type { RedownloadRequest } from '../../types';

const router = Router();

router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query<RedownloadRequest>('SELECT * FROM redownload_requests ORDER BY requestedAt DESC;');
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/', async (req, res) => {
    try {
        const requestData: Omit<RedownloadRequest, 'id' | 'status' | 'requestedAt'> = req.body;
        const { rows: existingRows } = await pool.query(`
            SELECT * FROM redownload_requests WHERE clientId = $1 AND appId = $2 AND status = 'pending';
        `, [requestData.clientId, requestData.appId]);

        if (existingRows.length > 0) {
            return res.status(200).json(null);
        }
        const newRequest: RedownloadRequest = { ...requestData, id: new Date().toISOString() + Math.random(), status: 'pending', requestedAt: new Date().toISOString() };
        await pool.query(`
            INSERT INTO redownload_requests (id, clientId, clientName, appId, appName, status, requestedAt)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [newRequest.id, newRequest.clientId, newRequest.clientName, newRequest.appId, newRequest.appName, newRequest.status, newRequest.requestedAt]);
        
        return res.status(201).json(newRequest);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/', async (req, res) => {
    try {
        const { id, status, resolutionNotes } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Request ID is required in the body' });
        }
        if (!['approved', 'denied'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await pool.query(`
            UPDATE redownload_requests SET status = $1, resolutionNotes = $2 WHERE id = $3 RETURNING *;
        `, [status, resolutionNotes, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
