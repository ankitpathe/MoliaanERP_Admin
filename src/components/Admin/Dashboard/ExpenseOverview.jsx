import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

export default function ExpenseOverview({ expenses }) {
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const todayExpenses = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const monthlyExpenses = expenses
    .filter(e => new Date(e.date) >= oneMonthAgo)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} style={{ color: '#dc2626' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Business Outflow Overview</h3>
        </div>
        <button 
          onClick={() => navigate('/expenses/tracker')}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#7c7a6e',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Expense Tracker
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: "Today's Outflow", value: todayExpenses },
          { label: "This Month", value: monthlyExpenses },
          { label: "Total Expenses", value: totalExpenses }
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#fafafa', padding: '12px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '0.725rem', color: '#6b7280', display: 'block' }}>{item.label}</span>
            <strong style={{ fontSize: '1.05rem', color: '#111827', display: 'block', marginTop: '4px' }}>
              ₹{item.value.toLocaleString('en-IN')}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
