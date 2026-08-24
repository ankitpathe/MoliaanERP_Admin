import React, { useState, useEffect } from 'react';
import { ShieldAlert, Barcode, Landmark, RefreshCw, Settings, Save, AlertTriangle } from 'lucide-react';
import { logActivity } from '../../../services/activityLogger';
import { useToast } from '../../../hooks/useToast';

const STORAGE_KEY = 'erp_inventory_config';

const DEFAULT_CONFIG = {
  defaultLowStockThreshold: 10,
  defaultOutOfStockThreshold: 0,
  expiryAlertWindowDays: 30,
  autoGenerateSku: true,
  skuPrefix: 'PRD',
  skuSeparator: '-',
  nextSkuNumber: 10001,
  defaultBarcodeStandard: 'CODE128',
  defaultMeasurementUnit: 'PCS',
  requireAdjustmentReason: true,
  allowNegativeStockAdjustment: false,
  inventoryValuationMethod: 'FIFO',
  enableBatchTracking: true
};

export default function InventoryConfig() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('alerts');
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
      console.error('Error fetching inventory config:', e);
    }
  }, []);

  const generateSkuPreview = () => {
    return `${config.skuPrefix}${config.skuSeparator}${config.nextSkuNumber}`;
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      
      logActivity({
        activityType: 'UPDATE',
        module: 'Inventory Settings',
        actionDescription: 'Updated global inventory stock thresholds and SKU rules.',
        newValue: config
      });

      toast.showSuccess('Success', 'Inventory configurations saved successfully!');
    } catch (e) {
      toast.showError('Error', 'Unable to save inventory configurations.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all inventory settings to standard default parameters?')) {
      setConfig(DEFAULT_CONFIG);
      toast.showInfo('Reset Completed', 'Inventory settings restored to factory defaults.');
    }
  };

  const tabs = [
    { id: 'alerts', label: 'Stock Alerts', icon: ShieldAlert },
    { id: 'sku', label: 'SKU & Barcode', icon: Barcode },
    { id: 'units', label: 'Unit Defaults', icon: Landmark },
    { id: 'adjustments', label: 'Adjustment Rules', icon: RefreshCw },
    { id: 'valuation', label: 'Valuation Method', icon: Settings }
  ];

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingBottom: '60px' }} className="inventory-config-layout">
      
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
      }} className="inventory-config-left">
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
        
        {/* Render Stock Alerts tab */}
        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Stock Limit & Expiry Alert Thresholds
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Global Low Stock Limit Threshold</label>
                <input
                  type="number"
                  value={config.defaultLowStockThreshold}
                  onChange={(e) => setConfig(p => ({ ...p, defaultLowStockThreshold: parseInt(e.target.value) || 0 }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Out of Stock Limit Threshold</label>
                <input
                  type="number"
                  value={config.defaultOutOfStockThreshold}
                  onChange={(e) => setConfig(p => ({ ...p, defaultOutOfStockThreshold: parseInt(e.target.value) || 0 }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '50%' }} className="full-width-mobile">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Batch Expiry Alert Alert days</label>
              <input
                type="number"
                value={config.expiryAlertWindowDays}
                onChange={(e) => setConfig(p => ({ ...p, expiryAlertWindowDays: parseInt(e.target.value) || 0 }))}
                style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
              />
              <span style={{ fontSize: '0.725rem', color: '#9ca3af' }}>Generate warning alerts X days before stock reaches its expiration date.</span>
            </div>
          </div>
        )}

        {/* SKU & Barcode tab */}
        {activeTab === 'sku' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Auto SKU Generator & Barcode standard defaults
            </h3>

            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>SKU Format Preview</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#047857', marginTop: '6px', fontFamily: 'monospace' }}>
                {generateSkuPreview()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>SKU Prefix</label>
                <input
                  type="text"
                  value={config.skuPrefix}
                  onChange={(e) => setConfig(p => ({ ...p, skuPrefix: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Separator</label>
                <input
                  type="text"
                  value={config.skuSeparator}
                  onChange={(e) => setConfig(p => ({ ...p, skuSeparator: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Next SKU Sequence Number</label>
                <input
                  type="number"
                  value={config.nextSkuNumber}
                  onChange={(e) => setConfig(p => ({ ...p, nextSkuNumber: parseInt(e.target.value) || 0 }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Default Barcode standard</label>
                <select
                  value={config.defaultBarcodeStandard}
                  onChange={(e) => setConfig(p => ({ ...p, defaultBarcodeStandard: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
                >
                  <option value="CODE128">Code 128 (Alpha-numeric)</option>
                  <option value="EAN13">EAN-13 (Standard Retail)</option>
                  <option value="UPCA">UPC-A (North American standard)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Unit Defaults tab */}
        {activeTab === 'units' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Corporate Inventory Measurement units
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Default UoM (Unit of Measure)</label>
                <select
                  value={config.defaultMeasurementUnit}
                  onChange={(e) => setConfig(p => ({ ...p, defaultMeasurementUnit: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
                >
                  <option value="PCS">Pieces (Pcs)</option>
                  <option value="KG">Kilograms (Kg)</option>
                  <option value="BOX">Boxes (Box)</option>
                  <option value="LTR">Liters (Ltr)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Adjustment Rules tab */}
        {activeTab === 'adjustments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Stock Adjustment Auditing Rules
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.requireAdjustmentReason}
                onChange={(e) => setConfig(p => ({ ...p, requireAdjustmentReason: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
              />
              <span>Require mandatory explanation reason code for inventory write-offs, loss, or damages</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '6px' }}>
              <input
                type="checkbox"
                checked={config.allowNegativeStockAdjustment}
                onChange={(e) => setConfig(p => ({ ...p, allowNegativeStockAdjustment: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
              />
              <span>Allow manual adjustment to reduce stock count to negative values</span>
            </label>
          </div>
        )}

        {/* Valuation Method tab */}
        {activeTab === 'valuation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Inventory Costing Valuation rules
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Inventory Valuation Method</label>
                <select
                  value={config.inventoryValuationMethod}
                  onChange={(e) => setConfig(p => ({ ...p, inventoryValuationMethod: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
                >
                  <option value="FIFO">FIFO (First-In, First-Out)</option>
                  <option value="AVG">Average Costing Method (AVCO)</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '24px' }}>
                <input
                  type="checkbox"
                  checked={config.enableBatchTracking}
                  onChange={(e) => setConfig(p => ({ ...p, enableBatchTracking: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Enable Batch & Manufacture Lot tracking on product inventory registries</span>
              </label>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '8px' }}>
              <AlertTriangle size={18} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', display: 'block' }}>Costing Accuracy Warning</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
                  If manual adjustments override inventory values or if negative sales are allowed, costing calculations under the selected {config.inventoryValuationMethod} valuation model may lose bookkeeping alignment.
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
          .inventory-config-layout {
            flex-direction: column !important;
          }
          .inventory-config-left {
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
