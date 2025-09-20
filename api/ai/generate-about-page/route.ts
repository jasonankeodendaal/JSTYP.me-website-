import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { rawText } = await request.json();
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    const content = JSON.parse(response.text || '{}');
    return NextResponse.json(content);

  } catch (error) {
    console.error("Error in AI about page generation:", error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}