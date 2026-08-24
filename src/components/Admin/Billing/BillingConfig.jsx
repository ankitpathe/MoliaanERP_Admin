import React, { useState, useEffect } from 'react';
import { Palette, FileText, FileSignature, Printer, Save, Check } from 'lucide-react';
import { logActivity } from '../../../services/activityLogger';
import { useToast } from '../../../hooks/useToast';

const STORAGE_KEY = 'erp_billing_config';

const DEFAULT_CONFIG = {
  defaultTemplate: 'CLASSIC_A4',
  thermalPaperWidth: '80MM',
  accentColor: '#2563eb',
  showLogoOnInvoice: true,
  showBankDetailsOnInvoice: true,
  showUpiQrOnInvoice: true,
  showAuthorizedSignatory: true,
  signatoryLabel: 'Authorized Signatory',
  defaultTerms: '1. Goods once sold will not be taken back without original bill.\n2. Subject to local jurisdiction.\n3. Interest @ 18% p.a. will be charged if bill is not paid within due date.',
  autoPrintAfterSave: false,
  printCopies: ['Original for Recipient', 'Duplicate for Supplier']
};

const COLOR_SWATCHES = ['#2563eb', '#10b981', '#ef4444', '#f59e0b', '#7c7a6e', '#111827'];

export default function BillingConfig() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('design');
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
      console.error('Error fetching billing config:', e);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      
      logActivity({
        activityType: 'UPDATE',
        module: 'Billing Settings',
        actionDescription: 'Updated invoice print templates and default terms.',
        newValue: config
      });

      // Sync back to invoice format template configs in local storage
      localStorage.setItem('erp_invoice_template', config.defaultTemplate === 'CLASSIC_A4' ? 'a4_gst' : '80mm_thermal');

      toast.showSuccess('Success', 'Billing configurations saved successfully!');
    } catch (e) {
      toast.showError('Error', 'Unable to save billing configurations.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all billing settings to standard defaults?')) {
      setConfig(DEFAULT_CONFIG);
      toast.showInfo('Reset Completed', 'Billing settings restored to factory defaults.');
    }
  };

  const tabs = [
    { id: 'design', label: 'Template & Design', icon: Palette },
    { id: 'headerfooter', label: 'Header & Footer', icon: FileText },
    { id: 'terms', label: 'Terms & Conditions', icon: FileSignature },
    { id: 'print', label: 'Print Preferences', icon: Printer }
  ];

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingBottom: '60px' }} className="billing-config-layout">
      
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
      }} className="billing-left-nav">
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

      {/* MIDDLE: Form Fields Viewport */}
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
      }} className="billing-middle-panel">
        
        {/* Design Tab */}
        {activeTab === 'design' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Template & Accent Design Settings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Default Invoice Template Format</label>
              <select
                value={config.defaultTemplate}
                onChange={(e) => setConfig(p => ({ ...p, defaultTemplate: e.target.value }))}
                style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
              >
                <option value="CLASSIC_A4">Classic A4 (Standard GST Invoice)</option>
                <option value="THERMAL_POS">Thermal POS Receipt (Roll Printer)</option>
              </select>
            </div>

            {config.defaultTemplate === 'THERMAL_POS' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', animation: 'fade-in 0.2s ease' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Thermal Receipt Paper Width</label>
                <select
                  value={config.thermalPaperWidth}
                  onChange={(e) => setConfig(p => ({ ...p, thermalPaperWidth: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
                >
                  <option value="80MM">80mm Paper Roll (Standard POS)</option>
                  <option value="58MM">58mm Paper Roll (Mini/Mobile Printer)</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Invoice Accent Color</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                {COLOR_SWATCHES.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setConfig(p => ({ ...p, accentColor: color }))}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: color,
                      border: config.accentColor === color ? '2px solid #111827' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}
                  >
                    {config.accentColor === color && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Header & Footer Tab */}
        {activeTab === 'headerfooter' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Header & Footer Visibility Rules
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.showLogoOnInvoice}
                  onChange={(e) => setConfig(p => ({ ...p, showLogoOnInvoice: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Print Brand Logo on top of A4 invoices</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.showBankDetailsOnInvoice}
                  onChange={(e) => setConfig(p => ({ ...p, showBankDetailsOnInvoice: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Print Corporate Bank Details on invoice bottom footer</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.showUpiQrOnInvoice}
                  onChange={(e) => setConfig(p => ({ ...p, showUpiQrOnInvoice: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Print UPI Payment QR Code automatically on printout</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }} className="responsive-grid">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '24px' }}>
                <input
                  type="checkbox"
                  checked={config.showAuthorizedSignatory}
                  onChange={(e) => setConfig(p => ({ ...p, showAuthorizedSignatory: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span>Include Signatory Box</span>
              </label>

              {config.showAuthorizedSignatory && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', animation: 'fade-in 0.2s ease' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Authorized Signatory Label text</label>
                  <input
                    type="text"
                    value={config.signatoryLabel}
                    onChange={(e) => setConfig(p => ({ ...p, signatoryLabel: e.target.value }))}
                    style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terms & Conditions Tab */}
        {activeTab === 'terms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Standard Invoice Terms & Conditions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>T&C Clause text (One clause per line)</label>
              <textarea
                value={config.defaultTerms}
                onChange={(e) => setConfig(p => ({ ...p, defaultTerms: e.target.value }))}
                rows={6}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  outline: 'none',
                  background: '#fafafa',
                  color: '#1f2937',
                  resize: 'none',
                  lineHeight: '1.5'
                }}
              />
            </div>
          </div>
        )}

        {/* Print Preferences Tab */}
        {activeTab === 'print' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Printing & Copy Configurations
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.autoPrintAfterSave}
                onChange={(e) => setConfig(p => ({ ...p, autoPrintAfterSave: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
              />
              <span>Trigger print dialog instantly on POS checkout save click</span>
            </label>
          </div>
        )}

        {/* Global actions bar */}
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

      {/* RIGHT: Live Visual Mockup Preview */}
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
      }} className="billing-right-preview">
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Live Mockup Preview</span>
        
        {/* Mockup Sheet Container */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
          fontFamily: 'monospace',
          fontSize: '0.65rem',
          color: '#334155'
        }}>
          {config.defaultTemplate === 'CLASSIC_A4' ? (
            // A4 Mockup
            <>
              {/* Header bar colored */}
              <div style={{ height: '4px', background: config.accentColor, borderRadius: '2px' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>Moliaan Retail</span>
                  <span>GSTIN: 23ABCDE1234F1Z5</span>
                </div>
                {config.showLogoOnInvoice && (
                  <div style={{ width: '28px', height: '28px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '0.5rem', fontWeight: 'bold', color: '#64748b' }}>LOGO</div>
                )}
              </div>

              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 700 }}>TAX INVOICE</span>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                  <span>Item</span>
                  <span>Total</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Parle-G Biscuit 100g</span>
                  <span>₹50.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fortune Refined Oil 1L</span>
                  <span>₹420.00</span>
                </div>
              </div>

              {/* Bank Details & QR */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                {config.showBankDetailsOnInvoice && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontWeight: 'bold' }}>Bank Details:</span>
                    <span>SBI - 330099887711 (IFSC: SBIN0000355)</span>
                  </div>
                )}
                
                {config.showUpiQrOnInvoice && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#000', borderRadius: '2px', flexShrink: 0 }} />
                    <span>Scan & Pay via UPI QR</span>
                  </div>
                )}

                <div style={{ fontSize: '0.55rem', color: '#64748b', whiteSpace: 'pre-line', borderTop: '1px dashed #cbd5e1', paddingTop: '4px' }}>
                  {config.defaultTerms}
                </div>

                {config.showAuthorizedSignatory && (
                  <div style={{ alignSelf: 'flex-end', borderTop: '1px solid #94a3b8', width: '80px', textAlign: 'center', paddingSelf: '2px', fontSize: '0.55rem', marginTop: '6px' }}>
                    {config.signatoryLabel}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Thermal Receipt Mockup
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.6rem' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                <span>*** MOLIAAN RETAIL ***</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bill: INV/1001</span>
                <span>Date: 24/08/2026</span>
              </div>
              <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Parle-G 100g x 5</span>
                  <span>₹50.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fortune Oil 1L x 3</span>
                  <span>₹420.00</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>TOTAL:</span>
                <span>₹470.00</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.5rem', whiteSpace: 'pre-line' }}>
                {config.defaultTerms}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .billing-config-layout {
            flex-direction: column !important;
          }
          .billing-left-nav {
            width: 100% !important;
          }
          .billing-right-preview {
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
