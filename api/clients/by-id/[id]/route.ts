import { sql } from '@vercel/postgres';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const { rows } = await sql`SELECT * FROM clients WHERE id = ${id};`;
        return new Response(JSON.stringify(rows[0] || null), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}