import { sql } from '@vercel/postgres';
import type { AppRequest } from '../../types';

export const dynamic = 'force-dynamic';

// GET all app requests
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM app_requests ORDER BY submittedAt DESC;`;
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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
    
    return new Response(JSON.stringify(newRequest), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}