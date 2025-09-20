import { useState, useEffect, useCallback } from 'react';
import type { AppShowcaseItem } from '../types';
import * as api from '../services/api';

export const useApps = () => {
  const [apps, setApps] = useState<AppShowcaseItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getApps();
      setApps(data);
    } catch (error) {
      console.error("Failed to fetch apps", error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const addApp = useCallback(async (newApp: Omit<AppShowcaseItem, 'id' | 'ratings'>) => {
    try {
      const createdApp = await api.createApp(newApp);
      setApps(prev => (prev ? [...prev, createdApp] : [createdApp]));
    } catch (error) {
      console.error("Failed to add app", error);
    }
  }, []);
  
  const deleteApp = useCallback(async (appId: string) => {
    try {
      await api.deleteApp(appId);
      setApps(prev => prev ? prev.filter(app => app.id !== appId) : []);
    } catch (error) {
      console.error("Failed to delete app", error);
    }
  }, []);

  const updateApp = useCallback(async (appToUpdate: AppShowcaseItem) => {
    try {
      const updated = await api.updateApp(appToUpdate);
      setApps(prev => prev ? prev.map(app => app.id === updated.id ? updated : app) : []);
    } catch (error) {
      console.error("Failed to update app", error);
    }
  }, []);

  const addRating = useCallback(async (appId: string, clientId: string, rating: number) => {
    try {
      const updatedApp = await api.addAppRating(appId, clientId, rating);
      setApps(prev => prev ? prev.map(app => app.id === updatedApp.id ? updatedApp : app) : []);
    } catch (error) {
      console.error("Failed to add rating", error);
    }
  }, []);

  return { apps, addApp, deleteApp, updateApp, addRating, loading };
};