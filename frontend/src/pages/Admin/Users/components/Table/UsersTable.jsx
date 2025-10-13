import React from 'react';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';

const users = [
  {
    id: 'TSU005',
    name: 'Eve Adams',
    email: 'eve.a@example.com',
    role: 'Admin',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d',
  },
  {
    id: 'TSU002',
    name: 'Bob Smith',
    email: 'bob.s@example.com',
    role: 'User',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704e',
  },
  {
    id: 'TSU003',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    role: 'User',
    status: 'Suspended',
    avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704f',
  },
];

const UsersTable = () => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <img className="h-8 w-8 rounded-full mr-3" src={user.avatar} alt={user.name} />
                  {user.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.status === 'Active' ? 'success' : 'destructive'}>
                  {user.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button variant="ghost" size="sm">View</Button>
                <Button variant="ghost" size="sm">Suspend</Button>
                <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-6 py-3 border-t">
        <Button variant="outline" size="sm">Previous</Button>
        <div className="text-sm text-gray-500">Page 1 of 10</div>
        <Button variant="outline" size="sm">Next</Button>
      </div>
    </div>
  );
};

export default UsersTable;
