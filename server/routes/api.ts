import { Router } from 'express';
import { GoogleGenAI, Type } from "@google/genai";
import { pool } from '../db';
import { saveBase64Image, saveVideoBuffer } from '../uploader';
import { Buffer } from 'buffer';
import type { 
    AppShowcaseItem, 
    AppRequest, 
    WebsiteDetails, 
    PinRecord, 
    TeamMember, 
    Client, 
    RedownloadRequest,
    Video
} from '../../types';

const router = Router();

// =================================================================
// AI Routes
// =================================================================
router.post('/ai', async (req, res) => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        
        const { task } = req.body;

        switch (task) {
            case 'generate-description':
                return await generateDescription(req, res);
            case 'generate-listing':
                return await generateListing(req, res);
            case 'generate-image':
                return await generateImage(req, res);
            case 'find-matching-app':
                return await findMatchingApp(req, res);
            case 'generate-about-page':
                return await generateAboutPage(req, res);
            default:
                return res.status(400).json({ message: "Invalid AI task specified" });
        }
    } catch (error) {
        console.error(`Error in AI task:`, error);
        return res.status(500).json({ message: (error as Error).message });
    }
});

async function generateDescription(req: any, res: any) {
    const { keywords } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `Generate a compelling, short, and exciting app store description for an app with the following features or keywords: "${keywords}". The description should be no more than 3 sentences and must encourage users to download.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const description = response.text ?? "Failed to generate description.";
    return res.status(200).json({ description });
}

async function generateListing(req: any, res: any) {
    const { idea } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `Based on the following app idea, generate a complete and compelling app listing.
Idea: "${idea}"
Generate a creative name, descriptions, features, abilities, a 'why it works' section, its dedicated purpose, a suggested price, and sample terms and conditions.
Features and abilities should be concise bullet points.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "A creative, catchy name for the app." },
                    description: { type: Type.STRING, description: "A short, one-sentence description for the app card." },
                    longDescription: { type: Type.STRING, description: "A detailed, paragraph-long description for the app's detail page." },
                    price: { type: Type.STRING, description: "A suggested price, e.g., 'R299.99' or 'R99.99 / month'." },
                    features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 4-5 key features." },
                    abilities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key abilities or benefits." },
                    whyItWorks: { type: Type.STRING, description: "A paragraph explaining why this app is effective for the user." },
                    dedicatedPurpose: { type: Type.STRING, description: "A paragraph explaining the specific user or problem this app is designed for." },
                    termsAndConditions: { type: Type.STRING, description: "Sample terms and conditions for the app." },
                },
                required: ["name", "description", "longDescription", "price", "features", "abilities", "whyItWorks", "dedicatedPurpose", "termsAndConditions"]
            }
        }
    });
    const listing = JSON.parse(response.text || '{}');
    return res.status(200).json(listing);
}

async function generateImage(req: any, res: any) {
    const { prompt, aspectRatio } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `App icon for an application described as: "${prompt}". Clean, modern, vibrant, single icon on a simple background.`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio === '1:1' ? '1:1' : '16:9',
        },
    });
    const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("AI failed to generate an image from the provided prompt.");
    }
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
    return res.status(200).json({ imageUrl });
}

async function findMatchingApp(req: any, res: any) {
    const { problem, apps } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const simplifiedApps = apps.map(({ id, name, description, longDescription }: AppShowcaseItem) => ({ id, name, fullDescription: `${description} ${longDescription}` }));
    const prompt = `You are an AI App Advisor for a website called JSTYP.me. A user described a problem: "${problem}".
Analyze the problem and determine which of the following apps is the best solution. The available apps are:
${JSON.stringify(simplifiedApps, null, 2)}
Only recommend an app if it's a strong, direct solution to the user's problem. If no app is a good fit, indicate that.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    bestMatchAppId: {
                        type: Type.STRING,
                        description: "The ID of the best matching app. If no app is a good match, return the string 'null'."
                    },
                    reasoning: {
                        type: Type.STRING,
                        description: "A brief, user-facing explanation for your choice, or why no app was a good match."
                    }
                },
                required: ["bestMatchAppId", "reasoning"]
            }
        }
    });
    const jsonResponse = JSON.parse(response.text || '{}');
    if (jsonResponse.bestMatchAppId === 'null' || !jsonResponse.bestMatchAppId) {
        return res.status(200).json({ bestMatchAppId: null, reasoning: jsonResponse.reasoning || "No suitable app found." });
    }
    return res.status(200).json({ bestMatchAppId: jsonResponse.bestMatchAppId, reasoning: jsonResponse.reasoning });
}

async function generateAboutPage(req: any, res: any) {
    const { rawText } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const sectionSchema = {
      type: Type.OBJECT,
      properties: {
        heading: { type: Type.STRING, description: "A compelling heading for the section." },
        content: { type: Type.STRING, description: "A detailed paragraph of content for the section. Use newline characters for breaks." },
        imagePrompt: { type: Type.STRING, description: "A detailed, creative prompt for an AI image generator to create a relevant illustration for this section. E.g., 'A vibrant, abstract visualization of interconnected data nodes, glowing with orange and blue light.'" }
      },
      required: ["heading", "content", "imagePrompt"]
    };
    const prompt = `Based on the following business description, generate a complete and compelling 'About Us' page. The tone should be professional, innovative, and user-focused.
    Business Description: "${rawText}"
    Structure the output into a main page title, an introduction, and at least two additional sections (like 'Our Features', 'Our Vision', 'Why Choose Us', etc.). For each section, provide a heading, content, and a creative prompt for an AI image generator to create a relevant illustration.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pageTitle: { type: Type.STRING, description: "A strong title for the About page." },
            introduction: sectionSchema,
            sections: { type: Type.ARRAY, items: sectionSchema, description: "An array of at least two additional content sections." }
          },
          required: ["pageTitle", "introduction", "sections"]
        }
      }
    });
    const content = JSON.parse(response.text || '{}');
    return res.status(200).json(content);
}

