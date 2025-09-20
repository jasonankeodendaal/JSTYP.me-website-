import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { RedownloadRequest } from '../../types';

export const dynamic = 'force-dynamic';

// GET all redownload requests
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM redownload_requests ORDER BY requestedAt DESC;`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// CREATE a new redownload request
export async function POST(request: Request) {
  try {
    const requestData: Omit<RedownloadRequest, 'id' | 'status' | 'requestedAt'> = await request.json();

    const { rows } = await sql`
        SELECT * FROM redownload_requests 
        WHERE clientId = ${requestData.clientId} 
        AND appId = ${requestData.appId} 
        AND status = 'pending';
    `;

    if (rows.length > 0) {
        return NextResponse.json(null, { status: 200 }); // Indicates an existing pending request
    }

    const newRequest: RedownloadRequest = {
      ...requestData,
      id: new Date().toISOString() + Math.random(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    await sql`
      INSERT INTO redownload_requests (id, clientId, clientName, appId, appName, status, requestedAt)
      VALUES (
        ${newRequest.id}, ${newRequest.clientId}, ${newRequest.clientName}, 
        ${newRequest.appId}, ${newRequest.appName}, ${newRequest.status}, ${newRequest.requestedAt}
      );
    `;
    
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}