// src/hooks/useWallet.js
import { useState, useEffect } from 'react';
import api from '@/services/api';

export const useWallet = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        // api baseURL already includes /api
        const res = await api.get('/users/me/wallet');
        setBalance(res.data.balance || 0);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  return { balance, loading };
};