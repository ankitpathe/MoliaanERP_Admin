import React, { useState, useEffect } from 'react';

// Import sub-components
import DashboardStats from './DashboardStats';
import SalesOverview from './SalesOverview';
import InventoryOverview from './InventoryOverview';
import RecentSales from './RecentSales';
import RecentActivity from './RecentActivity';
import CustomerSupplierOverview from './CustomerSupplierOverview';
import ExpenseOverview from './ExpenseOverview';
import GSTSummary from './GSTSummary';
import QuickActions from './QuickActions';
import SystemHealth from './SystemHealth';
import NotificationsPanel from './NotificationsPanel';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEmployees: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalExpenses: 0,
    salesCount: 0,
    lowStockCount: 0,
    sales: [],
    products: [],
    expenses: [],
    logs: [],
    storageUsed: '0 KB',
    storagePercent: 0
  });

  useEffect(() => {
    // Simulate telemetry loading state
    const timer = setTimeout(() => {
      loadData();
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const loadData = () => {
    try {
      // 1. Users state
      const hasSession = localStorage.getItem('erp_user_session');
      const totalUsers = hasSession ? 1 : 0;
      const activeUsers = hasSession ? 1 : 0;

      // 2. Employees state (Count fallback)
      const empData = localStorage.getItem('erp_employees');
      const employees = empData ? JSON.parse(empData) : [
        { id: 'EMP001' }, { id: 'EMP002' }, { id: 'EMP003' }, { id: 'EMP004' }
      ];

      // 3. Customers
      const customers = JSON.parse(localStorage.getItem('erp_customers') || '[]');

      // 4. Suppliers
      const suppliers = JSON.parse(localStorage.getItem('erp_suppliers') || '[]');

      // 5. Products (Inventory)
      const products = JSON.parse(localStorage.getItem('erp_products') || '[]');
      const lowStockCount = products.filter(p => Number(p.stock) <= Number(p.minStock) || Number(p.stock) === 0).length;

      // 6. Sales
      const sales = JSON.parse(localStorage.getItem('erp_sales') || '[]');
      const totalSalesAmt = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

      // 7. Expenses
      const expenses = JSON.parse(localStorage.getItem('erp_expenses') || '[]');
      const totalExpensesAmt = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      // 8. Logs
      const logs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');

      // 9. Storage telemetry
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalBytes += (localStorage.getItem(key) || '').length * 2;
        }
      }
      const kbUsed = (totalBytes / 1024).toFixed(2);
      const percentUsed = Math.min((totalBytes / (5 * 1024 * 1024)) * 100, 100);

      setDashboardData({
        totalUsers: totalUsers || 1,
        activeUsers: activeUsers || 1,
        totalEmployees: employees.length,
        totalCustomers: customers.length,
        totalSuppliers: suppliers.length,
        totalProducts: products.length,
        totalSales: totalSalesAmt,
        totalExpenses: totalExpensesAmt,
        salesCount: sales.length,
        lowStockCount,
        sales,
        products,
        expenses,
        logs,
        storageUsed: `${kbUsed} KB`,
        storagePercent: percentUsed
      });
    } catch (e) {
      console.error('Error fetching dashboard states:', e);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '400px', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid #f3f4f6',
          borderTopColor: '#7c7a6e',
          animation: 'spin 1s infinite linear'
        }} />
        <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>Gathering system telemetry...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Executive Console
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          Overview of business performance, operations, and system health status.
        </span>
      </div>

      {/* 2. Primary KPI Cards */}
      <DashboardStats data={dashboardData} />

      {/* 3. Main Split Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }} className="split-grid">
        
        {/* Left Side Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Sales Performance & Mini chart */}
          <SalesOverview sales={dashboardData.sales} />
          
          {/* Quick Actions Panel */}
          <QuickActions />

          {/* Recent Sales Table */}
          <RecentSales sales={dashboardData.sales} />

        </div>

        {/* Right Side Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Inventory Overview */}
          <InventoryOverview products={dashboardData.products} />
          
          {/* Notifications Panel */}
          <NotificationsPanel lowStockCount={dashboardData.lowStockCount} />

          {/* Business Contacts summary */}
          <CustomerSupplierOverview 
            customersCount={dashboardData.totalCustomers}
            suppliersCount={dashboardData.totalSuppliers}
          />

          {/* Cash Outflow overview */}
          <ExpenseOverview expenses={dashboardData.expenses} />

          {/* GST Summary */}
          <GSTSummary sales={dashboardData.sales} />

          {/* System Diagnostics */}
          <SystemHealth 
            storageUsed={dashboardData.storageUsed}
            storagePercent={dashboardData.storagePercent}
            logsCount={dashboardData.logs.length}
          />

          {/* Audit Logs */}
          <RecentActivity logs={dashboardData.logs} />

        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
