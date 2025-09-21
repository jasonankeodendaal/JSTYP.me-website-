// FIX: Imported Request and Response types from express to resolve namespace errors.
import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from "@google/genai";
import type { AppShowcaseItem } from '../../types';

const router = Router();

// FIX: Replaced express.Request and express.Response with imported Request and Response types.
async function handler(req: Request, res: Response) {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        
        const body = req.body;
        const { task } = body;

        switch (task) {
            case 'generate-description':
                return await generateDescription(body, res);
            case 'generate-listing':
                return await generateListing(body, res);
            case 'generate-image':
                return await generateImage(body, res);
            case 'find-matching-app':
                return await findMatchingApp(body, res);
            case 'generate-about-page':
                return await generateAboutPage(body, res);
            default:
                return res.status(400).json({ message: "Invalid AI task specified" });
        }
    } catch (error) {
        console.error(`Error in AI task:`, error);
        return res.status(500).json({ message: (error as Error).message });
    }
}

router.post('/', handler);

export default router;

// --- Reusable AI Handlers ---

// FIX: Replaced express.Response with imported Response type.
async function generateDescription(body: { keywords: string }, res: Response) {
    const { keywords } = body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `Generate a compelling, short, and exciting app store description for an app with the following features or keywords: "${keywords}". The description should be no more than 3 sentences and must encourage users to download.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const description = response.text ?? "Failed to generate description.";
    return res.status(200).json({ description });
}

// FIX: Replaced express.Response with imported Response type.
async function generateListing(body: { idea: string }, res: Response) {
    const { idea } = body;
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

// FIX: Replaced express.Response with imported Response type.
async function generateImage(body: { prompt: string, aspectRatio: '1:1' | '16:9' }, res: Response) {
    const { prompt, aspectRatio } = body;
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

// FIX: Replaced express.Response with imported Response type.
async function findMatchingApp(body: { problem: string, apps: AppShowcaseItem[] }, res: Response) {
    const { problem, apps } = body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const simplifiedApps = apps.map(({ id, name, description, longDescription }) => ({ id, name, fullDescription: `${description} ${longDescription}` }));
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

// FIX: Replaced express.Response with imported Response type.
async function generateAboutPage(body: { rawText: string }, res: Response) {
    const { rawText } = body;
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