import { sql } from '@vercel/postgres';
import type { TeamMember } from '../../types';

export async function GET(_request: Request) {
    try {
        const { rows } = await sql<TeamMember>`SELECT * FROM team_members;`;
        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function POST(request: Request) { // Create Member
    try {
        const memberData: Omit<TeamMember, 'id'> = await request.json();
        const newMember: TeamMember = { ...memberData, id: new Date().toISOString() + Math.random() };
        await sql`
            INSERT INTO team_members (id, firstName, lastName, tel, email, pin, role, profileImageUrl)
            VALUES (${newMember.id}, ${newMember.firstName}, ${newMember.lastName}, ${newMember.tel}, ${newMember.email}, ${newMember.pin}, ${newMember.role}, ${newMember.profileImageUrl});
        `;
        return new Response(JSON.stringify(newMember), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function PUT(request: Request) { // Update Member
    try {
        const member: TeamMember = await request.json();
        const { id } = member;
        if (!id) {
            return new Response(JSON.stringify({ message: 'Member ID is required for update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        await sql`
            UPDATE team_members SET firstName = ${member.firstName}, lastName = ${member.lastName}, tel = ${member.tel}, email = ${member.email}, pin = ${member.pin}, role = ${member.role}, profileImageUrl = ${member.profileImageUrl} WHERE id = ${id};
        `;
        return new Response(JSON.stringify(member), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function DELETE(request: Request) { // Delete Member
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return new Response(JSON.stringify({ message: 'Member ID query parameter is required for deletion' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        await sql`DELETE FROM team_members WHERE id = ${id};`;
        return new Response(JSON.stringify({ message: 'Team member deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}