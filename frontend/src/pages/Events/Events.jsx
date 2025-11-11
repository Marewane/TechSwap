// src/pages/Events/Events.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useSessions } from '../../hooks/useSessions';
import { useSelector } from 'react-redux';
import SessionCard from '../../components/Session/SessionCard';
import api from '../../services/api';
import Navbar from '../User/Navbar';

const Events = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const highlightSessionId = location.state?.highlightSessionId || null;
  const autoPromptStart = location.state?.autoPromptStart || false;

  const {
    filteredSessions,
    loading,
    error,
    refreshSessions,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter
  } = useSessions();

  const { user } = useSelector(state => state.user) || {};

  useEffect(() => {
    if (highlightSessionId && statusFilter !== 'all') {
      setStatusFilter('all');
    }
  }, [highlightSessionId, statusFilter, setStatusFilter]);

  useEffect(() => {
    if (highlightSessionId) {
      const timeout = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [highlightSessionId, navigate, location.pathname]);

  const handleJoinSession = (session) => {
    console.log('Join session:', session._id);
    navigate(`/live-session/${session._id}`);
  };

  const handleStartSession = async (session) => {
    console.log('Start session:', session._id);
    try {
      const response = await api.post(`/sessions/${session._id}/start-live`);
      console.log('Session started successfully:', response.data);
      refreshSessions();
      navigate(`/live-session/${session._id}`);
    } catch (err) {
      console.error('Error starting session:', err);
      
      // Extract error message from backend response
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to start session. Please try again.';
      
      // Show detailed error message
      alert(`Failed to start session: ${errorMessage}`);
      
      // Log full error details for debugging
      if (err.response?.data) {
        console.error('Backend error details:', err.response.data);
      }
    }
  };

  const handleViewDetails = (session) => {
    console.log('View details:', session._id);
  };

  // --- NEW: Handle Cancel Session ---
  // const handleCancelSession = async (session) => {
  //   console.log('Cancel session:', session._id);
  //   try {
  //     // Confirm with user
  //     if (!window.confirm(`Are you sure you want to cancel the session "${session.title}"?`)) {
  //       return;
  //     }

  //     // Make API call to cancel session
  //     const response = await api.delete(`/api/sessions/${session._id}`); // Using DELETE endpoint for cancellation
  //     console.log('Session cancelled successfully:', response.data);

  //     // Refresh the session list to reflect the change
  //     refreshSessions();

  //   } catch (err) {
  //     console.error('Error cancelling session:', err);
  //     alert('Failed to cancel session. Please try again.');
  //   }
  // };

  const handleCancelSession = async (session) => {
    console.log('Cancel session:', session._id);
    try {
      // Confirm with user
      if (!window.confirm(`Are you sure you want to cancel the session "${session.title}"?`)) {
        return;
      }

      // --- USE THE CORRECT ENDPOINT FOR CANCELLATION ---
      // This should call your cancelSession controller function
      // which sets status to 'cancelled'
      const response = await api.delete(`/sessions/${session._id}`); // <-- CHANGED: Use DELETE method
      console.log('Session cancelled successfully:', response.data);

      // Refresh the session list to reflect the change
      refreshSessions();

      // Optional: Show success message to user
      // alert('Session cancelled successfully!'); 

    } catch (err) {
      console.error('Error cancelling session:', err);
      
      // Handle specific error cases
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 403) {
          alert('You are not authorized to cancel this session.');
        } else if (err.response.status === 400) {
          alert(`Cannot cancel session: ${err.response.data.message || 'Invalid request.'}`);
        } else if (err.response.status === 404) {
          alert('Session not found.');
        } else {
          alert(`Failed to cancel session (Error ${err.response.status}). Please try again.`);
        }
      } else if (err.request) {
        // Request was made but no response received
        alert('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        alert('Failed to cancel session. Please try again.');
      }
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-base">Error: {error}</div>
          <button
            onClick={refreshSessions}
            className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 py-4 pt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Page Header - Minimal spacing */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">My Sessions</h1>
          <p className="mt-0.5 text-gray-600 text-xs leading-tight">
            Manage your scheduled and upcoming sessions
          </p>
        </div>

        {/* Combined Filter & Sessions List Card - Tight padding */}
        <Card className="shadow-sm">
          {/* Filter Section - Very tight padding */}
          <CardHeader className="p-3 pb-2">
            <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1">
                  <label className="text-xs font-medium text-gray-700">Status:</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[90px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="in-progress">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <label className="text-xs font-medium text-gray-700">Date:</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[100px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-48 h-7 text-xs"
                />
                <button
                  onClick={refreshSessions}
                  className="px-2.5 py-1.5 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                >
                  Refresh
                </button>
              </div>
            </div>
          </CardHeader>

          {/* Sessions List Section - Minimal padding */}
          <div className="p-3 pt-1">
            <div className="flex justify-between items-center mb-2">
              <CardTitle className="text-sm">
                Sessions ({filteredSessions.length})
                {searchQuery && ` - Search: "${searchQuery}"`}
              </CardTitle>
            </div>
            <div className="space-y-2.5">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'No sessions match your search.' :
                      statusFilter !== 'all' ? 'No sessions with this status.' :
                        'No sessions found. Create your first session!'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-1 text-blue-600 hover:underline text-xs"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredSessions.map(session => (
                  <SessionCard
                    key={session._id}
                    session={session}
                    currentUser={user}
                    onJoinSession={handleJoinSession}
                    onStartSession={handleStartSession}
                    onViewDetails={handleViewDetails}
                    onCancelSession={handleCancelSession} // Pass the new handler
                    highlight={highlightSessionId === session._id}
                    autoPromptStart={autoPromptStart && highlightSessionId === session._id}
                  />
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Events;