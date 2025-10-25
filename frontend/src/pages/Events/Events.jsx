// src/pages/Events/Events.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useSessions } from '../../hooks/useSessions';
import { useSelector } from 'react-redux';
import SessionCard from '../../components/Session/SessionCard';

const Events = () => {
  const {
    filteredSessions,
    loading,
    error,
    stats,
    refreshSessions,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter
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

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
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

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Date:</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[140px]">
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

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64"
                />
                <button 
                  onClick={refreshSessions}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader className="p-6">
            <div className="flex justify-between items-center">
              <CardTitle>
                Sessions ({filteredSessions.length}) 
                {searchQuery && ` - Search: "${searchQuery}"`}
              </CardTitle>
            </div>
          </CardHeader>
          <div className="p-6 space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'No sessions match your search.' : 
                   statusFilter !== 'all' ? 'No sessions with this status.' :
                   'No sessions found. Create your first session!'}
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 hover:underline"
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