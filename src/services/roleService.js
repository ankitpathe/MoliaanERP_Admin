import { logActivity } from './activityLogger';
import { getUsers } from './userService';

const STORAGE_KEY = 'erp_roles';

const DEFAULT_ROLES = [
  {
    id: 'ROLE001',
    name: 'Administrator',
    description: 'Full system access with privileges to manage backups, user accounts, and security controls.',
    isSystem: true,
    permissions: {
      Dashboard: ['View'],
      Users: ['View', 'Create', 'Edit', 'Delete'],
      Employees: ['View', 'Create', 'Edit', 'Delete'],
      Sales: ['View', 'Create', 'Edit', 'Delete'],
      Purchase: ['View', 'Create', 'Edit', 'Delete'],
      Inventory: ['View', 'Create', 'Edit', 'Delete'],
      GST: ['View', 'Create', 'Edit', 'Delete'],
      Reports: ['View', 'Create', 'Edit', 'Delete'],
      ActivityLogs: ['View'],
      Settings: ['View', 'Create', 'Edit', 'Delete']
    }
  },
  {
    id: 'ROLE002',
    name: 'Manager',
    description: 'Manage sales registers, inventory levels, client directories, and view standard reports.',
    isSystem: false,
    permissions: {
      Dashboard: ['View'],
      Users: ['View'],
      Employees: ['View'],
      Sales: ['View', 'Create', 'Edit'],
      Purchase: ['View', 'Create', 'Edit'],
      Inventory: ['View', 'Create', 'Edit'],
      GST: ['View'],
      Reports: ['View'],
      ActivityLogs: [],
      Settings: ['View']
    }
  },
  {
    id: 'ROLE003',
    name: 'Staff',
    description: 'Access POS terminal screens to log sales and daybook operations.',
    isSystem: false,
    permissions: {
      Dashboard: ['View'],
      Users: [],
      Employees: [],
      Sales: ['View', 'Create'],
      Purchase: [],
      Inventory: ['View'],
      GST: [],
      Reports: [],
      ActivityLogs: [],
      Settings: []
    }
  }
];

export const getRoles = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const rolesList = data ? JSON.parse(data) : DEFAULT_ROLES;
    
    // Dynamically calculate user counts from userService
    const users = getUsers();
    return rolesList.map(role => {
      const userCount = users.filter(u => u.role?.toLowerCase() === role.name?.toLowerCase()).length;
      return { ...role, userCount };
    });
  } catch (e) {
    console.error('Error fetching roles:', e);
    return DEFAULT_ROLES;
  }
};

export const saveRoles = (roles) => {
  try {
    // Strip userCount dynamic property before saving
    const rolesToSave = roles.map(({ userCount, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rolesToSave));
    return true;
  } catch (e) {
    console.error('Error saving roles:', e);
    return false;
  }
};

export const createRole = (roleFields) => {
  const roles = getRoles();
  
  // Uniqueness check
  const nameExists = roles.some(r => r.name.toLowerCase() === roleFields.name.trim().toLowerCase());
  if (nameExists) {
    throw new Error('A role with this name already exists.');
  }

  const newRole = {
    id: `ROLE${Math.floor(100 + Math.random() * 900)}`,
    isSystem: false,
    permissions: roleFields.permissions || {
      Dashboard: ['View'],
      Users: [],
      Employees: [],
      Sales: [],
      Purchase: [],
      Inventory: [],
      GST: [],
      Reports: [],
      ActivityLogs: [],
      Settings: []
    },
    ...roleFields
  };

  roles.push(newRole);
  saveRoles(roles);

  logActivity({
    activityType: 'CREATE',
    module: 'Roles',
    actionDescription: `Created role: ${newRole.name}`,
    newValue: newRole
  });

  return newRole;
};

export const updateRole = (id, updatedFields) => {
  const roles = getRoles();
  const idx = roles.findIndex(r => r.id === id);
  if (idx === -1) return null;

  const oldRole = roles[idx];
  
  // Name change validation
  if (updatedFields.name && updatedFields.name.toLowerCase() !== oldRole.name.toLowerCase()) {
    const nameExists = roles.some(r => r.name.toLowerCase() === updatedFields.name.trim().toLowerCase() && r.id !== id);
    if (nameExists) throw new Error('A role with this name already exists.');
  }

  const updatedRole = { ...oldRole, ...updatedFields };
  roles[idx] = updatedRole;
  saveRoles(roles);

  logActivity({
    activityType: 'UPDATE',
    module: 'Roles',
    actionDescription: `Updated role: ${updatedRole.name}`,
    oldValue: oldRole,
    newValue: updatedRole
  });

  return updatedRole;
};

export const deleteRole = (id) => {
  const roles = getRoles();
  const roleToDelete = roles.find(r => r.id === id);
  if (!roleToDelete) return false;

  if (roleToDelete.isSystem) {
    throw new Error('System roles are protected and cannot be deleted.');
  }

  // Check user counts
  const users = getUsers();
  const hasAssignedUsers = users.some(u => u.role?.toLowerCase() === roleToDelete.name?.toLowerCase());
  if (hasAssignedUsers) {
    throw new Error('This role is assigned to users. Reassign those users before deleting this role.');
  }

  const updatedRoles = roles.filter(r => r.id !== id);
  saveRoles(updatedRoles);

  logActivity({
    activityType: 'DELETE',
    module: 'Roles',
    actionDescription: `Deleted role: ${roleToDelete.name}`,
    oldValue: roleToDelete
  });

  return true;
};
