import React, { useState, useEffect } from 'react';
import { Tag, Bookmark, Ruler, Wallet, Landmark } from 'lucide-react';
import { getMasterData } from '../../../services/masterDataService';

import CategoriesTab from './CategoriesTab';
import BrandsTab from './BrandsTab';
import UnitsTab from './UnitsTab';
import PaymentMethodsTab from './PaymentMethodsTab';
import ExpenseCategoriesTab from './ExpenseCategoriesTab';

export default function MasterDataManagement() {
  const [activeTab, setActiveTab] = useState('categories');
  const [masterData, setMasterData] = useState(null);

  const loadData = () => {
    setMasterData(getMasterData());
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs = [
    { id: 'categories', label: 'Product Categories', icon: Tag },
    { id: 'brands', label: 'Product Brands', icon: Bookmark },
    { id: 'units', label: 'Measurement Units', icon: Ruler },
    { id: 'paymentMethods', label: 'Payment Modes', icon: Wallet },
    { id: 'expenseCategories', label: 'Expense Heads', icon: Landmark }
  ];

  if (!masterData) return null;

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingBottom: '60px' }} className="master-config-layout">
      
      {/* LEFT PANEL: Nav Tabs */}
      <div style={{
        width: '240px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: '#ffffff',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        alignSelf: 'flex-start'
      }} className="master-left-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? '#f5ebe1' : 'transparent',
                color: activeTab === tab.id ? '#7c7a6e' : '#4b5563',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RIGHT PANEL: Active Tab Component Container */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minWidth: '320px'
      }} className="master-right-panel">
        
        {activeTab === 'categories' && (
          <CategoriesTab 
            categories={masterData.categories || []} 
            onRefresh={loadData} 
          />
        )}

        {activeTab === 'brands' && (
          <BrandsTab 
            brands={masterData.brands || []} 
            onRefresh={loadData} 
          />
        )}

        {activeTab === 'units' && (
          <UnitsTab 
            units={masterData.units || []} 
            onRefresh={loadData} 
          />
        )}

        {activeTab === 'paymentMethods' && (
          <PaymentMethodsTab 
            paymentMethods={masterData.paymentMethods || []} 
            onRefresh={loadData} 
          />
        )}

        {activeTab === 'expenseCategories' && (
          <ExpenseCategoriesTab 
            expenseCategories={masterData.expenseCategories || []} 
            onRefresh={loadData} 
          />
        )}

      </div>

      <style>{`
        @media (max-width: 1023px) {
          .master-config-layout {
            flex-direction: column !important;
          }
          .master-left-nav {
            width: 100% !important;
          }
          .master-right-panel {
            width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
}
