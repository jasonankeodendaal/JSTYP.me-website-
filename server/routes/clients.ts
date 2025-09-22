import { Router } from 'express';
import { pool } from '../db';
import type { Client } from '../../types';

const router = Router();

// GET clients by ID, email, or all
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

        const { rows } = await pool.query('SELECT id, name, email FROM clients;');
        res.status(200).json(rows);

    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST a new client (signup)
router.post('/', async (req, res) => {
    try {
        const { name, email, password }: Omit<Client, 'id'> = req.body;
        const newClient: Client = {
            id: new Date().toISOString() + Math.random(),
            name,
            email,
            password, // In a real app, hash this password
        };

        await pool.query(
            'INSERT INTO clients (id, name, email, password) VALUES ($1, $2, $3, $4);',
            [newClient.id, newClient.name, newClient.email, newClient.password]
        );
        
        const { password: _, ...clientToReturn } = newClient;
        res.status(201).json(clientToReturn);

    } catch (error) {
        // Handle unique constraint violation for email
        if ((error as any).code === '23505') {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
