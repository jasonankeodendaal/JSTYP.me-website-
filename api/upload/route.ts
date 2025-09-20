import { put } from '@vercel/blob';
import { Buffer } from 'buffer';

export async function POST(request: Request): Promise<Response> {
  try {
    const { file } = (await request.json()) as { file: string };

    if (!file) {
      return new Response(JSON.stringify({ message: 'No file to upload.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Extract mime type and base64 data
    const mimeType = file.match(/data:(.*);base64,/)![1];
    const base64Data = file.split(',')[1];
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    const blobName = `${new Date().toISOString()}-${Math.random()}.${mimeType.split('/')[1]}`;

    const blob = await put(blobName, fileBuffer, {
      access: 'public',
      contentType: mimeType,
    });

    return new Response(JSON.stringify(blob), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}