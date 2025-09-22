import { Router } from 'express';
import { pool } from '../db';
import { saveBase64Image } from '../uploader';
import type { AppShowcaseItem } from '../../types';

const router = Router();

// GET all apps or a single app by ID
router.get('/', async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            const { rows } = await pool.query<AppShowcaseItem>('SELECT * FROM apps WHERE id = $1;', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'App not found' });
            }
            res.status(200).json(rows[0]);
        } else {
            const { rows } = await pool.query('SELECT * FROM apps;');
            res.status(200).json(rows);
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST a new app
router.post('/', async (req, res) => {
    try {
        const appData: Omit<AppShowcaseItem, 'id' | 'ratings'> = req.body;
        
        // Process images: convert base64 to URLs
        const imageUrl = await saveBase64Image(appData.imageUrl);
        const heroImageUrl = await saveBase64Image(appData.heroImageUrl);
        const screenshots = await Promise.all(appData.screenshots.map(s => saveBase64Image(s)));

        const newId = new Date().toISOString() + Math.random();
        const newApp: AppShowcaseItem = { ...appData, id: newId, ratings: [], imageUrl, heroImageUrl, screenshots };

        await pool.query(
            `INSERT INTO apps (id, name, description, "imageUrl", "heroImageUrl", "longDescription", price, screenshots, features, abilities, "whyItWorks", "dedicatedPurpose", "termsAndConditions", ratings, "pinCode", "apkUrl", "iosUrl", "pwaUrl")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);`,
            [newApp.id, newApp.name, newApp.description, newApp.imageUrl, newApp.heroImageUrl, newApp.longDescription, newApp.price, JSON.stringify(newApp.screenshots), JSON.stringify(newApp.features), JSON.stringify(newApp.abilities), newApp.whyItWorks, newApp.dedicatedPurpose, newApp.termsAndConditions, JSON.stringify(newApp.ratings), newApp.pinCode, newApp.apkUrl, newApp.iosUrl, newApp.pwaUrl]
        );
        res.status(201).json(newApp);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT to update an app
router.put('/', async (req, res) => {
    try {
        const app: AppShowcaseItem = req.body;
        const { id } = app;
        if (!id) {
            return res.status(400).json({ message: 'App ID is required for update' });
        }

        // Process images
        const imageUrl = await saveBase64Image(app.imageUrl);
        const heroImageUrl = await saveBase64Image(app.heroImageUrl);
        const screenshots = await Promise.all(app.screenshots.map(s => saveBase64Image(s)));
        
        const appWithUrls = { ...app, imageUrl, heroImageUrl, screenshots };

        await pool.query(
            `UPDATE apps SET name = $1, description = $2, "imageUrl" = $3, "heroImageUrl" = $4, "longDescription" = $5, price = $6, screenshots = $7, features = $8, abilities = $9, "whyItWorks" = $10, "dedicatedPurpose" = $11, "termsAndConditions" = $12, "pinCode" = $13, "apkUrl" = $14, "iosUrl" = $15, "pwaUrl" = $16 WHERE id = $17;`,
            [appWithUrls.name, appWithUrls.description, appWithUrls.imageUrl, appWithUrls.heroImageUrl, appWithUrls.longDescription, appWithUrls.price, JSON.stringify(appWithUrls.screenshots), JSON.stringify(appWithUrls.features), JSON.stringify(appWithUrls.abilities), appWithUrls.whyItWorks, appWithUrls.dedicatedPurpose, appWithUrls.termsAndConditions, appWithUrls.pinCode, appWithUrls.apkUrl, appWithUrls.iosUrl, appWithUrls.pwaUrl, id]
        );
        res.status(200).json(appWithUrls);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// DELETE an app
router.delete('/', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'App ID query parameter is required for deletion' });
        }
        await pool.query('DELETE FROM apps WHERE id = $1;', [id]);
        res.status(200).json({ message: 'App deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PATCH to add/update a rating
router.patch('/', async (req, res) => {
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
        res.status(200).json(updatedRows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
