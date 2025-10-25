// src/pages/Events/Events.jsx (updated part)
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useSessions } from '../../hooks/useSessions';
import { useSelector } from 'react-redux'; // Add this import

const Events = () => {
  const {
    sessions,
    loading,
    error,
    stats,
    refreshSessions
  } = useSessions();

  // Get authenticated user from Redux store
  const { user } = useSelector(state => state.user) || {};

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
          <div className="p-6">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No sessions found. Create your first session!
              </p>
            ) : (
              <div className="space-y-4">
                {sessions.map(session => {
                  // Determine user's role in the session
                  const isHost = user && session.hostId._id === user._id;
                  const isLearner = user && session.learnerId._id === user._id;
                  const otherUser = isHost ? session.learnerId : session.hostId;
                  
                  return (
                    <div key={session._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{session.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              session.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                              session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {session.status}
                            </span>
                            <span>{new Date(session.scheduledTime).toLocaleString()}</span>
                            <span>{session.sessionType}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            With: {otherUser.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            You are: {isHost ? 'Host' : 'Learner'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Events;