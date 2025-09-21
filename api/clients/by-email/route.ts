import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        if (!email) {
            return new Response(JSON.stringify({ message: 'Email query parameter is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        const { rows } = await sql`SELECT * FROM clients WHERE lower(email) = lower(${email});`;
        return new Response(JSON.stringify(rows[0] || null), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
