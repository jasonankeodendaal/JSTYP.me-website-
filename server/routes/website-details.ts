import { Router } from 'express';
import { pool } from '../db';
import type { WebsiteDetails } from '../../types';

const router = Router();

router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query('SELECT details FROM website_details WHERE id = 1;');
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Website details not found' });
        }
        return res.status(200).json(rows[0].details);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/', async (req, res) => {
    try {
        // This endpoint now only handles website details data updates.
        // Image uploads are handled by the /api/upload route.
        const newDetails: WebsiteDetails = req.body;
        await pool.query(`
            INSERT INTO website_details (id, details) VALUES (1, $1)
            ON CONFLICT (id) DO UPDATE SET details = $1;
        `, [JSON.stringify(newDetails)]);
        return res.status(200).json(newDetails);

    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
