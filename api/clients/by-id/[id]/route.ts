import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

// GET client by ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const result = await sql`SELECT id, name, email FROM clients WHERE id = ${id};`;
    
    if (result.rowCount === 0) {
      return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } }); // Return null instead of 404
    }

    return new Response(JSON.stringify(result.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}