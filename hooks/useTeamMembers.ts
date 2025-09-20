import { useState, useEffect, useCallback } from 'react';
import type { TeamMember } from '../types';
import * as api from '../services/api';

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTeamMembers();
      setTeamMembers(data);
    } catch (error) {
      console.error("Failed to fetch team members", error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);


  const addTeamMember = useCallback(async (newMember: Omit<TeamMember, 'id'>) => {
    try {
        const createdMember = await api.createTeamMember(newMember);
        setTeamMembers(prev => prev ? [...prev, createdMember] : [createdMember]);
    } catch (error) {
        console.error("Failed to add team member", error);
    }
  }, []);

  const updateTeamMember = useCallback(async (memberToUpdate: TeamMember) => {
    try {
        const updatedMember = await api.updateTeamMember(memberToUpdate);
        setTeamMembers(prev => prev ? prev.map(m => m.id === updatedMember.id ? updatedMember : m) : []);
    } catch (error) {
        console.error("Failed to update team member", error);
    }
  }, []);
  
  const deleteTeamMember = useCallback(async (memberId: string) => {
    try {
        await api.deleteTeamMember(memberId);
        setTeamMembers(prev => prev ? prev.filter(m => m.id !== memberId) : []);
    } catch(error) {
        console.error("Failed to delete team member", error);
    }
  }, []);

  return { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, loading };
};