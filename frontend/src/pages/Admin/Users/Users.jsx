import React from 'react';
import UsersKPI from './components/KPI/UsersKPI';
import UsersFilters from './components/Filters/UsersFilters';
import UsersTable from './components/Table/UsersTable';

const Users = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UsersKPI />
      <div className="bg-white p-4 rounded-lg shadow-md">
        <UsersFilters />
        <UsersTable />
      </div>
    </div>
  );
};

export default Users;
