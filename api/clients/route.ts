import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { Client } from '../../types';

export const dynamic = 'force-dynamic';

// GET all clients
export async function GET() {
  try {
    const { rows } = await sql`SELECT id, name, email FROM clients;`; // Exclude password
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
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
    return NextResponse.json(clientToReturn, { status: 201 });
  } catch (error) {
    // Handle unique constraint violation for email
    if ((error as any).code === '23505') {
        return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}