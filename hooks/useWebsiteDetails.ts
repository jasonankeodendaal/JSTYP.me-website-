import { useState, useEffect, useCallback } from 'react';
import type { WebsiteDetails } from '../types';
import * as api from '../services/api';

export const useWebsiteDetails = () => {
  const [details, setDetails] = useState<WebsiteDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getWebsiteDetails();
      setDetails(data);
    } catch (error) {
      console.error("Failed to fetch website details", error);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);


  const updateDetails = useCallback(async (newDetails: WebsiteDetails) => {
    try {
      const updatedDetails = await api.updateWebsiteDetails(newDetails);
      setDetails(updatedDetails);
    } catch (error) {
      console.error("Failed to update website details", error);
    }
  }, []);

  return { details, updateDetails, loading };
};