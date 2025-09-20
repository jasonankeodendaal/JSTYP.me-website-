import { sql } from '@vercel/postgres';
import type { PinRecord } from '../../../types';

export const dynamic = 'force-dynamic';

// Redeem a PIN
export async function POST(request: Request) {
  try {
    const { pin, appId, client } = await request.json();

    const { rows } = await sql<PinRecord>`SELECT * FROM pin_records WHERE pin = ${pin};`;
    if (rows.length === 0) {
        return new Response(JSON.stringify({ message: "Invalid PIN code. Please try again." }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const recordToUpdate = rows[0];
    if (recordToUpdate.appId !== appId) {
        return new Response(JSON.stringify({ message: "This PIN is not valid for this app." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (recordToUpdate.isRedeemed) {
        return new Response(JSON.stringify({ message: "This PIN has already been used." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const redeemedAt = new Date().toISOString();
    const clientId = client?.id || null;
    const clientName = client?.name || null;

    const result = await sql`
        UPDATE pin_records
        SET 
            isRedeemed = TRUE, 
            redeemedAt = ${redeemedAt},
            clientId = ${clientId},
            clientName = ${clientName}
        WHERE id = ${recordToUpdate.id}
        RETURNING *;
    `;
    
    return new Response(JSON.stringify(result.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}