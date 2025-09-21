import { sql } from '@vercel/postgres';
import type { RedownloadRequest } from '../../types';

// GET all redownload requests
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM redownload_requests ORDER BY requestedAt DESC;`;
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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
        return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } }); // Indicates an existing pending request
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
    
    return new Response(JSON.stringify(newRequest), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}