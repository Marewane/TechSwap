// src/pages/Events/Events.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const Events = () => {
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
              <CardTitle className="text-2xl">0</CardTitle>
              <CardDescription>Scheduled</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl">0</CardTitle>
              <CardDescription>Completed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl">0</CardTitle>
              <CardDescription>In Progress</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-2xl">0</CardTitle>
              <CardDescription>Upcoming</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Sessions List */}
        <Card>
          <CardHeader className="p-6">
            <div className="flex justify-between items-center">
              <CardTitle>Your Sessions</CardTitle>
              <div className="flex space-x-2">
                <select className="border rounded px-3 py-2">
                  <option>All Status</option>
                  <option>Scheduled</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              No sessions found. Create your first session!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Events;