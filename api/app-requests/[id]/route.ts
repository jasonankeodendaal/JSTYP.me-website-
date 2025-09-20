import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Update app request status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (status !== 'thinking' && status !== 'done') {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const result = await sql`
      UPDATE app_requests
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *;
    `;
    
    if (result.rowCount === 0) {
        return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}