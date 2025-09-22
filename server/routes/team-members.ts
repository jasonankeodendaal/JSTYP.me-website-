import { Router } from 'express';
import { pool } from '../db';
import { saveBase64Image } from '../uploader';
import type { TeamMember } from '../../types';

const router = Router();

// GET all team members
router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query<TeamMember>('SELECT * FROM team_members;');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST a new team member
router.post('/', async (req, res) => {
    try {
        const memberData: Omit<TeamMember, 'id'> = req.body;
        
        const profileImageUrl = await saveBase64Image(memberData.profileImageUrl);

        const newMember: TeamMember = { ...memberData, id: new Date().toISOString() + Math.random(), profileImageUrl };
        await pool.query(
            'INSERT INTO team_members (id, "firstName", "lastName", tel, email, pin, role, "profileImageUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8);',
            [newMember.id, newMember.firstName, newMember.lastName, newMember.tel, newMember.email, newMember.pin, newMember.role, newMember.profileImageUrl]
        );
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT to update a team member
router.put('/', async (req, res) => {
    try {
        const member: TeamMember = req.body;
        const { id } = member;
        if (!id) {
            return res.status(400).json({ message: 'Member ID is required for update' });
        }
        
        const profileImageUrl = await saveBase64Image(member.profileImageUrl);
        const memberWithUrl = { ...member, profileImageUrl };

        await pool.query(
            'UPDATE team_members SET "firstName" = $1, "lastName" = $2, tel = $3, email = $4, pin = $5, role = $6, "profileImageUrl" = $7 WHERE id = $8;',
            [memberWithUrl.firstName, memberWithUrl.lastName, memberWithUrl.tel, memberWithUrl.email, memberWithUrl.pin, memberWithUrl.role, memberWithUrl.profileImageUrl, id]
        );
        res.status(200).json(memberWithUrl);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// DELETE a team member
router.delete('/', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Member ID query parameter is required for deletion' });
        }
        await pool.query('DELETE FROM team_members WHERE id = $1;', [id]);
        res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
