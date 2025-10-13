// A mock API service for user management

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
  // Add more mock users if needed
];

export const getUsers = async () => {
  // In a real app, you would fetch this from an API endpoint
  // e.g., return await fetch('/api/users').then(res => res.json());
  return new Promise(resolve => setTimeout(() => resolve(users), 500));
};

export const suspendUser = async (userId) => {
  console.log(`Suspending user ${userId}`);
  // e.g., await fetch(`/api/users/${userId}/suspend`, { method: 'POST' });
  return new Promise(resolve => setTimeout(resolve, 500));
};

export const reactivateUser = async (userId) => {
  console.log(`Reactivating user ${userId}`);
  // e.g., await fetch(`/api/users/${userId}/reactivate`, { method: 'POST' });
  return new Promise(resolve => setTimeout(resolve, 500));
};

export const deleteUser = async (userId) => {
  console.log(`Deleting user ${userId}`);
  // e.g., await fetch(`/api/users/${userId}`, { method: 'DELETE' });
  return new Promise(resolve => setTimeout(resolve, 500));
};
