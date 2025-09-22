import { Router } from 'express';
import { pool } from '../db';
import { saveBase64Image } from '../uploader';
import type { WebsiteDetails } from '../../types';

const router = Router();

// GET website details
router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query('SELECT details FROM website_details WHERE id = 1;');
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Website details not found' });
        }
        res.status(200).json(rows[0].details);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST to update website details
router.post('/', async (req, res) => {
    try {
        const newDetails: WebsiteDetails = req.body;

        // Upload images if they are new base64 strings
        const logoUrl = await saveBase64Image(newDetails.logoUrl);
        const introLogoUrl = await saveBase64Image(newDetails.introLogoUrl);
        const introImageUrl = await saveBase64Image(newDetails.introImageUrl);

        const aboutPageContent = newDetails.aboutPageContent ? {
            ...newDetails.aboutPageContent,
            introduction: {
                ...newDetails.aboutPageContent.introduction,
                imageUrl: await saveBase64Image(newDetails.aboutPageContent.introduction.imageUrl || ''),
            },
            sections: await Promise.all(newDetails.aboutPageContent.sections.map(async (section) => ({
                ...section,
                imageUrl: await saveBase64Image(section.imageUrl || ''),
            }))),
        } : null;
        
        const detailsWithUrls = { ...newDetails, logoUrl, introLogoUrl, introImageUrl, aboutPageContent };

        await pool.query(
            `INSERT INTO website_details (id, details) VALUES (1, $1)
             ON CONFLICT (id) DO UPDATE SET details = $1;`,
            [JSON.stringify(detailsWithUrls)]
        );
        res.status(200).json(detailsWithUrls);

    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
