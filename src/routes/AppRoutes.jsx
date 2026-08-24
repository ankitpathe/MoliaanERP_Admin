import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Admin Shell Wrapper
import AdminShell from '../pages/admin/AdminShell';

// Admin Page Entry Points
import Dashboard from '../pages/admin/dashboard/Dashboard';
import Users from '../pages/admin/users/Users';
import AddUser from '../pages/admin/users/AddUser';
import UserDetails from '../pages/admin/users/UserDetails';
import Employees from '../pages/admin/employees/Employees';
import AddEmployee from '../pages/admin/employees/AddEmployee';
import EmployeeDetails from '../pages/admin/employees/EmployeeDetails';
import Roles from '../pages/admin/roles/Roles';
import AddRole from '../pages/admin/roles/new';
import RoleDetails from '../pages/admin/roles/RoleDetails';

// ERP Configuration Page Entry Points
import Business from '../pages/admin/business/index';
import Branches from '../pages/admin/branches/index';
import AddBranch from '../pages/admin/branches/new';
import BranchDetails from '../pages/admin/branches/BranchDetails';
import Sales from '../pages/admin/sales/index';
import Purchase from '../pages/admin/purchase/index';
import Inventory from '../pages/admin/inventory/index';
import Billing from '../pages/admin/billing/Billing';
import Tax from '../pages/admin/tax/Tax';
import MasterData from '../pages/admin/master-data/MasterData';

// Monitoring & Logging Entry Points
import ActivityLogs from '../pages/admin/activity-logs/ActivityLogs';
import Notifications from '../pages/admin/notifications/Notifications';
import Reports from '../pages/admin/reports/Reports';
import SystemHealth from '../pages/admin/system-health/SystemHealth';

// System Management Entry Points
import Backup from '../pages/admin/backup/Backup';
import SystemLogs from '../pages/admin/system-logs/SystemLogs';
import Security from '../pages/admin/security/Security';
import Communication from '../pages/admin/communication/Communication';
import Integrations from '../pages/admin/integrations/Integrations';

// Settings Entry Points
import Settings from '../pages/admin/settings/Settings';
import General from '../pages/admin/settings/General';
import Appearance from '../pages/admin/settings/Appearance';
import NotificationsSettings from '../pages/admin/settings/Notifications';
import Localization from '../pages/admin/settings/Localization';
import System from '../pages/admin/settings/System';

// Profile Entry Point
import Profile from '../pages/admin/profile/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root Redirects */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Admin Shell Nested Routes */}
      <Route path="/admin" element={<AdminShell />}>
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Management Group */}
        <Route path="users" element={<Users />} />
        <Route path="users/new" element={<AddUser />} />
        <Route path="users/:id" element={<UserDetails />} />
        
        <Route path="employees" element={<Employees />} />
        <Route path="employees/new" element={<AddEmployee />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        
        <Route path="roles" element={<Roles />} />
        <Route path="roles/new" element={<AddRole />} />
        <Route path="roles/:id" element={<RoleDetails />} />
        
        {/* ERP Configuration Group */}
        <Route path="business" element={<Business />} />
        
        <Route path="branches" element={<Branches />} />
        <Route path="branches/new" element={<AddBranch />} />
        <Route path="branches/:id" element={<BranchDetails />} />
        
        <Route path="sales" element={<Sales />} />
        <Route path="purchase" element={<Purchase />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="billing" element={<Billing />} />
        <Route path="tax" element={<Tax />} />
        <Route path="master-data" element={<MasterData />} />
        
        {/* Monitoring & Logs Group */}
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="system-health" element={<SystemHealth />} />
        
        {/* System Group */}
        <Route path="backup" element={<Backup />} />
        <Route path="system-logs" element={<SystemLogs />} />
        <Route path="security" element={<Security />} />
        <Route path="communication" element={<Communication />} />
        <Route path="integrations" element={<Integrations />} />
        
        <Route path="settings" element={<Settings />}>
          <Route index element={<Navigate to="general" replace />} />
          <Route path="general" element={<General />} />
          <Route path="appearance" element={<Appearance />} />
          <Route path="notifications" element={<NotificationsSettings />} />
          <Route path="localization" element={<Localization />} />
          <Route path="system" element={<System />} />
        </Route>
        
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