// =================================================================
// App Request Routes
// =================================================================
router.get('/app-requests', async (_req, res) => {
    try {
        const { rows } = await pool.query<AppRequest>('SELECT * FROM app_requests ORDER BY "submittedAt" DESC;');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/app-requests', async (req, res) => {
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

router.patch('/app-requests', async (req, res) => {
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

// =================================================================
// App Routes
// =================================================================
router.get('/apps', async (req, res) => {
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

router.post('/apps', async (req, res) => {
    try {
        const appData: Omit<AppShowcaseItem, 'id' | 'ratings'> = req.body;
        
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

router.put('/apps', async (req, res) => {
    try {
        const app: AppShowcaseItem = req.body;
        const { id } = app;
        if (!id) {
            return res.status(400).json({ message: 'App ID is required for update' });
        }

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

router.delete('/apps', async (req, res) => {
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

router.patch('/apps', async (req, res) => {
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

// =================================================================
// Client Routes
// =================================================================
router.get('/clients', async (req, res) => {
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

router.post('/clients', async (req, res) => {
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
        if ((error as any).code === '23505') {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        res.status(500).json({ error: (error as Error).message });
    }
});

// =================================================================
// PIN Routes
// =================================================================
const generateRandomPin = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

router.get('/pins', async (_req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM pin_records ORDER BY "generatedAt" DESC;');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/pins', async (req, res) => {
    try {
        const body = req.body;
        
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

// =================================================================
// Re-download Request Routes
// =================================================================
router.get('/redownload-requests', async (_req, res) => {
    try {
        const { rows } = await pool.query<RedownloadRequest>('SELECT * FROM redownload_requests ORDER BY "requestedAt" DESC;');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/redownload-requests', async (req, res) => {
    try {
        const requestData: Omit<RedownloadRequest, 'id' | 'status' | 'requestedAt'> = req.body;
        const { rows: existingRows } = await pool.query(
            'SELECT * FROM redownload_requests WHERE "clientId" = $1 AND "appId" = $2 AND status = \'pending\';',
            [requestData.clientId, requestData.appId]
        );

        if (existingRows.length > 0) {
            return res.status(200).json(null); // Indicates a pending request already exists
        }

        const newRequest: RedownloadRequest = { 
            ...requestData, 
            id: new Date().toISOString() + Math.random(), 
            status: 'pending', 
            requestedAt: new Date().toISOString() 
        };

        await pool.query(
            'INSERT INTO redownload_requests (id, "clientId", "clientName", "appId", "appName", status, "requestedAt") VALUES ($1, $2, $3, $4, $5, $6, $7);',
            [newRequest.id, newRequest.clientId, newRequest.clientName, newRequest.appId, newRequest.appName, newRequest.status, newRequest.requestedAt]
        );
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/redownload-requests', async (req, res) => {
    try {
        const { id, status, resolutionNotes } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Request ID is required in the body' });
        }
        if (!['approved', 'denied'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await pool.query(
            'UPDATE redownload_requests SET status = $1, "resolutionNotes" = $2 WHERE id = $3 RETURNING *;',
            [status, resolutionNotes, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// =================================================================
// Team Member Routes
// =================================================================
router.get('/team-members', async (_req, res) => {
    try {
        const { rows } = await pool.query<TeamMember>('SELECT * FROM team_members;');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/team-members', async (req, res) => {
    try {
        const memberData: Omit<TeamMember, 'id'> = req.body;
        
        const profileImageUrl = await saveBase64Image(memberData.profileImageUrl);

        const newMember: TeamMember = { ...memberData, id: new Date().toISOString() + Math.random(), profileImageUrl };
        await pool.query(
            'INSERT INTO team_members (id, "firstName", "lastName", tel, email, pin, role, "profileImageUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8);',
            [newMember.id, newMember.firstName, newMember.lastName, newMember.tel, newMember.email, newMember.pin, newMember.role, newMember.profileImageUrl]
        );
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/team-members', async (req, res) => {
    try {
        const member: TeamMember = req.body;
        const { id } = member;
        if (!id) {
            return res.status(400).json({ message: 'Member ID is required for update' });
        }
        
        const profileImageUrl = await saveBase64Image(member.profileImageUrl);
        const memberWithUrl = { ...member, profileImageUrl };

        await pool.query(
            'UPDATE team_members SET "firstName" = $1, "lastName" = $2, tel = $3, email = $4, pin = $5, role = $6, "profileImageUrl" = $7 WHERE id = $8;',
            [memberWithUrl.firstName, memberWithUrl.lastName, memberWithUrl.tel, memberWithUrl.email, memberWithUrl.pin, memberWithUrl.role, memberWithUrl.profileImageUrl, id]
        );
        res.status(200).json(memberWithUrl);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.delete('/team-members', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Member ID query parameter is required for deletion' });
        }
        await pool.query('DELETE FROM team_members WHERE id = $1;', [id]);
        res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// =================================================================
// Website Details Routes
// =================================================================
router.get('/website-details', async (_req, res) => {
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

router.post('/website-details', async (req, res) => {
    try {
        const newDetails: WebsiteDetails = req.body;

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

// =================================================================
// Video Routes
// =================================================================
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

router.get('/videos', async (_req, res) => {
    try {
        const { rows } = await pool.query<Video>(`SELECT * FROM videos WHERE status = 'completed' ORDER BY "createdAt" DESC;`);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ message: (error as Error).message });
    }
});

router.post('/videos/generate', async (req, res) => {
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

router.get('/videos/:id/status', async (req, res) => {
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
