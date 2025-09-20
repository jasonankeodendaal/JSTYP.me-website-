import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

// UPDATE a redownload request
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status, resolutionNotes } = await request.json();

    if (!['approved', 'denied'].includes(status)) {
        return new Response(JSON.stringify({ message: 'Invalid status' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await sql`
      UPDATE redownload_requests
      SET status = ${status}, resolutionNotes = ${resolutionNotes}
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