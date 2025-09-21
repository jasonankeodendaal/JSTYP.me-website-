import { sql } from '@vercel/postgres';

// Update app request status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (status !== 'thinking' && status !== 'done') {
        return new Response(JSON.stringify({ message: 'Invalid status' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await sql`
      UPDATE app_requests
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *;
    `;
    
    if (result.rowCount === 0) {
        return new Response(JSON.stringify({ message: 'Request not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify(result.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}