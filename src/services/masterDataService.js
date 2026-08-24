import { logActivity } from './activityLogger';

const STORAGE_KEY = 'erp_master_data';

const DEFAULT_MASTER_DATA = {
  categories: [
    { id: 'CAT_1', name: 'General Goods', code: 'GEN', status: true },
    { id: 'CAT_2', name: 'Beverages', code: 'BEV', status: true },
    { id: 'CAT_3', name: 'Packaged Food', code: 'PFD', status: true }
  ],
  brands: [
    { id: 'BRD_1', name: 'Generic / Local', status: true },
    { id: 'BRD_2', name: 'Nestle', status: true },
    { id: 'BRD_3', name: 'Amul', status: true }
  ],
  units: [
    { id: 'UNT_1', name: 'Pieces', code: 'PCS', allowDecimals: false, status: true },
    { id: 'UNT_2', name: 'Kilograms', code: 'KG', allowDecimals: true, status: true },
    { id: 'UNT_3', name: 'Litres', code: 'LTR', allowDecimals: true, status: true },
    { id: 'UNT_4', name: 'Boxes', code: 'BOX', allowDecimals: false, status: true }
  ],
  paymentMethods: [
    { id: 'PAY_1', name: 'Cash', type: 'CASH', status: true },
    { id: 'PAY_2', name: 'UPI / QR Code', type: 'DIGITAL', status: true },
    { id: 'PAY_3', name: 'Card (POS Machine)', type: 'CARD', status: true },
    { id: 'PAY_4', name: 'Customer Khata / Credit', type: 'CREDIT', status: true }
  ],
  expenseCategories: [
    { id: 'EXP_1', name: 'Shop Rent', status: true },
    { id: 'EXP_2', name: 'Electricity & Water', status: true },
    { id: 'EXP_3', name: 'Staff Salary', status: true },
    { id: 'EXP_4', name: 'Logistics & Transport', status: true }
  ]
};

export const getMasterData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_DATA));
      return DEFAULT_MASTER_DATA;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error fetching master data:', e);
    return DEFAULT_MASTER_DATA;
  }
};

export const saveMasterData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error saving master data:', e);
    return false;
  }
};

export const addMasterItem = (section, item) => {
  const master = getMasterData();
  const list = master[section] || [];

  // Enforce unique name
  const nameExists = list.some(i => i.name.toLowerCase() === item.name.trim().toLowerCase());
  if (nameExists) {
    throw new Error(`An item with name "${item.name}" already exists.`);
  }

  const newItem = {
    id: `${section.toUpperCase().slice(0, 3)}_${Date.now()}`,
    status: true,
    ...item,
    name: item.name.trim()
  };

  list.push(newItem);
  master[section] = list;
  saveMasterData(master);

  logActivity({
    activityType: 'CREATE',
    module: 'Master Data',
    actionDescription: `Added item "${newItem.name}" to ${section} registry`,
    newValue: newItem
  });

  return newItem;
};

export const updateMasterItem = (section, id, updatedFields) => {
  const master = getMasterData();
  const list = master[section] || [];
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return null;

  const oldItem = list[idx];

  // Enforce unique name on change
  if (updatedFields.name && updatedFields.name.toLowerCase() !== oldItem.name.toLowerCase()) {
    const nameExists = list.some(i => i.name.toLowerCase() === updatedFields.name.trim().toLowerCase() && i.id !== id);
    if (nameExists) throw new Error(`An item with name "${updatedFields.name}" already exists.`);
  }

  const updatedItem = { ...oldItem, ...updatedFields };
  list[idx] = updatedItem;
  master[section] = list;
  saveMasterData(master);

  logActivity({
    activityType: 'UPDATE',
    module: 'Master Data',
    actionDescription: `Updated item "${updatedItem.name}" in ${section} registry`,
    oldValue: oldItem,
    newValue: updatedItem
  });

  return updatedItem;
};

export const deleteMasterItem = (section, id) => {
  const master = getMasterData();
  const list = master[section] || [];
  const itemToDelete = list.find(i => i.id === id);
  if (!itemToDelete) return false;

  const updatedList = list.filter(i => i.id !== id);
  master[section] = updatedList;
  saveMasterData(master);

  logActivity({
    activityType: 'DELETE',
    module: 'Master Data',
    actionDescription: `Deleted item "${itemToDelete.name}" from ${section} registry`,
    oldValue: itemToDelete
  });

  return true;
};
