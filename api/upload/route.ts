import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { file } = (await request.json()) as { file: string };

    if (!file) {
      return NextResponse.json({ message: 'No file to upload.' }, { status: 400 });
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

    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}