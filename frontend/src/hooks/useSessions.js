// src/hooks/useSessions.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    inProgress: 0,
    upcoming: 0
  });

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/sessions/my');
      const fetchedSessions = response.data.data || [];
      
      setSessions(fetchedSessions);
      calculateStats(fetchedSessions);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch sessions');
      console.error('Sessions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = (sessionsList) => {
    const statsCount = {
      scheduled: 0,
      completed: 0,
      inProgress: 0,
      upcoming: 0
    };

    sessionsList.forEach(session => {
      const now = new Date();
      const scheduledTime = new Date(session.scheduledTime);
      
      switch (session.status) {
        case 'scheduled':
          statsCount.scheduled++;
          if (scheduledTime >= now) statsCount.upcoming++;
          break;
        case 'in-progress':
          statsCount.inProgress++;
          statsCount.upcoming++;
          break;
        case 'completed':
          statsCount.completed++;
          break;
        default:
          break;
      }
    });

    setStats(statsCount);
  };

  // Refresh sessions
  const refreshSessions = () => {
    fetchSessions();
  };

  // Get sessions by status
  const getSessionsByStatus = (status) => {
    return sessions.filter(session => session.status === status);
  };

  // Get upcoming sessions
  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(session => {
      const scheduledTime = new Date(session.scheduledTime);
      return scheduledTime >= now || session.status === 'in-progress';
    });
  };

  // Get completed sessions
  const getCompletedSessions = () => {
    return sessions.filter(session => 
      session.status === 'completed' || session.status === 'no-show'
    );
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    stats,
    fetchSessions,
    refreshSessions,
    getSessionsByStatus,
    getUpcomingSessions,
    getCompletedSessions
  };
};