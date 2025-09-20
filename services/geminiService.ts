import { GoogleGenAI, Type } from "@google/genai";
import type { AppShowcaseItem, AboutPageContent } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateAppDescription = async (keywords: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Please set the API_KEY environment variable.";
  }
  
  try {
    const prompt = `Generate a compelling, short, and exciting app store description for an app with the following features or keywords: "${keywords}". The description should be no more than 3 sentences and must encourage users to download.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating description with Gemini API:", error);
    return "Failed to generate AI description. Please try again or write one manually.";
  }
};

export const generateAppListing = async (idea: string): Promise<Partial<AppShowcaseItem>> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not configured.");
  }

  try {
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

    return JSON.parse(response.text) as Partial<AppShowcaseItem>;

  } catch (error) {
    console.error("Error generating app listing with Gemini API:", error);
    throw new Error("Failed to generate AI-powered app listing.");
  }
};

export const generateAppImage = async (prompt: string, aspectRatio: '1:1' | '16:9' = '1:1'): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not configured.");
  }
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `App icon for an application described as: "${prompt}". Clean, modern, vibrant, single icon on a simple background.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio === '1:1' ? '1:1' : '16:9',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image with Gemini API:", error);
    throw new Error("Failed to generate AI image.");
  }
};


export const findMatchingApp = async (problem: string, apps: AppShowcaseItem[]): Promise<{ bestMatchAppId: string | null, reasoning: string }> => {
  if (!process.env.API_KEY) {
    return { bestMatchAppId: null, reasoning: "API Key not configured." };
  }

  const simplifiedApps = apps.map(({ id, name, description, longDescription }) => ({ id, name, fullDescription: `${description} ${longDescription}` }));
  
  try {
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
    
    const jsonResponse = JSON.parse(response.text);
    if (jsonResponse.bestMatchAppId === 'null') {
        return { bestMatchAppId: null, reasoning: jsonResponse.reasoning };
    }

    return { bestMatchAppId: jsonResponse.bestMatchAppId, reasoning: jsonResponse.reasoning };

  } catch (error) {
    console.error("Error finding matching app with Gemini API:", error);
    return { bestMatchAppId: null, reasoning: "An error occurred while searching for a solution. Please try again." };
  }
};

export const generateAboutPageContent = async (rawText: string): Promise<AboutPageContent> => {
      if (!process.env.API_KEY) {
        throw new Error("API Key not configured.");
      }

      const sectionSchema = {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING, description: "A compelling heading for the section." },
          content: { type: Type.STRING, description: "A detailed paragraph of content for the section. Use newline characters for breaks." },
          imagePrompt: { type: Type.STRING, description: "A detailed, creative prompt for an AI image generator to create a relevant illustration for this section. E.g., 'A vibrant, abstract visualization of interconnected data nodes, glowing with orange and blue light.'" }
        },
        required: ["heading", "content", "imagePrompt"]
      };

      try {
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
                sections: {
                  type: Type.ARRAY,
                  items: sectionSchema,
                  description: "An array of at least two additional content sections."
                }
              },
              required: ["pageTitle", "introduction", "sections"]
            }
          }
        });

        return JSON.parse(response.text) as AboutPageContent;

      } catch (error) {
        console.error("Error generating About Page content with Gemini API:", error);
        throw new Error("Failed to generate AI-powered About Page content.");
      }
    };