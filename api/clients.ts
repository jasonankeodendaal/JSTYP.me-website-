import { sql } from '@vercel/postgres';
import type { Client } from '../../types';

export default async function handler(request: Request) {
    const { method, url } = request;
    const { searchParams } = new URL(url);

    try {
        switch (method) {
            case 'GET':
                const id = searchParams.get('id');
                const email = searchParams.get('email');

                if (id) {
                    const { rows } = await sql`SELECT * FROM clients WHERE id = ${id};`;
                    return new Response(JSON.stringify(rows[0] || null), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                
                if (email) {
                    const { rows } = await sql`SELECT * FROM clients WHERE lower(email) = lower(${email});`;
                    return new Response(JSON.stringify(rows[0] || null), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                
                const { rows } = await sql`SELECT id, name, email FROM clients;`; // Exclude password for general list
                return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });

            case 'POST':
                const { name, email: postEmail, password }: Omit<Client, 'id'> = await request.json();
                const newClient: Client = {
                    id: new Date().toISOString() + Math.random(),
                    name,
                    email: postEmail,
                    password, // In a real app, hash this password
                };

                await sql`
                    INSERT INTO clients (id, name, email, password)
                    VALUES (${newClient.id}, ${newClient.name}, ${newClient.email}, ${newClient.password});
                `;
                
                const { password: _, ...clientToReturn } = newClient;
                return new Response(JSON.stringify(clientToReturn), { status: 201, headers: { 'Content-Type': 'application/json' } });

            default:
                return new Response(JSON.stringify({ message: `Method ${method} Not Allowed` }), { status: 405, headers: { 'Content-Type': 'application/json' } });
        }
    } catch (error) {
        // Handle unique constraint violation for email
        if ((error as any).code === '23505') {
            return new Response(JSON.stringify({ message: 'An account with this email already exists.' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
