import React from 'react';

const UsersKPI = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-sm font-medium text-gray-500">Total Registered Users</h2>
        <p className="text-3xl font-bold">6</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-sm font-medium text-gray-500">Active Users</h2>
        <p className="text-3xl font-bold text-green-500">4</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-sm font-medium text-gray-500">Suspended Users</h2>
        <p className="text-3xl font-bold text-red-500">2</p>
      </div>
    </div>
  );
};

export default UsersKPI;
