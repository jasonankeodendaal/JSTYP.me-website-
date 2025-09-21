import { sql } from '@vercel/postgres';
import type { AppShowcaseItem } from '../../../types';

// GET a single app by ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM apps WHERE id = ${id};`;
    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'App not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(result.rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// UPDATE an app by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const app: AppShowcaseItem = await request.json();

    await sql`
      UPDATE apps
      SET 
        name = ${app.name}, 
        description = ${app.description}, 
        imageUrl = ${app.imageUrl}, 
        heroImageUrl = ${app.heroImageUrl}, 
        longDescription = ${app.longDescription}, 
        price = ${app.price}, 
        screenshots = ${JSON.stringify(app.screenshots)}, 
        features = ${JSON.stringify(app.features)}, 
        abilities = ${JSON.stringify(app.abilities)}, 
        whyItWorks = ${app.whyItWorks}, 
        dedicatedPurpose = ${app.dedicatedPurpose}, 
        termsAndConditions = ${app.termsAndConditions}, 
        pinCode = ${app.pinCode}, 
        apkUrl = ${app.apkUrl}, 
        iosUrl = ${app.iosUrl}, 
        pwaUrl = ${app.pwaUrl}
      WHERE id = ${id};
    `;

    return new Response(JSON.stringify(app), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// DELETE an app by ID
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await sql`DELETE FROM apps WHERE id = ${id};`;
    return new Response(JSON.stringify({ message: 'App deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// ADD a rating to an app
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: appId } = params;
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
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
