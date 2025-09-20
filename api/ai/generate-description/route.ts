import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { keywords } = await request.json();
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Generate a compelling, short, and exciting app store description for an app with the following features or keywords: "${keywords}". The description should be no more than 3 sentences and must encourage users to download.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const description = response.text ?? "Failed to generate description.";
    return new Response(JSON.stringify({ description }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in AI description generation:", error);
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}