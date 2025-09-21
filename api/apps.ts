import { sql } from '@vercel/postgres';
import type { AppShowcaseItem } from '../../types';

export default async function handler(request: Request) {
    const { method, url } = request;
    const { searchParams } = new URL(url);
    const id = searchParams.get('id');

    try {
        switch (method) {
            case 'GET':
                if (id) {
                    // Get single app by ID
                    const { rows } = await sql<AppShowcaseItem>`SELECT * FROM apps WHERE id = ${id};`;
                    if (rows.length === 0) {
                        return new Response(JSON.stringify({ message: 'App not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
                    }
                    return new Response(JSON.stringify(rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
                } else {
                    // Get all apps
                    const { rows } = await sql`SELECT * FROM apps;`;
                    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
            
            case 'POST':
                if (id) {
                    // Add a rating to an app
                    const appId = id;
                    const { clientId, rating } = await request.json();

                    if (!clientId || !rating) {
                        return new Response(JSON.stringify({ message: 'Client ID and rating are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
                    }

                    const { rows } = await sql<AppShowcaseItem>`SELECT * FROM apps WHERE id = ${appId};`;
                    if (rows.length === 0) {
                        return new Response(JSON.stringify({ message: 'App not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
                    }

                    const app = rows[0];
                    const currentRatings = app.ratings || [];
                    const existingRatingIndex = currentRatings.findIndex(r => r.clientId === clientId);

                    if (existingRatingIndex > -1) {
                        currentRatings[existingRatingIndex].rating = rating;
                    } else {
                        currentRatings.push({ clientId, rating });
                    }
                    
                    await sql`UPDATE apps SET ratings = ${JSON.stringify(currentRatings)} WHERE id = ${appId};`;
                    const updatedAppResult = await sql<AppShowcaseItem>`SELECT * FROM apps WHERE id = ${appId};`;
                    return new Response(JSON.stringify(updatedAppResult.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });

                } else {
                    // Create a new app
                    const appData: Omit<AppShowcaseItem, 'id' | 'ratings'> = await request.json();
                    const newId = new Date().toISOString() + Math.random();
                    const newApp: AppShowcaseItem = { ...appData, id: newId, ratings: [] };

                    await sql`
                        INSERT INTO apps (id, name, description, imageUrl, heroImageUrl, longDescription, price, screenshots, features, abilities, whyItWorks, dedicatedPurpose, termsAndConditions, ratings, pinCode, apkUrl, iosUrl, pwaUrl)
                        VALUES (${newApp.id}, ${newApp.name}, ${newApp.description}, ${newApp.imageUrl}, ${newApp.heroImageUrl}, ${newApp.longDescription}, ${newApp.price}, ${JSON.stringify(newApp.screenshots)}, ${JSON.stringify(newApp.features)}, ${JSON.stringify(newApp.abilities)}, ${newApp.whyItWorks}, ${newApp.dedicatedPurpose}, ${newApp.termsAndConditions}, ${JSON.stringify(newApp.ratings)}, ${newApp.pinCode}, ${newApp.apkUrl}, ${newApp.iosUrl}, ${newApp.pwaUrl});
                    `;
                    return new Response(JSON.stringify(newApp), { status: 201, headers: { 'Content-Type': 'application/json' } });
                }

            case 'PUT':
                if (id) {
                    // Update an app
                    const app: AppShowcaseItem = await request.json();
                    await sql`
                        UPDATE apps SET name = ${app.name}, description = ${app.description}, imageUrl = ${app.imageUrl}, heroImageUrl = ${app.heroImageUrl}, longDescription = ${app.longDescription}, price = ${app.price}, screenshots = ${JSON.stringify(app.screenshots)}, features = ${JSON.stringify(app.features)}, abilities = ${JSON.stringify(app.abilities)}, whyItWorks = ${app.whyItWorks}, dedicatedPurpose = ${app.dedicatedPurpose}, termsAndConditions = ${app.termsAndConditions}, pinCode = ${app.pinCode}, apkUrl = ${app.apkUrl}, iosUrl = ${app.iosUrl}, pwaUrl = ${app.pwaUrl} WHERE id = ${id};
                    `;
                    return new Response(JSON.stringify(app), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify({ message: 'App ID required for PUT' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

            case 'DELETE':
                if (id) {
                    // Delete an app
                    await sql`DELETE FROM apps WHERE id = ${id};`;
                    return new Response(JSON.stringify({ message: 'App deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify({ message: 'App ID required for DELETE' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            
            default:
                return new Response(JSON.stringify({ message: `Method ${method} Not Allowed` }), { status: 405, headers: { 'Content-Type': 'application/json' } });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
