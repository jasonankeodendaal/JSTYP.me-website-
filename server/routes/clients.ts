import { Router } from 'express';
import { pool } from '../db';
import type { Client } from '../../types';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { id, email } = req.query;

        if (id) {
            const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1;', [id]);
            return res.status(200).json(rows[0] || null);
        }

        if (email) {
            const { rows } = await pool.query('SELECT * FROM clients WHERE lower(email) = lower($1);', [email]);
            return res.status(200).json(rows[0] || null);
        }

        // Default: get all clients (excluding password)
        const { rows } = await pool.query('SELECT id, name, email FROM clients;');
        return res.status(200).json(rows);

    } catch (error) {
         return res.status(500).json({ error: (error as Error).message });
    }
});


router.post('/', async (req, res) => {
    try {
        const { name, email: postEmail, password }: Omit<Client, 'id'> = req.body;
        const newClient: Client = {
            id: new Date().toISOString() + Math.random(),
            name,
            email: postEmail,
            password, // In a real app, hash this password
        };

        await pool.query(`
            INSERT INTO clients (id, name, email, password)
            VALUES ($1, $2, $3, $4);
        `, [newClient.id, newClient.name, newClient.email, newClient.password]);
        
        const { password: _, ...clientToReturn } = newClient;
        return res.status(201).json(clientToReturn);

    } catch (error) {
        // Handle unique constraint violation for email
        if ((error as any).code === '23505') {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        return res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
