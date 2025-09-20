import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { AppShowcaseItem } from '../../../types';

export const dynamic = 'force-dynamic';

// GET a single app by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM apps WHERE id = ${id};`;
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'App not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
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

    return NextResponse.json(app);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE an app by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await sql`DELETE FROM apps WHERE id = ${id};`;
    return NextResponse.json({ message: 'App deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}