import { sql } from '@vercel/postgres';
import type { Client } from '../../types';

// GET clients (all, by id, or by email)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
        const { rows } = await sql`SELECT id, name, email FROM clients WHERE id = ${id};`;
        return new Response(JSON.stringify(rows[0] || null), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (email) {
        const { rows } = await sql`SELECT * FROM clients WHERE lower(email) = lower(${email});`;
        return new Response(JSON.stringify(rows[0] || null), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    const { rows } = await sql`SELECT id, name, email FROM clients;`; // Exclude password for general list
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// CREATE a new client
export async function POST(request: Request) {
  try {
    const { name, email, password }: Omit<Client, 'id'> = await request.json();
    const newClient: Client = {
      id: new Date().toISOString() + Math.random(),
      name,
      email,
      password, // In a real app, hash this password
    };

    await sql`
      INSERT INTO clients (id, name, email, password)
      VALUES (${newClient.id}, ${newClient.name}, ${newClient.email}, ${newClient.password});
    `;
    
    // Return the new client without the password
    const { password: _, ...clientToReturn } = newClient;
    return new Response(JSON.stringify(clientToReturn), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    // Handle unique constraint violation for email
    if ((error as any).code === '23505') {
        return new Response(JSON.stringify({ message: 'An account with this email already exists.' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}