export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  date: string;
  time: string;
  userName: string;
  userRole: string;
  employeeId?: string;
  activityType: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'PRINT' | 'DOWNLOAD' | 'LOGIN' | 'LOGOUT' | 'PAYMENT' | 'EXPORT';
  module: string; // e.g. 'POS', 'Inventory', 'Customers', 'Settings', 'Sales History'
  pageUrl: string;
  actionDescription: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  deviceBrowser: string;
  status: 'Success' | 'Warning' | 'Failed';
}

export const logActivity = (logData: Omit<ActivityLog, 'id' | 'timestamp' | 'date' | 'time' | 'userName' | 'userRole' | 'deviceBrowser'>) => {
  try {
    const activeRole = localStorage.getItem('erp_active_role') || 'Administrator';
    const currentUser = { name: 'Administrator', role: activeRole };

    const newLog: ActivityLog = {
      id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      userName: currentUser.name || 'System User',
      userRole: currentUser.role || 'Admin',
      deviceBrowser: navigator.userAgent.includes('Chrome') ? 'Chrome / Windows' : 'Web Browser',
      ipAddress: '192.168.1.1',
      ...logData,
    };

    const existingLogs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');
    const updatedLogs = [newLog, ...existingLogs].slice(0, 5000); // Store up to 5000 logs
    localStorage.setItem('erp_activity_logs', JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
