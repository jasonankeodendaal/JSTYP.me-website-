import { sql } from '@vercel/postgres';
import type { AppShowcaseItem } from '../../types';

export async function GET(_request: Request) {
    try {
        const { rows } = await sql`SELECT * FROM apps;`;
        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function POST(request: Request) {
    try {
        const appData: Omit<AppShowcaseItem, 'id' | 'ratings'> = await request.json();
        const newId = new Date().toISOString() + Math.random();
        const newApp: AppShowcaseItem = { ...appData, id: newId, ratings: [] };

        await sql`
            INSERT INTO apps (id, name, description, imageUrl, heroImageUrl, longDescription, price, screenshots, features, abilities, whyItWorks, dedicatedPurpose, termsAndConditions, ratings, pinCode, apkUrl, iosUrl, pwaUrl)
            VALUES (${newApp.id}, ${newApp.name}, ${newApp.description}, ${newApp.imageUrl}, ${newApp.heroImageUrl}, ${newApp.longDescription}, ${newApp.price}, ${JSON.stringify(newApp.screenshots)}, ${JSON.stringify(newApp.features)}, ${JSON.stringify(newApp.abilities)}, ${newApp.whyItWorks}, ${newApp.dedicatedPurpose}, ${newApp.termsAndConditions}, ${JSON.stringify(newApp.ratings)}, ${newApp.pinCode}, ${newApp.apkUrl}, ${newApp.iosUrl}, ${newApp.pwaUrl});
        `;
        return new Response(JSON.stringify(newApp), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}