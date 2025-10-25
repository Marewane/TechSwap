// src/hooks/useSessions.js
import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Add filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

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

  // Filter sessions based on filters
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => {
        if (statusFilter === 'upcoming') {
          const now = new Date();
          const scheduledTime = new Date(session.scheduledTime);
          return scheduledTime >= now || session.status === 'in-progress';
        } else if (statusFilter === 'live') {
          return session.status === 'in-progress';
        } else {
          return session.status === statusFilter;
        }
      });
    }

    // Search filter (title, participant name, description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.description.toLowerCase().includes(query) ||
        session.hostId.name.toLowerCase().includes(query) ||
        session.learnerId.name.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(session => {
        const scheduledTime = new Date(session.scheduledTime);
        
        switch (dateFilter) {
          case 'today':
            const today = new Date();
            return scheduledTime.toDateString() === today.toDateString();
          case 'this-week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return scheduledTime >= oneWeekAgo && scheduledTime <= new Date();
          case 'this-month':
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return scheduledTime >= oneMonthAgo && scheduledTime <= new Date();
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [sessions, statusFilter, searchQuery, dateFilter]);

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
    filteredSessions,
    loading,
    error,
    stats,
    fetchSessions,
    refreshSessions,
    getSessionsByStatus,
    getUpcomingSessions,
    getCompletedSessions,
    // Filter functions
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter
  };
};