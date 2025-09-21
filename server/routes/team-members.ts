import { Router } from 'express';
import { pool } from '../db';
import type { TeamMember } from '../../types';

const router = Router();

router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query<TeamMember>('SELECT * FROM team_members;');
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/', async (req, res) => { // Create Member
    try {
        const memberData: Omit<TeamMember, 'id'> = req.body;
        const newMember: TeamMember = { ...memberData, id: new Date().toISOString() + Math.random() };
        await pool.query(`
            INSERT INTO team_members (id, firstName, lastName, tel, email, pin, role, profileImageUrl)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `, [newMember.id, newMember.firstName, newMember.lastName, newMember.tel, newMember.email, newMember.pin, newMember.role, newMember.profileImageUrl]);
        return res.status(201).json(newMember);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/', async (req, res) => { // Update Member
    try {
        const member: TeamMember = req.body;
        const { id } = member;
        if (!id) {
            return res.status(400).json({ message: 'Member ID is required for update' });
        }
        await pool.query(`
            UPDATE team_members SET firstName = $1, lastName = $2, tel = $3, email = $4, pin = $5, role = $6, profileImageUrl = $7 WHERE id = $8;
        `, [member.firstName, member.lastName, member.tel, member.email, member.pin, member.role, member.profileImageUrl, id]);
        return res.status(200).json(member);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

router.delete('/', async (req, res) => { // Delete Member
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Member ID query parameter is required for deletion' });
        }
        await pool.query('DELETE FROM team_members WHERE id = $1;', [id]);
        return res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
