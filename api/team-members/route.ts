import { sql } from '@vercel/postgres';
import type { TeamMember } from '../../types';

export const dynamic = 'force-dynamic';

// GET all team members
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM team_members;`;
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// CREATE a new team member
export async function POST(request: Request) {
  try {
    const memberData: Omit<TeamMember, 'id'> = await request.json();
    const newMember: TeamMember = {
      ...memberData,
      id: new Date().toISOString() + Math.random(),
    };

    await sql`
      INSERT INTO team_members (id, firstName, lastName, tel, email, pin, role, profileImageUrl)
      VALUES (${newMember.id}, ${newMember.firstName}, ${newMember.lastName}, ${newMember.tel}, ${newMember.email}, ${newMember.pin}, ${newMember.role}, ${newMember.profileImageUrl});
    `;
    
    return new Response(JSON.stringify(newMember), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}