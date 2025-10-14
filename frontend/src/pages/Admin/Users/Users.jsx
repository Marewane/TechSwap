import React, { useState, useEffect, useMemo, useCallback } from 'react';
import UsersKPI from './components/KPI/UsersKPI';
import UsersFilters from './components/Filters/UsersFilters';
import UsersTable from './components/Table/UsersTable';
import { getUsers, suspendUser, reactivateUser, deleteUser } from '../../../services/userAPI';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const userList = await getUsers();
    setUsers(userList);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = useCallback(async (action, userId) => {
    await action(userId);
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower);
      
      const matchesStatus =
        statusFilter === 'all' || user.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const kpiData = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'Active').length,
      suspended: users.filter(u => u.status === 'Suspended').length,
    };
  }, [users]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UsersKPI data={kpiData} />
      <div className="bg-white p-4 rounded-lg shadow-md">
        <UsersFilters
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
        />
        <UsersTable
          users={filteredUsers}
          loading={loading}
          onSuspend={(userId) => handleAction(suspendUser, userId)}
          onReactivate={(userId) => handleAction(reactivateUser, userId)}
          onDelete={(userId) => handleAction(deleteUser, userId)}
        />
      </div>
    </div>
  );
};

export default Users;
