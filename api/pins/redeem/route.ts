import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { PinRecord } from '../../../types';

export const dynamic = 'force-dynamic';

// Redeem a PIN
export async function POST(request: Request) {
  try {
    const { pin, appId, client } = await request.json();

    const { rows } = await sql<PinRecord>`SELECT * FROM pin_records WHERE pin = ${pin};`;
    if (rows.length === 0) {
        return NextResponse.json({ message: "Invalid PIN code. Please try again." }, { status: 404 });
    }

    const recordToUpdate = rows[0];
    if (recordToUpdate.appid !== appId) {
        return NextResponse.json({ message: "This PIN is not valid for this app." }, { status: 400 });
    }
    if (recordToUpdate.isredeemed) {
        return NextResponse.json({ message: "This PIN has already been used." }, { status: 400 });
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
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}