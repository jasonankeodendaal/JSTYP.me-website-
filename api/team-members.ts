import { sql } from '@vercel/postgres';
import type { TeamMember } from '../../types';

export default async function handler(request: Request) {
    const { method, url } = request;
    const { searchParams } = new URL(url);
    const id = searchParams.get('id');

    try {
        switch (method) {
            case 'GET':
                const { rows } = await sql<TeamMember>`SELECT * FROM team_members;`;
                return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });

            case 'POST':
                const memberData: Omit<TeamMember, 'id'> = await request.json();
                const newMember: TeamMember = { ...memberData, id: new Date().toISOString() + Math.random() };
                await sql`
                    INSERT INTO team_members (id, firstName, lastName, tel, email, pin, role, profileImageUrl)
                    VALUES (${newMember.id}, ${newMember.firstName}, ${newMember.lastName}, ${newMember.tel}, ${newMember.email}, ${newMember.pin}, ${newMember.role}, ${newMember.profileImageUrl});
                `;
                return new Response(JSON.stringify(newMember), { status: 201, headers: { 'Content-Type': 'application/json' } });

            case 'PUT':
                if (id) {
                    const member: TeamMember = await request.json();
                    await sql`
                        UPDATE team_members SET firstName = ${member.firstName}, lastName = ${member.lastName}, tel = ${member.tel}, email = ${member.email}, pin = ${member.pin}, role = ${member.role}, profileImageUrl = ${member.profileImageUrl} WHERE id = ${id};
                    `;
                    return new Response(JSON.stringify(member), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify({ message: 'Member ID required for PUT' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

            case 'DELETE':
                if (id) {
                    await sql`DELETE FROM team_members WHERE id = ${id};`;
                    return new Response(JSON.stringify({ message: 'Team member deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify({ message: 'Member ID required for DELETE' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

            default:
                return new Response(JSON.stringify({ message: `Method ${method} Not Allowed` }), { status: 405, headers: { 'Content-Type': 'application/json' } });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
