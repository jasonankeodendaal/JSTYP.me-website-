import { sql } from '@vercel/postgres';
import type { AppShowcaseItem } from '../../../../types';

export const dynamic = 'force-dynamic';

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