import React, { useState, useEffect } from 'react';
import { Settings, FileText, Percent, CreditCard, RefreshCw, Printer, Save, AlertTriangle } from 'lucide-react';
import { logActivity } from '../../../services/activityLogger';
import { useToast } from '../../../hooks/useToast';

const STORAGE_KEY = 'erp_sales_config';

const DEFAULT_CONFIG = {
  invoicePrefix: 'INV',
  invoiceSeparator: '/',
  includeFinancialYear: true,
  nextInvoiceNumber: 1001,
  maxDiscountPercent: 15,
  allowItemDiscount: true,
  allowPriceOverride: false,
  defaultPaymentDueDays: 30,
  allowSalesReturn: true,
  returnWindowDays: 7,
  requireInvoiceForReturn: true,
  autoPrintInvoice: false,
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
      console.error('Error fetching sales config:', e);
    }
  }, []);

  // Generate real-time invoice numbering sequence preview
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
    if (window.confirm('Reset all sales settings to standard default parameters?')) {
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
      
      {/* Navigation tabs */}
      <div style={{
        width: '260px',
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

      {/* Main card viewport */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Render Sequence tab */}
        {activeTab === 'sequence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Invoice Numbering Sequence Settings
            </h3>
            
            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Live Sequence Preview</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669', marginTop: '6px', fontFamily: 'monospace' }}>
                {generatePreview()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Invoice Prefix</label>
                <input
                  type="text"
                  value={config.invoicePrefix}
                  onChange={(e) => setConfig(p => ({ ...p, invoicePrefix: e.target.value }))}
                  placeholder="e.g. INV"
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Invoice Separator character</label>
                <input
                  type="text"
                  value={config.invoiceSeparator}
                  onChange={(e) => setConfig(p => ({ ...p, invoiceSeparator: e.target.value }))}
                  placeholder="e.g. / or -"
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Next Invoice Sequence Number</label>
                <input
                  type="number"
                  value={config.nextInvoiceNumber}
                  onChange={(e) => setConfig(p => ({ ...p, nextInvoiceNumber: parseInt(e.target.value) || 0 }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '24px' }}>
                <input
                  type="checkbox"
                  checked={config.includeFinancialYear}
                  onChange={(e) => setConfig(p => ({ ...p, includeFinancialYear: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Include current Financial Year token (e.g. 2026-27)</span>
              </label>
            </div>
          </div>
        )}

        {/* Discount Policy tab */}
        {activeTab === 'discount' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Corporate Discount & Editing Policies
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Maximum Global Discount limit (%)</label>
                <input
                  type="number"
                  max="100"
                  min="0"
                  value={config.maxDiscountPercent}
                  onChange={(e) => setConfig(p => ({ ...p, maxDiscountPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '24px' }}>
                <input
                  type="checkbox"
                  checked={config.allowItemDiscount}
                  onChange={(e) => setConfig(p => ({ ...p, allowItemDiscount: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Allow individual product item discounts on terminal billing screen</span>
              </label>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', display: 'block' }}>Warning: Price Override Permissions</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#b45309', cursor: 'pointer', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.allowPriceOverride}
                    onChange={(e) => setConfig(p => ({ ...p, allowPriceOverride: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
                  />
                  <span>Allow billing terminal operator to override product MRP/selling prices manually</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Payment & Credit tab */}
        {activeTab === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Payment Terms & Credit Policies
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Default Customer Credit Due (Days)</label>
                <input
                  type="number"
                  value={config.defaultPaymentDueDays}
                  onChange={(e) => setConfig(p => ({ ...p, defaultPaymentDueDays: parseInt(e.target.value) || 0 }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Return Policy tab */}
        {activeTab === 'return' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Corporate Returns & Credit Note Policies
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.allowSalesReturn}
                onChange={(e) => setConfig(p => ({ ...p, allowSalesReturn: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
              />
              <span>Enable sales returns and exchange policies on POS systems</span>
            </label>

            {config.allowSalesReturn && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', animation: 'fade-in 0.2s ease' }} className="responsive-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Sales Return Window (Days)</label>
                  <input
                    type="number"
                    value={config.returnWindowDays}
                    onChange={(e) => setConfig(p => ({ ...p, returnWindowDays: parseInt(e.target.value) || 0 }))}
                    style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '24px' }}>
                  <input
                    type="checkbox"
                    checked={config.requireInvoiceForReturn}
                    onChange={(e) => setConfig(p => ({ ...p, requireInvoiceForReturn: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                  />
                  <span>Enforce original tax invoice verification before accepting return items</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* POS Settings tab */}
        {activeTab === 'pos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Terminal Billing & Cash Register Configuration
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.autoPrintInvoice}
                  onChange={(e) => setConfig(p => ({ ...p, autoPrintInvoice: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Automatically trigger receipt printer dialog window on billing save confirmation</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.roundOffTotal}
                  onChange={(e) => setConfig(p => ({ ...p, roundOffTotal: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Automatically round off total sales receipt amounts to the nearest rupee (₹1)</span>
              </label>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '8px' }}>
              <AlertTriangle size={18} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', display: 'block' }}>Warning: Negative Inventory Operations</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#b45309', cursor: 'pointer', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.allowNegativeStockSale}
                    onChange={(e) => setConfig(p => ({ ...p, allowNegativeStockSale: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
                  />
                  <span>Allow negative inventory sales (POS terminal will allow selling items even if stock is 0)</span>
                </label>
                <span style={{ display: 'block', fontSize: '0.725rem', color: '#b45309', marginTop: '4px' }}>
                  Enabling this configuration may cause stock volume mismatches and desynchronization in tax bookkeeping ledger reports.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global form footer actions */}
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

      <style>{`
        @media (max-width: 768px) {
          .sales-config-layout {
            flex-direction: column !important;
          }
          .sales-config-left {
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
