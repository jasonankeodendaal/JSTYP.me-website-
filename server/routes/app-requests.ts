import { Router } from 'express';
import { pool } from '../db';
import type { AppRequest } from '../../types';

const router = Router();

// GET all app requests
router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query<AppRequest>('SELECT * FROM app_requests ORDER BY "submittedAt" DESC;');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST a new app request
router.post('/', async (req, res) => {
    try {
        const { problemDescription } = req.body;
        const newRequest: AppRequest = { 
            id: new Date().toISOString() + Math.random(), 
            problemDescription, 
            status: 'thinking', 
            submittedAt: new Date().toISOString() 
        };
        await pool.query(
            'INSERT INTO app_requests (id, "problemDescription", status, "submittedAt") VALUES ($1, $2, $3, $4);',
            [newRequest.id, newRequest.problemDescription, newRequest.status, newRequest.submittedAt]
        );
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PATCH to update status
router.patch('/', async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Request ID is required in the body' });
        }
        if (status !== 'thinking' && status !== 'done') {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const result = await pool.query(
            'UPDATE app_requests SET status = $1 WHERE id = $2 RETURNING *;',
            [status, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
