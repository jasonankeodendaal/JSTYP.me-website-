import { Router } from 'express';
import { pool } from '../db';
import type { PinRecord } from '../../types';

const router = Router();

const generateRandomPin = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

// GET all PIN records
router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM pin_records ORDER BY "generatedAt" DESC;');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST to create or redeem a PIN
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        
        // Redeem action
        if (body.action === 'redeem' && body.pin && body.appId) {
            const { pin, appId, client } = body;
            const { rows } = await pool.query<PinRecord>('SELECT * FROM pin_records WHERE pin = $1;', [pin]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: "Invalid PIN code. Please try again." });
            }
            const recordToUpdate = rows[0];
            if (recordToUpdate.appid !== appId) {
                return res.status(400).json({ message: "This PIN is not valid for this app." });
            }
            if (recordToUpdate.isredeemed) {
                return res.status(400).json({ message: "This PIN has already been used." });
            }

            const redeemedAt = new Date().toISOString();
            const clientId = client?.id || null;
            const clientName = client?.name || null;
            const result = await pool.query(
                'UPDATE pin_records SET "isRedeemed" = TRUE, "redeemedAt" = $1, "clientId" = $2, "clientName" = $3 WHERE id = $4 RETURNING *;',
                [redeemedAt, clientId, clientName, recordToUpdate.id]
            );
            return res.status(200).json(result.rows[0]);
        }

        // Create action
        const data: Omit<PinRecord, 'id' | 'pin' | 'isRedeemed' | 'generatedAt'> = body;
        let newPin: string;
        let isUnique = false;
        while (!isUnique) {
            newPin = generateRandomPin();
            const { rowCount } = await pool.query('SELECT 1 FROM pin_records WHERE pin = $1;', [newPin]);
            if (rowCount === 0) { isUnique = true; }
        }

        const newPinRecord: PinRecord = {
            ...data,
            id: new Date().toISOString() + Math.random(),
            pin: newPin!,
            isRedeemed: false,
            generatedAt: new Date().toISOString(),
        };
        
        await pool.query(
            `INSERT INTO pin_records (id, pin, "appId", "appName", "clientDetails", "clientId", "clientName", "isRedeemed", "generatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
            [newPinRecord.id, newPinRecord.pin, newPinRecord.appId, newPinRecord.appName, JSON.stringify(newPinRecord.clientDetails), newPinRecord.clientId, newPinRecord.clientName, newPinRecord.isRedeemed, newPinRecord.generatedAt]
        );
        res.status(201).json(newPinRecord);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
