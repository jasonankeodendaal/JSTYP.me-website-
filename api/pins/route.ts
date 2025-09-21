import { sql } from '@vercel/postgres';
import type { PinRecord } from '../../types';

const generateRandomPin = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

export async function GET(_request: Request) {
    try {
        const { rows: getRows } = await sql`SELECT * FROM pin_records ORDER BY generatedAt DESC;`;
        return new Response(JSON.stringify(getRows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
         return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Redeem action
        if (body.action === 'redeem' && body.pin && body.appId) {
            const { pin, appId, client } = body;
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
                UPDATE pin_records SET isRedeemed = TRUE, redeemedAt = ${redeemedAt}, clientId = ${clientId}, clientName = ${clientName}
                WHERE id = ${recordToUpdate.id} RETURNING *;
            `;
            return new Response(JSON.stringify(result.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Create action
        const data: Omit<PinRecord, 'id' | 'pin' | 'isRedeemed' | 'generatedAt'> = body;
        let newPin: string;
        let isUnique = false;
        while (!isUnique) {
            newPin = generateRandomPin();
            const { rowCount } = await sql`SELECT 1 FROM pin_records WHERE pin = ${newPin};`;
            if (rowCount === 0) { isUnique = true; }
        }
        const newPinRecord: PinRecord = {
            ...data,
            id: new Date().toISOString() + Math.random(),
            pin: newPin!,
            isRedeemed: false,
            generatedAt: new Date().toISOString(),
        };
        await sql`
            INSERT INTO pin_records (id, pin, appId, appName, clientDetails, clientId, clientName, isRedeemed, generatedAt)
            VALUES (${newPinRecord.id}, ${newPinRecord.pin}, ${newPinRecord.appId}, ${newPinRecord.appName}, 
                ${JSON.stringify(newPinRecord.clientDetails)}, ${newPinRecord.clientId}, ${newPinRecord.clientName},
                ${newPinRecord.isRedeemed}, ${newPinRecord.generatedAt});
        `;
        return new Response(JSON.stringify(newPinRecord), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}