import { GoogleGenAI, Type } from "@google/genai";
import type { AppShowcaseItem } from '../../../types';

export async function POST(request: Request) {
  try {
    const { problem, apps } = await request.json() as { problem: string, apps: AppShowcaseItem[] };
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
        return new Response(JSON.stringify({ bestMatchAppId: null, reasoning: jsonResponse.reasoning || "No suitable app found." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ bestMatchAppId: jsonResponse.bestMatchAppId, reasoning: jsonResponse.reasoning }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in AI find matching app:", error);
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}