import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { AppShowcaseItem } from '../../../types';

export const dynamic = 'force-dynamic';

// GET all apps
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM apps;`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// CREATE a new app
export async function POST(request: Request) {
  try {
    const appData: Omit<AppShowcaseItem, 'id' | 'ratings'> = await request.json();
    const newId = new Date().toISOString() + Math.random();
    const newApp: AppShowcaseItem = {
      ...appData,
      id: newId,
      ratings: [],
    };

    await sql`
      INSERT INTO apps (id, name, description, imageUrl, heroImageUrl, longDescription, price, screenshots, features, abilities, whyItWorks, dedicatedPurpose, termsAndConditions, ratings, pinCode, apkUrl, iosUrl, pwaUrl)
      VALUES (
        ${newApp.id}, ${newApp.name}, ${newApp.description}, ${newApp.imageUrl}, ${newApp.heroImageUrl}, 
        ${newApp.longDescription}, ${newApp.price}, ${JSON.stringify(newApp.screenshots)}, 
        ${JSON.stringify(newApp.features)}, ${JSON.stringify(newApp.abilities)}, ${newApp.whyItWorks}, 
        ${newApp.dedicatedPurpose}, ${newApp.termsAndConditions}, ${JSON.stringify(newApp.ratings)}, 
        ${newApp.pinCode}, ${newApp.apkUrl}, ${newApp.iosUrl}, ${newApp.pwaUrl}
      );
    `;
    
    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}