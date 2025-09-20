import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { PinRecord } from '../../types';

export const dynamic = 'force-dynamic';

// GET all PIN records
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM pin_records ORDER BY generatedAt DESC;`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

const generateRandomPin = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

// CREATE a new PIN record
export async function POST(request: Request) {
  try {
    const data: Omit<PinRecord, 'id' | 'pin' | 'isRedeemed' | 'generatedAt'> = await request.json();
    
    let pin: string;
    let isUnique = false;
    // Ensure PIN is unique
    while (!isUnique) {
        pin = generateRandomPin();
        const { rowCount } = await sql`SELECT 1 FROM pin_records WHERE pin = ${pin};`;
        if (rowCount === 0) {
            isUnique = true;
        }
    }

    const newPinRecord: PinRecord = {
      ...data,
      id: new Date().toISOString() + Math.random(),
      pin: pin!,
      isRedeemed: false,
      generatedAt: new Date().toISOString(),
    };

    await sql`
      INSERT INTO pin_records (id, pin, appId, appName, clientDetails, clientId, clientName, isRedeemed, generatedAt)
      VALUES (
        ${newPinRecord.id}, ${newPinRecord.pin}, ${newPinRecord.appId}, ${newPinRecord.appName}, 
        ${JSON.stringify(newPinRecord.clientDetails)}, ${newPinRecord.clientId}, ${newPinRecord.clientName},
        ${newPinRecord.isRedeemed}, ${newPinRecord.generatedAt}
      );
    `;
    
    return NextResponse.json(newPinRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}