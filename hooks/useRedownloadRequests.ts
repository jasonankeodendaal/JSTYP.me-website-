import { useState, useEffect, useCallback } from 'react';
import type { RedownloadRequest } from '../types';
import * as api from '../services/api';

export const useRedownloadRequests = () => {
  const [requests, setRequests] = useState<RedownloadRequest[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getRedownloadRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch re-download requests", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const addRequest = useCallback(async (requestData: Omit<RedownloadRequest, 'id' | 'status' | 'requestedAt'>) => {
    try {
      const newRequest = await api.createRedownloadRequest(requestData);
      if (newRequest) { // API service returns null if a pending request exists
        setRequests(prev => (prev ? [...prev, newRequest] : [newRequest]));
      }
    } catch (error) {
      console.error("Failed to add re-download request", error);
    }
  }, []);

  const updateRequest = useCallback(async (requestId: string, status: 'approved' | 'denied', resolutionNotes: string) => {
    try {
      const updated = await api.updateRedownloadRequest(requestId, status, resolutionNotes);
      setRequests(prev => 
        prev 
          ? prev.map(req => req.id === updated.id ? updated : req)
          : []
      );
    } catch (error) {
      console.error("Failed to update re-download request", error);
    }
  }, []);

  return { requests, addRequest, updateRequest, loading };
};