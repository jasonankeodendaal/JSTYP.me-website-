import { useState, useEffect, useCallback } from 'react';
import type { Client } from '../types';
import * as api from '../services/api';

export const useClients = () => {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(async (newClientData: Omit<Client, 'id'>): Promise<Client> => {
    try {
      const newClient = await api.createClient(newClientData);
      setClients(prev => (prev ? [...prev, newClient] : [newClient]));
      return newClient;
    } catch (error) {
      console.error("Failed to add client", error);
      throw error; // Re-throw to be caught by the caller
    }
  }, []);

  return { clients, addClient, loading };
};