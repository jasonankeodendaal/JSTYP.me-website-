import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { Buffer } from 'buffer';
import type { WebsiteDetails } from '../../types';

// GET website details
export async function GET() {
  try {
    const { rows } = await sql`SELECT details FROM website_details WHERE id = 1;`;
    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Website details not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(rows[0].details), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// UPDATE website details OR UPLOAD a file
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle file upload
    if (body.file) {
      const file = body.file as string;
      const mimeType = file.match(/data:(.*);base64,/)![1];
      const base64Data = file.split(',')[1];
      const fileBuffer = Buffer.from(base64Data, 'base64');
      const blobName = `${new Date().toISOString()}-${Math.random()}.${mimeType.split('/')[1]}`;
      const blob = await put(blobName, fileBuffer, {
        access: 'public',
        contentType: mimeType,
      });
      return new Response(JSON.stringify(blob), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Handle website details update
    const newDetails: WebsiteDetails = body;
    await sql`
      INSERT INTO website_details (id, details)
      VALUES (1, ${JSON.stringify(newDetails)})
      ON CONFLICT (id) DO UPDATE SET details = ${JSON.stringify(newDetails)};
    `;
    return new Response(JSON.stringify(newDetails), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}