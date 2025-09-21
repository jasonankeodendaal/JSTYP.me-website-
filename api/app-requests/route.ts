import { sql } from '@vercel/postgres';
import type { AppRequest } from '../../types';

export async function GET(_request: Request) {
    try {
        const { rows } = await sql<AppRequest>`SELECT * FROM app_requests ORDER BY submittedAt DESC;`;
        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function POST(request: Request) {
    try {
        const { problemDescription } = await request.json();
        const newRequest: AppRequest = { id: new Date().toISOString() + Math.random(), problemDescription, status: 'thinking', submittedAt: new Date().toISOString() };
        await sql`INSERT INTO app_requests (id, problemDescription, status, submittedAt) VALUES (${newRequest.id}, ${newRequest.problemDescription}, ${newRequest.status}, ${newRequest.submittedAt});`;
        return new Response(JSON.stringify(newRequest), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();
        if (!id) {
            return new Response(JSON.stringify({ message: 'Request ID is required in the body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (status !== 'thinking' && status !== 'done') {
            return new Response(JSON.stringify({ message: 'Invalid status' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        const result = await sql`UPDATE app_requests SET status = ${status} WHERE id = ${id} RETURNING *;`;
        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ message: 'Request not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify(result.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
