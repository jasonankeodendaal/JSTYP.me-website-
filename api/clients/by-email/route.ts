import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET client by Email
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const result = await sql`SELECT * FROM clients WHERE lower(email) = lower(${email});`;
    
    if (result.rowCount === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}