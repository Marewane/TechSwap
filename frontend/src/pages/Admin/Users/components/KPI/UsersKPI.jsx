import React from 'react';

const UsersKPI = ({ data }) => {
  const { total = 0, active = 0, suspended = 0 } = data || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-sm font-medium text-gray-500">Total Registered Users</h2>
        <p className="text-3xl font-bold">{total}</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-sm font-medium text-gray-500">Active Users</h2>
        <p className="text-3xl font-bold text-green-500">{active}</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-sm font-medium text-gray-500">Suspended Users</h2>
        <p className="text-3xl font-bold text-red-500">{suspended}</p>
      </div>
    </div>
  );
};

export default UsersKPI;
