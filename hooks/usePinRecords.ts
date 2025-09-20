import { useState, useEffect, useCallback } from 'react';
import type { PinRecord } from '../types';
import * as api from '../services/api';

export const usePinRecords = () => {
  const [records, setRecords] = useState<PinRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPinRecords();
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch PIN records", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const generatePin = useCallback(async (data: Omit<PinRecord, 'id' | 'pin' | 'isRedeemed' | 'generatedAt'>): Promise<PinRecord> => {
    try {
      const newPin = await api.createPinRecord(data);
      setRecords(prev => (prev ? [...prev, newPin] : [newPin]));
      return newPin;
    } catch (error) {
      console.error("Failed to generate PIN", error);
      throw error;
    }
  }, []);
  
  const verifyAndRedeemPin = useCallback(async (pin: string, appId: string, client?: { id: string, name: string }): Promise<{ success: boolean, message: string }> => {
    try {
      const updatedRecord = await api.redeemPin(pin, appId, client);
      setRecords(prev => 
        prev 
          ? prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec)
          : []
      );
      return { success: true, message: "PIN Verified!" };
    } catch (error: any) {
      console.error("Failed to redeem PIN", error);
      return { success: false, message: error.message || "An unexpected error occurred." };
    }
  }, []);

  return { records, generatePin, verifyAndRedeemPin, loading };
};