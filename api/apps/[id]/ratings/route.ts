import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { AppShowcaseItem } from '../../../../types';

export const dynamic = 'force-dynamic';

// ADD a rating to an app
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: appId } = params;
    const { clientId, rating } = await request.json();

    if (!clientId || !rating) {
        return NextResponse.json({ message: 'Client ID and rating are required' }, { status: 400 });
    }

    const { rows } = await sql<AppShowcaseItem>`SELECT * FROM apps WHERE id = ${appId};`;
    if (rows.length === 0) {
      return NextResponse.json({ message: 'App not found' }, { status: 404 });
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

    return NextResponse.json(updatedAppResult.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}