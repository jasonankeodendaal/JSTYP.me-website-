import { sql } from '@vercel/postgres';
import type { AppShowcaseItem } from '../../types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // Get single app by ID
        if (id) {
            const { rows } = await sql<AppShowcaseItem>`SELECT * FROM apps WHERE id = ${id};`;
            if (rows.length === 0) {
                return new Response(JSON.stringify({ message: 'App not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify(rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Get all apps
        const { rows } = await sql`SELECT * FROM apps;`;
        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function POST(request: Request) { // Create App
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

export async function PUT(request: Request) { // Update App
    try {
        const app: AppShowcaseItem = await request.json();
        const { id } = app;
        if (!id) {
            return new Response(JSON.stringify({ message: 'App ID is required for update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        await sql`
            UPDATE apps SET name = ${app.name}, description = ${app.description}, imageUrl = ${app.imageUrl}, heroImageUrl = ${app.heroImageUrl}, longDescription = ${app.longDescription}, price = ${app.price}, screenshots = ${JSON.stringify(app.screenshots)}, features = ${JSON.stringify(app.features)}, abilities = ${JSON.stringify(app.abilities)}, whyItWorks = ${app.whyItWorks}, dedicatedPurpose = ${app.dedicatedPurpose}, termsAndConditions = ${app.termsAndConditions}, pinCode = ${app.pinCode}, apkUrl = ${app.apkUrl}, iosUrl = ${app.iosUrl}, pwaUrl = ${app.pwaUrl} WHERE id = ${id};
        `;
        return new Response(JSON.stringify(app), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function DELETE(request: Request) { // Delete App
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return new Response(JSON.stringify({ message: 'App ID query parameter is required for deletion' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        await sql`DELETE FROM apps WHERE id = ${id};`;
        return new Response(JSON.stringify({ message: 'App deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function PATCH(request: Request) { // Add/Update rating
    try {
        const { appId, clientId, rating } = await request.json();
        if (!appId || !clientId || typeof rating !== 'number') {
            return new Response(JSON.stringify({ message: 'appId, clientId and a valid rating are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const { rows } = await sql<{ ratings: { clientId: string; rating: number }[] }>`SELECT ratings FROM apps WHERE id = ${appId};`;
        if (rows.length === 0) {
            return new Response(JSON.stringify({ message: 'App not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        const app = rows[0];
        const currentRatings = Array.isArray(app.ratings) ? app.ratings : [];
        const existingRatingIndex = currentRatings.findIndex(r => r.clientId === clientId);

        if (existingRatingIndex > -1) {
            currentRatings[existingRatingIndex].rating = rating;
        } else {
            currentRatings.push({ clientId, rating });
        }
        
        await sql`UPDATE apps SET ratings = ${JSON.stringify(currentRatings)} WHERE id = ${appId};`;
        const { rows: updatedRows } = await sql<AppShowcaseItem>`SELECT * FROM apps WHERE id = ${appId};`;
        return new Response(JSON.stringify(updatedRows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}