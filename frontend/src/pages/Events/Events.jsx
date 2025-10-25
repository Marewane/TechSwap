// src/pages/Events/Events.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useSessions } from '../../hooks/useSessions';
import { useSelector } from 'react-redux';
import SessionCard from '../../components/Session/SessionCard';

const Events = () => {
  const {
    sessions,
    loading,
    error,
    stats,
    refreshSessions
  } = useSessions();

  const { user } = useSelector(state => state.user) || {};

  // Mock handlers for now (we'll implement these later)
  const handleJoinSession = (session) => {
    console.log('Join session:', session._id);
    // Navigate to live session page
  };

  const handleStartSession = (session) => {
    console.log('Start session:', session._id);
    // Start the session via API
  };

  const handleViewDetails = (session) => {
    console.log('View details:', session._id);
    // Show session details modal
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg">Error: {error}</div>
          <button 
            onClick={refreshSessions}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="mt-2 text-gray-600">
            Manage your scheduled and upcoming sessions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl">{stats.scheduled}</CardTitle>
              <CardDescription>Scheduled</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl">{stats.completed}</CardTitle>
              <CardDescription>Completed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl">{stats.inProgress}</CardTitle>
              <CardDescription>In Progress</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl">{stats.upcoming}</CardTitle>
              <CardDescription>Upcoming</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Sessions List */}
        <Card>
          <CardHeader className="p-6">
            <div className="flex justify-between items-center">
              <CardTitle>Your Sessions ({sessions.length})</CardTitle>
              <div className="flex space-x-2">
                <select className="border rounded px-3 py-2">
                  <option>All Status</option>
                  <option>Scheduled</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <button 
                  onClick={refreshSessions}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Refresh
                </button>
              </div>
            </div>
          </CardHeader>
          <div className="p-6 space-y-4">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No sessions found. Create your first session!
              </p>
            ) : (
              sessions.map(session => (
                <SessionCard
                  key={session._id}
                  session={session}
                  currentUser={user}
                  onJoinSession={handleJoinSession}
                  onStartSession={handleStartSession}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Events;