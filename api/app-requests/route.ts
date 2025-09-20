import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { AppRequest } from '../../types';

export const dynamic = 'force-dynamic';

// GET all app requests
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM app_requests ORDER BY submittedAt DESC;`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// CREATE a new app request
export async function POST(request: Request) {
  try {
    const { problemDescription } = await request.json();
    const newRequest: AppRequest = {
      id: new Date().toISOString() + Math.random(),
      problemDescription,
      status: 'thinking',
      submittedAt: new Date().toISOString(),
    };

    await sql`
      INSERT INTO app_requests (id, problemDescription, status, submittedAt)
      VALUES (${newRequest.id}, ${newRequest.problemDescription}, ${newRequest.status}, ${newRequest.submittedAt});
    `;
    
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}