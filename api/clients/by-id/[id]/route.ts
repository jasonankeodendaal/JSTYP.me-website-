import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET client by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const result = await sql`SELECT id, name, email FROM clients WHERE id = ${id};`;
    
    if (result.rowCount === 0) {
      return NextResponse.json(null, { status: 200 }); // Return null instead of 404
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}