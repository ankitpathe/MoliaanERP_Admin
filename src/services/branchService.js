import { logActivity } from './activityLogger';

const STORAGE_KEY = 'erp_branches';

const DEFAULT_BRANCHES = [
  {
    id: 'BRN001',
    name: 'Head Office (Moliaan HQ)',
    code: 'HO-01',
    type: 'Head Office',
    manager: 'Arjun Sharma',
    phone: '9827364510',
    email: 'hq@moliaan.com',
    address: 'Main Road, Civil Lines',
    city: 'Chhindwara',
    state: 'Madhya Pradesh',
    pincode: '480001',
    gstin: '23ABCDE1234F1Z5',
    status: 'Active',
    isDefault: true,
    createdAt: '12 Jan 2024, 10:00 AM'
  }
];

export const getBranches = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error fetching branches:', e);
    return DEFAULT_BRANCHES;
  }
};

export const saveBranches = (branches) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
    return true;
  } catch (e) {
    console.error('Error saving branches:', e);
    return false;
  }
};

export const createBranch = (branch) => {
  const branches = getBranches();

  // Enforce unique branch code
  const codeExists = branches.some(b => b.code.toUpperCase() === branch.code.trim().toUpperCase());
  if (codeExists) {
    throw new Error('A branch with this code already exists.');
  }

  // Handle single default branch constraint
  let updatedBranches = [...branches];
  if (branch.isDefault) {
    updatedBranches = updatedBranches.map(b => ({ ...b, isDefault: false }));
  }

  const newBranch = {
    id: `BRN${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    ...branch,
    code: branch.code.trim().toUpperCase()
  };

  updatedBranches.unshift(newBranch);
  saveBranches(updatedBranches);

  logActivity({
    activityType: 'CREATE',
    module: 'Branch Settings',
    actionDescription: `Created branch/warehouse: ${newBranch.name} (${newBranch.code})`,
    newValue: newBranch
  });

  return newBranch;
};

export const updateBranch = (id, updatedFields) => {
  const branches = getBranches();
  const idx = branches.findIndex(b => b.id === id);
  if (idx === -1) return null;

  const oldBranch = branches[idx];

  // Enforce unique code on change
  if (updatedFields.code && updatedFields.code.toUpperCase() !== oldBranch.code.toUpperCase()) {
    const codeExists = branches.some(b => b.code.toUpperCase() === updatedFields.code.trim().toUpperCase() && b.id !== id);
    if (codeExists) throw new Error('A branch with this code already exists.');
  }

  // Handle single default branch constraint
  let updatedBranches = [...branches];
  if (updatedFields.isDefault) {
    updatedBranches = updatedBranches.map(b => ({ ...b, isDefault: false }));
  }

  const updatedBranch = { 
    ...oldBranch, 
    ...updatedFields, 
    code: updatedFields.code ? updatedFields.code.trim().toUpperCase() : oldBranch.code 
  };
  
  updatedBranches[idx] = updatedBranch;
  saveBranches(updatedBranches);

  logActivity({
    activityType: 'UPDATE',
    module: 'Branch Settings',
    actionDescription: `Updated branch settings: ${updatedBranch.name}`,
    oldValue: oldBranch,
    newValue: updatedBranch
  });

  return updatedBranch;
};

export const deleteBranch = (id) => {
  const branches = getBranches();
  const branchToDelete = branches.find(b => b.id === id);
  if (!branchToDelete) return false;

  // Protect default branch from deletion if there are multiple branches
  if (branchToDelete.isDefault && branches.length > 1) {
    throw new Error('Default branch cannot be deleted. Set another branch as default first.');
  }

  const updatedBranches = branches.filter(b => b.id !== id);
  
  // If we deleted the default branch and there are other branches, set the first one as default
  if (branchToDelete.isDefault && updatedBranches.length > 0) {
    updatedBranches[0].isDefault = true;
  }

  saveBranches(updatedBranches);

  logActivity({
    activityType: 'DELETE',
    module: 'Branch Settings',
    actionDescription: `Deleted branch/warehouse: ${branchToDelete.name}`,
    oldValue: branchToDelete
  });

  return true;
};
