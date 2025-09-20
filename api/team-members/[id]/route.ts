import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { TeamMember } from '../../../types';

export const dynamic = 'force-dynamic';

// UPDATE a team member
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const member: TeamMember = await request.json();

    await sql`
      UPDATE team_members
      SET 
        firstName = ${member.firstName}, 
        lastName = ${member.lastName}, 
        tel = ${member.tel}, 
        email = ${member.email}, 
        pin = ${member.pin}, 
        role = ${member.role}, 
        profileImageUrl = ${member.profileImageUrl}
      WHERE id = ${id};
    `;

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE a team member
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await sql`DELETE FROM team_members WHERE id = ${id};`;
    return NextResponse.json({ message: 'Team member deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}