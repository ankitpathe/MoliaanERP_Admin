import React, { useState, useEffect } from 'react';
import { FileText, Percent, CreditCard, RefreshCw, Printer, Shield } from 'lucide-react';
import { logActivity } from '../../../services/activityLogger';
import { useToast } from '../../../hooks/useToast';

import InvoiceSequenceTab from './InvoiceSequenceTab';
import DiscountPolicyTab from './DiscountPolicyTab';
import PaymentCreditTab from './PaymentCreditTab';
import ReturnPolicyTab from './ReturnPolicyTab';
import PosSettingsTab from './PosSettingsTab';

const STORAGE_KEY = 'erp_sales_config';

const DEFAULT_CONFIG = {
  invoicePrefix: 'INV',
  invoiceSeparator: '/',
  includeFinancialYear: true,
  nextInvoiceNumber: 1001,
  maxDiscountPercent: 15,
  allowItemDiscount: true,
  allowPriceOverride: false,
  allowedPaymentMethods: ['cash', 'upi'],
  defaultPaymentDueDays: 30,
  allowSalesReturn: true,
  returnWindowDays: 7,
  requireInvoiceForReturn: true,
  roundOffTotal: true,
  allowNegativeStockSale: false
};

export default function SalesConfig() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('sequence');
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setConfig(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      }
    } catch (e) {
      console.error('Error loading sales config:', e);
    }
  }, []);

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Generate sequence string preview on right side
  const generatePreview = () => {
    const currentYear = new Date().getFullYear();
    const shortYear = currentYear.toString().slice(-2);
    const nextYearShort = (currentYear + 1).toString().slice(-2);
    const fyString = config.includeFinancialYear ? `20${shortYear}-${nextYearShort}` : '';
    
    const parts = [];
    if (config.invoicePrefix) parts.push(config.invoicePrefix);
    if (fyString) parts.push(fyString);
    parts.push(config.nextInvoiceNumber);

    return parts.join(config.invoiceSeparator || '');
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      
      logActivity({
        activityType: 'UPDATE',
        module: 'Sales Settings',
        actionDescription: 'Updated corporate sales and invoicing parameters.',
        newValue: config
      });

      toast.showSuccess('Success', 'Sales configurations saved successfully!');
    } catch (e) {
      toast.showError('Error', 'Unable to save sales configurations.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all sales settings to standard defaults?')) {
      setConfig(DEFAULT_CONFIG);
      toast.showInfo('Reset Completed', 'Sales configurations restored to factory defaults.');
    }
  };

  const tabs = [
    { id: 'sequence', label: 'Invoice Sequence', icon: FileText },
    { id: 'discount', label: 'Discount Policy', icon: Percent },
    { id: 'payment', label: 'Payment & Credit', icon: CreditCard },
    { id: 'return', label: 'Return Policy', icon: RefreshCw },
    { id: 'pos', label: 'POS Settings', icon: Printer }
  ];

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingBottom: '60px' }} className="sales-config-layout">
      
      {/* LEFT: Nav Tabs */}
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
      }} className="sales-config-left">
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

      {/* MIDDLE: Form Panel Viewport */}
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
      }} className="sales-config-middle">
        
        {activeTab === 'sequence' && <InvoiceSequenceTab config={config} onChange={handleChange} />}
        {activeTab === 'discount' && <DiscountPolicyTab config={config} onChange={handleChange} />}
        {activeTab === 'payment' && <PaymentCreditTab config={config} onChange={handleChange} />}
        {activeTab === 'return' && <ReturnPolicyTab config={config} onChange={handleChange} />}
        {activeTab === 'pos' && <PosSettingsTab config={config} onChange={handleChange} />}

        {/* Global actions footer */}
        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleResetDefaults}
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: '#f3f4f6',
              color: '#4b5563',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Reset Defaults
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: '#7c7a6e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Save Configurations
          </button>
        </div>

      </div>

      {/* RIGHT: Live Preview Panel */}
      <div style={{
        width: '320px',
        background: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignSelf: 'stretch'
      }} className="sales-config-preview">
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Live Format Preview</span>
        
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontFamily: 'monospace',
          fontSize: '0.65rem',
          color: '#334155'
        }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Invoicing Rules</span>
            <Shield size={14} style={{ color: '#64748b' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: '#64748b' }}>Generated Invoice Number:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f766e' }}>{generatePreview()}</span>
          </div>

          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Max Discount limit:</span>
              <span style={{ fontWeight: 'bold' }}>{config.maxDiscountPercent}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Item Discount:</span>
              <span>{config.allowItemDiscount ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Price Override:</span>
              <span style={{ color: config.allowPriceOverride ? '#d97706' : 'inherit', fontWeight: config.allowPriceOverride ? 'bold' : 'normal' }}>{config.allowPriceOverride ? 'Allowed' : 'Blocked'}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Credit Due Days:</span>
              <span style={{ fontWeight: 'bold' }}>{config.defaultPaymentDueDays} Days</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Return Policy:</span>
              <span>{config.allowSalesReturn ? `${config.returnWindowDays} Days window` : 'No returns'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Round-off to ₹1:</span>
              <span>{config.roundOffTotal ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Negative Stock Sale:</span>
              <span style={{ color: config.allowNegativeStockSale ? '#dc2626' : 'inherit', fontWeight: config.allowNegativeStockSale ? 'bold' : 'normal' }}>{config.allowNegativeStockSale ? 'Allowed' : 'Blocked'}</span>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .sales-config-layout {
            flex-direction: column !important;
          }
          .sales-config-left {
            width: 100% !important;
          }
          .sales-config-preview {
            width: 100% !important;
          }
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
