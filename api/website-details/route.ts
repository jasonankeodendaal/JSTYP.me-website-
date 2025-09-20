import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { WebsiteDetails } from '../../types';

export const dynamic = 'force-dynamic';

// GET website details
export async function GET() {
  try {
    const { rows } = await sql`SELECT details FROM website_details WHERE id = 1;`;
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Website details not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0].details);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// UPDATE website details
export async function POST(request: Request) {
  try {
    const newDetails: WebsiteDetails = await request.json();
    await sql`
      INSERT INTO website_details (id, details)
      VALUES (1, ${JSON.stringify(newDetails)})
      ON CONFLICT (id) DO UPDATE SET details = ${JSON.stringify(newDetails)};
    `;
    return NextResponse.json(newDetails);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}