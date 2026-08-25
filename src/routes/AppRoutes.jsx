import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Admin Shell Wrapper
import AdminShell from '../pages/Admin/AdminShell';

// Platform Dashboard
import Dashboard from '../pages/Admin/Dashboard/Index';

// Merchants
import Users from '../pages/Admin/Users/Index';

// Terminal Counters
import AddCounter from '../pages/Admin/Counters/New';
import CounterReports from '../pages/Admin/Counters/Reports';

// SaaS Plans & Subscriptions
import AllPlans from '../pages/Admin/Plans/Index';
import AddPlan from '../pages/Admin/Plans/New';
import SubRequests from '../pages/Admin/Plans/Requests';
import SubReports from '../pages/Admin/Plans/Reports';

// Data Sync Monitor
import SyncReport from '../pages/Admin/DataSync/Report';

// System Reports
import InvoicesReportPage from '../pages/Admin/Reports/Invoices';
import StocksReportPage from '../pages/Admin/Reports/Stocks';

// Developer Audits
import ActivityLogs from '../pages/Admin/Audit/ActivityLogs';
import SystemHealth from '../pages/Admin/Audit/SystemHealth';
import Backup from '../pages/Admin/Audit/Backup';
import MasterData from '../pages/Admin/Audit/MasterData';

// Profile Account
import Profile from '../pages/Admin/Profile/Profile';

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
