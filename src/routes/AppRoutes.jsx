import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Admin Shell Wrapper
import AdminShell from '../pages/admin/AdminShell';

// Platform Dashboard
import Dashboard from '../pages/admin/dashboard/Dashboard';

// Merchants
import Users from '../pages/admin/users/Users';

// Terminal Counters
import AddCounter from '../pages/admin/counters/new';
import CounterReports from '../pages/admin/counters/reports';

// SaaS Plans & Subscriptions
import AllPlans from '../pages/admin/plans/index';
import AddPlan from '../pages/admin/plans/new';
import SubRequests from '../pages/admin/subscriptions/requests';
import SubReports from '../pages/admin/subscriptions/reports';

// Data Sync Monitor
import SyncReport from '../pages/admin/data-sync/report';

// System Reports
import InvoicesReportPage from '../pages/admin/reports/invoices';
import StocksReportPage from '../pages/admin/reports/stocks';

// Developer Audits
import ActivityLogs from '../pages/admin/activity-logs/index';
import SystemHealth from '../pages/admin/system-health/SystemHealth';
import Backup from '../pages/admin/backup/Backup';
import MasterData from '../pages/admin/master-data/index';

// Profile Account
import Profile from '../pages/admin/profile/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root Redirects */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Admin Shell Nested Routes */}
      <Route path="/admin" element={<AdminShell />}>
        {/* Platform Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Merchants / All Users */}
        <Route path="users" element={<Users />} />
        
        {/* Terminal Counters */}
        <Route path="counters/new" element={<AddCounter />} />
        <Route path="counters/reports" element={<CounterReports />} />
        
        {/* SaaS Subscriptions */}
        <Route path="plans" element={<AllPlans />} />
        <Route path="plans/new" element={<AddPlan />} />
        <Route path="subscriptions/requests" element={<SubRequests />} />
        <Route path="subscriptions/reports" element={<SubReports />} />

        {/* Data Sync Monitor */}
        <Route path="data-sync/report" element={<SyncReport />} />

        {/* System Reports */}
        <Route path="reports/invoices" element={<InvoicesReportPage />} />
        <Route path="reports/stocks" element={<StocksReportPage />} />

        {/* Developer Audits */}
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="system-health" element={<SystemHealth />} />
        <Route path="backup" element={<Backup />} />
        <Route path="master-data" element={<MasterData />} />
        
        {/* Profile Account */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
