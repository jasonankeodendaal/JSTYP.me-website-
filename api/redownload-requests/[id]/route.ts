import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// UPDATE a redownload request
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status, resolutionNotes } = await request.json();

    if (!['approved', 'denied'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const result = await sql`
      UPDATE redownload_requests
      SET status = ${status}, resolutionNotes = ${resolutionNotes}
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