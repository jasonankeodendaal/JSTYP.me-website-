import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { idea } = await request.json();
     if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    return NextResponse.json(listing);
    
  } catch (error) {
    console.error("Error in AI listing generation:", error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}