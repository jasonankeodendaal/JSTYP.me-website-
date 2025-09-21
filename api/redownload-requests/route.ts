import { sql } from '@vercel/postgres';
import type { RedownloadRequest } from '../../types';

export async function GET(_request: Request) {
    try {
        const { rows } = await sql<RedownloadRequest>`SELECT * FROM redownload_requests ORDER BY requestedAt DESC;`;
        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function POST(request: Request) {
    try {
        const requestData: Omit<RedownloadRequest, 'id' | 'status' | 'requestedAt'> = await request.json();
        const { rows: existingRows } = await sql`
            SELECT * FROM redownload_requests WHERE clientId = ${requestData.clientId} AND appId = ${requestData.appId} AND status = 'pending';
        `;
        if (existingRows.length > 0) {
            return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        const newRequest: RedownloadRequest = { ...requestData, id: new Date().toISOString() + Math.random(), status: 'pending', requestedAt: new Date().toISOString() };
        await sql`
            INSERT INTO redownload_requests (id, clientId, clientName, appId, appName, status, requestedAt)
            VALUES (${newRequest.id}, ${newRequest.clientId}, ${newRequest.clientName}, ${newRequest.appId}, ${newRequest.appName}, ${newRequest.status}, ${newRequest.requestedAt});
        `;
        return new Response(JSON.stringify(newRequest), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, status, resolutionNotes } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({ message: 'Request ID is required in the body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (!['approved', 'denied'].includes(status)) {
            return new Response(JSON.stringify({ message: 'Invalid status' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const result = await sql`
            UPDATE redownload_requests SET status = ${status}, resolutionNotes = ${resolutionNotes} WHERE id = ${id} RETURNING *;
        `;

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ message: 'Request not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify(result.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
