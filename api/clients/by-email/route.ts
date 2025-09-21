import { sql } from '@vercel/postgres';

// GET client by Email
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const result = await sql`SELECT * FROM clients WHERE lower(email) = lower(${email});`;
    
    if (result.rowCount === 0) {
      return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(result.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}