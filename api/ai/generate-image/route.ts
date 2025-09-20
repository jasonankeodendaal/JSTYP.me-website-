import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, aspectRatio } = await request.json();
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("Error in AI image generation:", error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}