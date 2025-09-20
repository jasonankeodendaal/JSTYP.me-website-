import { useState, useEffect, useCallback } from 'react';
import type { AppRequest } from '../types';
import * as api from '../services/api';

export const useAppRequests = () => {
  const [requests, setRequests] = useState<AppRequest[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAppRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch app requests", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const addRequest = useCallback(async (problemDescription: string) => {
    try {
      const newRequest = await api.createAppRequest(problemDescription);
      setRequests(prev => (prev ? [...prev, newRequest] : [newRequest]));
    } catch (error) {
      console.error("Failed to add app request", error);
    }
  }, []);
  
  const updateRequestStatus = useCallback(async (requestId: string, status: 'thinking' | 'done') => {
    try {
      const updatedRequest = await api.updateAppRequestStatus(requestId, status);
      setRequests(prev => 
        prev 
          ? prev.map(req => req.id === requestId ? updatedRequest : req)
          : []
      );
    } catch (error) {
      console.error("Failed to update app request status", error);
    }
  }, []);

  return { requests, addRequest, updateRequestStatus, loading };
};