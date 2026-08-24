import { logActivity } from './activityLogger';

const STORAGE_KEY = 'erp_employees';

const DEFAULT_EMPLOYEES = [
  { 
    id: 'EMP001', 
    name: 'Arjun Sharma', 
    designation: 'Senior Sales Executive', 
    department: 'Sales', 
    email: 'arjun.sharma@cryptoworld.in', 
    phone: '+91 98765 43210', 
    joiningDate: '12 Jan 2024', 
    status: 'Active', 
    createdAt: '12 Jan 2024, 10:00 AM' 
  },
  { 
    id: 'EMP002', 
    name: 'Priya Verma', 
    designation: 'HR Manager', 
    department: 'HR', 
    email: 'priya.v@cryptoworld.in', 
    phone: '+91 98765 43211', 
    joiningDate: '15 Mar 2024', 
    status: 'Active', 
    createdAt: '15 Mar 2024, 11:30 AM' 
  },
  { 
    id: 'EMP003', 
    name: 'Rohan Gupta', 
    designation: 'Software Engineer', 
    department: 'Engineering', 
    email: 'rohan.g@cryptoworld.in', 
    phone: '+91 98765 43212', 
    joiningDate: '01 Jun 2024', 
    status: 'On Leave', 
    createdAt: '01 Jun 2024, 09:00 AM' 
  },
  { 
    id: 'EMP004', 
    name: 'Sonal Singh', 
    designation: 'Accountant', 
    department: 'Accounts', 
    email: 'sonal.s@cryptoworld.in', 
    phone: '+91 98765 43213', 
    joiningDate: '10 Jul 2024', 
    status: 'Inactive', 
    createdAt: '10 Jul 2024, 02:45 PM' 
  }
];

export const getEmployees = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error fetching employees:', e);
    return DEFAULT_EMPLOYEES;
  }
};

export const saveEmployees = (employees) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    return true;
  } catch (e) {
    console.error('Error saving employees:', e);
    return false;
  }
};

export const createEmployee = (emp) => {
  const employees = getEmployees();
  const newEmp = {
    createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    ...emp
  };
  employees.unshift(newEmp);
  saveEmployees(employees);

  logActivity({
    activityType: 'CREATE',
    module: 'Employees',
    actionDescription: `Added employee: ${newEmp.name} (${newEmp.designation})`,
    newValue: newEmp
  });

  return newEmp;
};

export const updateEmployee = (id, updatedFields) => {
  const employees = getEmployees();
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return null;

  const oldEmp = employees[idx];
  
  // Format joining date if updated as string date
  let formattedJoiningDate = updatedFields.joiningDate;
  if (updatedFields.joiningDate && updatedFields.joiningDate.includes('-')) {
    formattedJoiningDate = new Date(updatedFields.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const updatedEmp = { ...oldEmp, ...updatedFields, joiningDate: formattedJoiningDate || oldEmp.joiningDate };
  employees[idx] = updatedEmp;
  saveEmployees(employees);

  logActivity({
    activityType: 'UPDATE',
    module: 'Employees',
    actionDescription: `Updated employee record: ${updatedEmp.name}`,
    oldValue: oldEmp,
    newValue: updatedEmp
  });

  return updatedEmp;
};

export const deleteEmployee = (id) => {
  const employees = getEmployees();
  const empToDelete = employees.find(e => e.id === id);
  if (!empToDelete) return false;

  const updatedEmployees = employees.filter(e => e.id !== id);
  saveEmployees(updatedEmployees);

  logActivity({
    activityType: 'DELETE',
    module: 'Employees',
    actionDescription: `Deleted employee record: ${empToDelete.name}`,
    oldValue: empToDelete
  });

  return true;
};
