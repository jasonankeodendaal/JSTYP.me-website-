import { Router } from 'express';
import { pool } from '../db';
import type { AppShowcaseItem } from '../../types';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { id } = req.query;

        // Get single app by ID
        if (id) {
            const { rows } = await pool.query<AppShowcaseItem>('SELECT * FROM apps WHERE id = $1;', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'App not found' });
            }
            return res.status(200).json(rows[0]);
        }

        // Get all apps
        const { rows } = await pool.query('SELECT * FROM apps;');
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/', async (req, res) => { // Create App
    try {
        const appData: Omit<AppShowcaseItem, 'id' | 'ratings'> = req.body;
        const newId = new Date().toISOString() + Math.random();
        const newApp: AppShowcaseItem = { ...appData, id: newId, ratings: [] };

        await pool.query(`
            INSERT INTO apps (id, name, description, imageUrl, heroImageUrl, longDescription, price, screenshots, features, abilities, whyItWorks, dedicatedPurpose, termsAndConditions, ratings, pinCode, apkUrl, iosUrl, pwaUrl)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
        `, [newApp.id, newApp.name, newApp.description, newApp.imageUrl, newApp.heroImageUrl, newApp.longDescription, newApp.price, JSON.stringify(newApp.screenshots), JSON.stringify(newApp.features), JSON.stringify(newApp.abilities), newApp.whyItWorks, newApp.dedicatedPurpose, newApp.termsAndConditions, JSON.stringify(newApp.ratings), newApp.pinCode, newApp.apkUrl, newApp.iosUrl, newApp.pwaUrl]);
        
        return res.status(201).json(newApp);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/', async (req, res) => { // Update App
    try {
        const app: AppShowcaseItem = req.body;
        const { id } = app;
        if (!id) {
            return res.status(400).json({ message: 'App ID is required for update' });
        }
        await pool.query(`
            UPDATE apps SET name = $1, description = $2, imageUrl = $3, heroImageUrl = $4, longDescription = $5, price = $6, screenshots = $7, features = $8, abilities = $9, whyItWorks = $10, dedicatedPurpose = $11, termsAndConditions = $12, pinCode = $13, apkUrl = $14, iosUrl = $15, pwaUrl = $16 WHERE id = $17;
        `, [app.name, app.description, app.imageUrl, app.heroImageUrl, app.longDescription, app.price, JSON.stringify(app.screenshots), JSON.stringify(app.features), JSON.stringify(app.abilities), app.whyItWorks, app.dedicatedPurpose, app.termsAndConditions, app.pinCode, app.apkUrl, app.iosUrl, app.pwaUrl, id]);
        
        return res.status(200).json(app);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.delete('/', async (req, res) => { // Delete App
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'App ID query parameter is required for deletion' });
        }
        await pool.query('DELETE FROM apps WHERE id = $1;', [id]);
        return res.status(200).json({ message: 'App deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.patch('/', async (req, res) => { // Add/Update rating
    try {
        const { appId, clientId, rating } = req.body;
        if (!appId || !clientId || typeof rating !== 'number') {
            return res.status(400).json({ message: 'appId, clientId and a valid rating are required' });
        }

        const { rows } = await pool.query<{ ratings: { clientId: string; rating: number }[] }>('SELECT ratings FROM apps WHERE id = $1;', [appId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'App not found' });
        }

        const app = rows[0];
        const currentRatings = Array.isArray(app.ratings) ? app.ratings : [];
        const existingRatingIndex = currentRatings.findIndex(r => r.clientId === clientId);

        if (existingRatingIndex > -1) {
            currentRatings[existingRatingIndex].rating = rating;
        } else {
            currentRatings.push({ clientId, rating });
        }
        
        await pool.query('UPDATE apps SET ratings = $1 WHERE id = $2;', [JSON.stringify(currentRatings), appId]);
        const { rows: updatedRows } = await pool.query<AppShowcaseItem>('SELECT * FROM apps WHERE id = $1;', [appId]);
        return res.status(200).json(updatedRows[0]);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
