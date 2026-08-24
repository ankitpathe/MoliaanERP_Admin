import { logActivity } from './activityLogger';

const STORAGE_KEY = 'erp_users';

const DEFAULT_USERS = [
  {
    id: 'USR001',
    name: 'Administrator',
    username: 'admin',
    email: 'admin@moliaan.com',
    role: 'Administrator',
    status: 'Active',
    createdDate: '12 Jan 2024',
    lastActive: 'Today'
  },
  {
    id: 'USR002',
    name: 'Ramesh Sharma',
    username: 'ramesh',
    email: 'ramesh@moliaan.com',
    role: 'Manager',
    status: 'Active',
    createdDate: '18 Feb 2024',
    lastActive: '2 hours ago'
  },
  {
    id: 'USR003',
    name: 'Sonal Singh',
    username: 'sonal',
    email: 'sonal.s@moliaan.com',
    role: 'Staff',
    status: 'Inactive',
    createdDate: '10 May 2024',
    lastActive: '3 days ago'
  }
];

export const getUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error fetching users:', e);
    return DEFAULT_USERS;
  }
};

export const saveUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    console.error('Error saving users:', e);
    return false;
  }
};

export const createUser = (user) => {
  const users = getUsers();
  const newUser = {
    id: `USR${Math.floor(100 + Math.random() * 900)}`,
    createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    lastActive: 'Never',
    ...user
  };
  users.push(newUser);
  saveUsers(users);

  logActivity({
    activityType: 'CREATE',
    module: 'Users',
    actionDescription: `Created user: ${newUser.name} (${newUser.role})`,
    newValue: newUser
  });

  return newUser;
};

export const updateUser = (id, updatedFields) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;

  const oldUser = users[idx];
  const updatedUser = { ...oldUser, ...updatedFields };
  users[idx] = updatedUser;
  saveUsers(users);

  logActivity({
    activityType: 'UPDATE',
    module: 'Users',
    actionDescription: `Updated user: ${updatedUser.name} (${updatedUser.role})`,
    oldValue: oldUser,
    newValue: updatedUser
  });

  return updatedUser;
};

export const deleteUser = (id) => {
  const users = getUsers();
  const userToDelete = users.find(u => u.id === id);
  if (!userToDelete) return false;

  // Protect current session user
  const activeSession = JSON.parse(localStorage.getItem('erp_user_session') || '{}');
  if (userToDelete.username === activeSession.username?.toLowerCase()) {
    throw new Error('Cannot delete the currently logged-in administrator.');
  }

  const updatedUsers = users.filter(u => u.id !== id);
  saveUsers(updatedUsers);

  logActivity({
    activityType: 'DELETE',
    module: 'Users',
    actionDescription: `Deleted user: ${userToDelete.name}`,
    oldValue: userToDelete
  });

  return true;
};
