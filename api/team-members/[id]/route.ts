import { sql } from '@vercel/postgres';
import type { TeamMember } from '../../../types';

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

    return new Response(JSON.stringify(member), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// DELETE a team member
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await sql`DELETE FROM team_members WHERE id = ${id};`;
    return new Response(JSON.stringify({ message: 'Team member deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}