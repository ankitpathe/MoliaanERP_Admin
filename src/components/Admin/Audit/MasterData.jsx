import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Layers, CreditCard, Ruler, Tag, ShieldCheck, Plus, Trash2, Edit3, RefreshCw } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';
import ConfirmDialog from '../../ui/ConfirmDialog';

const STORAGE_KEY = 'erp_master_data';

const DEFAULT_SEED_DATA = {
  categories: [
    { id: "CAT-1", name: "Groceries & Staples", hsnPrefix: "1001", color: "emerald", itemsCount: 42, status: "ACTIVE" },
    { id: "CAT-2", name: "Dairy & Frozen", hsnPrefix: "0401", color: "blue", itemsCount: 18, status: "ACTIVE" },
    { id: "CAT-3", name: "Beverages & Cold Drinks", hsnPrefix: "2202", color: "purple", itemsCount: 26, status: "ACTIVE" },
    { id: "CAT-4", name: "Snacks & Confectionery", hsnPrefix: "1905", color: "amber", itemsCount: 35, status: "ACTIVE" }
  ],
  taxSlabs: [
    { id: "TAX-0", label: "Exempted / Zero Tax", rate: 0, cgst: 0, sgst: 0, isDefault: false },
    { id: "TAX-5", label: "GST 5%", rate: 5, cgst: 2.5, sgst: 2.5, isDefault: false },
    { id: "TAX-12", label: "GST 12%", rate: 12, cgst: 6, sgst: 6, isDefault: false },
    { id: "TAX-18", label: "Standard GST 18%", rate: 18, cgst: 9, sgst: 9, isDefault: true },
    { id: "TAX-28", label: "Luxury / Sin 28%", rate: 28, cgst: 14, sgst: 14, isDefault: false }
  ],
  units: [
    { id: "UOM-1", name: "Pieces", code: "pcs", precision: 0, status: "ACTIVE" },
    { id: "UOM-2", name: "Kilograms", code: "kg", precision: 3, status: "ACTIVE" },
    { id: "UOM-3", name: "Litres", code: "ltr", precision: 2, status: "ACTIVE" },
    { id: "UOM-4", name: "Packets", code: "pkt", precision: 0, status: "ACTIVE" }
  ],
  paymentModes: [
    { id: "PAY-1", name: "Cash Counter", code: "CASH", enabled: true, feePercent: 0 },
    { id: "PAY-2", name: "UPI / Dynamic QR", code: "UPI", enabled: true, feePercent: 0 },
    { id: "PAY-3", name: "Card (POS Machine)", code: "CARD", enabled: true, feePercent: 1.2 },
    { id: "PAY-4", name: "Customer Khata (Udhar)", code: "KHATA", enabled: true, feePercent: 0 }
  ],
  settings: {
    currency: "INR (₹)",
    country: "India",
    timezone: "Asia/Kolkata (IST)",
    invoicePrefix: "INV-2026-",
    fiscalYear: "2026-2027"
  }
};

export default function MasterData() {
  const toast = useToast();

  const [master, setMaster] = useState(null);
  const [activeTab, setActiveTab] = useState('CATEGORIES'); // 'CATEGORIES' | 'TAXES' | 'UNITS' | 'PAYMENTS' | 'SETTINGS'

  // Modal configuration states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Dynamic input fields
  const [catName, setCatName] = useState('');
  const [catHsn, setCatHsn] = useState('');
  const [catColor, setCatColor] = useState('purple');

  const [taxLabel, setTaxLabel] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [taxIsDefault, setTaxIsDefault] = useState(false);

  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitPrecision, setUnitPrecision] = useState(0);

  const [payName, setPayName] = useState('');
  const [payCode, setPayCode] = useState('');
  const [payFee, setPayFee] = useState(0);

  // Settings State
  const [setPrefix, setSetPrefix] = useState('INV-2026-');
  const [setFiscal, setSetFiscal] = useState('2026-2027');
  const [setTimezone, setSetTimezone] = useState('Asia/Kolkata (IST)');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const loadData = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || JSON.parse(raw).taxSlabs === undefined) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_DATA));
      setMaster(DEFAULT_SEED_DATA);
      setSetPrefix(DEFAULT_SEED_DATA.settings.invoicePrefix);
      setSetFiscal(DEFAULT_SEED_DATA.settings.fiscalYear);
      setSetTimezone(DEFAULT_SEED_DATA.settings.timezone);
    } else {
      const parsed = JSON.parse(raw);
      // Fallback arrays to avoid runtime property reads of undefined
      parsed.categories = parsed.categories || [];
      parsed.taxSlabs = parsed.taxSlabs || [];
      parsed.units = parsed.units || [];
      parsed.paymentModes = parsed.paymentModes || [];
      parsed.settings = parsed.settings || {};

      setMaster(parsed);
      setSetPrefix(parsed.settings?.invoicePrefix || 'INV-2026-');
      setSetFiscal(parsed.settings?.fiscalYear || '2026-2027');
      setSetTimezone(parsed.settings?.timezone || 'Asia/Kolkata (IST)');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveMaster = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setMaster(updated);
  };

  const handleResetDefaults = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Baseline Catalogs',
      message: 'Are you sure you want to reset all baseline catalogs to default Indian retail settings? All custom records will be deleted.',
      onConfirm: () => {
        saveMaster(DEFAULT_SEED_DATA);
        logActivity({
          activityType: 'MASTER_RECORD_UPDATED',
          module: 'Security & Auth',
          actionDescription: 'Reset platform master data configurations to system defaults.'
        });
        toast.showInfo('Reset Complete', 'Baseline configurations loaded successfully.');
        loadData();
        setConfirmModal({ isOpen: false });
      }
    });
  };

  // Trigger Create/Edit Modal
  const triggerAddRecord = () => {
    setEditingRecord(null);
    setCatName('');
    setCatHsn('');
    setCatColor('purple');
    
    setTaxLabel('');
    setTaxRate(18);
    setTaxIsDefault(false);

    setUnitName('');
    setUnitCode('');
    setUnitPrecision(0);

    setPayName('');
    setPayCode('');
    setPayFee(0);

    setIsModalOpen(true);
  };

  // Submit Modal details
  const handleModalSubmit = (e) => {
    e.preventDefault();

    let updated = { ...master };

    if (activeTab === 'CATEGORIES') {
      if (!catName.trim() || !catHsn.trim()) {
        toast.showError('Validation Failure', 'Please input required fields.');
        return;
      }
      const newCat = {
        id: `CAT-${Date.now().toString().slice(-4)}`,
        name: catName.trim(),
        hsnPrefix: catHsn.trim(),
        color: catColor,
        itemsCount: 0,
        status: "ACTIVE"
      };
      updated.categories = [...updated.categories, newCat];
      logActivity({
        activityType: 'MASTER_RECORD_CREATED',
        module: 'Plans',
        actionDescription: `Created product category "${catName}"`
      });
      toast.showSuccess('Category Created', `Added category: ${catName}`);

    } else if (activeTab === 'TAXES') {
      if (!taxLabel.trim() || Number(taxRate) < 0) {
        toast.showError('Validation Failure', 'Please input valid tax rate details.');
        return;
      }
      const cgst = Number(taxRate) / 2;
      const newTax = {
        id: `TAX-${Date.now().toString().slice(-3)}`,
        label: taxLabel.trim(),
        rate: Number(taxRate),
        cgst,
        sgst: cgst,
        isDefault: taxIsDefault
      };
      if (taxIsDefault) {
        updated.taxSlabs = updated.taxSlabs.map(t => ({ ...t, isDefault: false }));
      }
      updated.taxSlabs = [...updated.taxSlabs, newTax];
      logActivity({
        activityType: 'MASTER_RECORD_CREATED',
        module: 'System Integrity',
        actionDescription: `Created GST Tax Slab "${taxLabel}" [Rate: ${taxRate}%]`
      });
      toast.showSuccess('Tax Slab Added', `Saved slab: ${taxLabel}`);

    } else if (activeTab === 'UNITS') {
      if (!unitName.trim() || !unitCode.trim()) {
        toast.showError('Validation Failure', 'Full name and symbol code required.');
        return;
      }
      const newUnit = {
        id: `UOM-${Date.now().toString().slice(-3)}`,
        name: unitName.trim(),
        code: unitCode.trim(),
        precision: Number(unitPrecision),
        status: "ACTIVE"
      };
      updated.units = [...updated.units, newUnit];
      logActivity({
        activityType: 'MASTER_RECORD_CREATED',
        module: 'POS Terminals',
        actionDescription: `Created unit of measure ${unitName} (${unitCode})`
      });
      toast.showSuccess('UOM Created', `Saved measurement unit: ${unitName}`);

    } else if (activeTab === 'PAYMENTS') {
      if (!payName.trim() || !payCode.trim() || Number(payFee) < 0) {
        toast.showError('Validation Failure', 'Name, code, and fee percent required.');
        return;
      }
      const newPay = {
        id: `PAY-${Date.now().toString().slice(-3)}`,
        name: payName.trim(),
        code: payCode.trim().toUpperCase(),
        enabled: true,
        feePercent: Number(payFee)
      };
      updated.paymentModes = [...updated.paymentModes, newPay];
      logActivity({
        activityType: 'MASTER_RECORD_CREATED',
        module: 'Subscriptions',
        actionDescription: `Created payment mode ${payName}`
      });
      toast.showSuccess('Payment Rail Added', `Added gateway: ${payName}`);
    }

    saveMaster(updated);
    setIsModalOpen(false);
  };

  // Delete handler
  const handleDeleteRecord = (id, tab) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Master Record',
      message: 'Are you sure you want to permanently delete this master record? This may affect linked catalog data.',
      onConfirm: () => {
        let updated = { ...master };

        if (tab === 'CATEGORIES') {
          updated.categories = updated.categories.filter(c => c.id !== id);
        } else if (tab === 'TAXES') {
          updated.taxSlabs = updated.taxSlabs.filter(t => t.id !== id);
        } else if (tab === 'UNITS') {
          updated.units = updated.units.filter(u => u.id !== id);
        } else if (tab === 'PAYMENTS') {
          updated.paymentModes = updated.paymentModes.filter(p => p.id !== id);
        }

        saveMaster(updated);
        logActivity({
          activityType: 'MASTER_RECORD_DELETED',
          module: 'Security & Auth',
          actionDescription: `Deleted master record ID ${id} from baseline catalog.`
        });
        toast.showSuccess('Record Deleted', 'Successfully removed config item.');
        setConfirmModal({ isOpen: false });
      }
    });
  };

  // Toggle statuses
  const handleToggleActive = (id, tab, current) => {
    let updated = { ...master };

    if (tab === 'CATEGORIES') {
      updated.categories = updated.categories.map(c => c.id === id ? { ...c, status: current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c);
    } else if (tab === 'UNITS') {
      updated.units = updated.units.map(u => u.id === id ? { ...u, status: current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u);
    } else if (tab === 'PAYMENTS') {
      updated.paymentModes = updated.paymentModes.map(p => p.id === id ? { ...p, enabled: !current } : p);
    }

    saveMaster(updated);
    toast.showSuccess('Status Updated', 'Config status changed successfully.');
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!setPrefix.trim() || !setFiscal.trim()) {
      toast.showError('Validation Error', 'Prefix and fiscal year required.');
      return;
    }

    const updated = {
      ...master,
      settings: {
        ...master.settings,
        invoicePrefix: setPrefix.trim(),
        fiscalYear: setFiscal.trim(),
        timezone: setTimezone
      }
    };
    saveMaster(updated);

    logActivity({
      activityType: 'MASTER_RECORD_UPDATED',
      module: 'Security & Auth',
      actionDescription: `Updated global default settings. Prefix: ${setPrefix}, Fiscal Year: ${setFiscal}`
    });

    toast.showSuccess('Settings Updated', 'Global configuration constants saved.');
  };

  if (!master) return null;

  // KPIs
  const activeCats = (master.categories || []).filter(c => c.status === 'ACTIVE').length;
  const configuredTaxes = (master.taxSlabs || []).length;
  const activeUoms = (master.units || []).filter(u => u.status === 'ACTIVE').length;
  const activePayments = (master.paymentModes || []).filter(p => p.enabled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Master Data / Controls"
        title="Global Master Data & Baseline Catalogs"
        subtitle="Configure global product taxonomies, GST tax brackets, measurement units, and payment channels."
        extra={
          <>
            <Button variant="secondary" onClick={handleResetDefaults}>
              <RefreshCw size={14} /> Reset Defaults
            </Button>
            {activeTab !== 'SETTINGS' && (
              <Button variant="purple" onClick={triggerAddRecord}>
                <Plus size={14} /> Add New Record
              </Button>
            )}
          </>
        }
      />

      {/* Top Metrics Ribbon */}
      <div className="responsive-grid-4">
        <StatCard label="Active Categories" value={`${activeCats} Categories`} icon={Tag} color="#10b981" />
        <StatCard label="Tax Slabs (GST Matrix)" value={`${configuredTaxes} Slabs`} icon={ShieldCheck} color="#3fa9f5" />
        <StatCard label="Units of Measure (UOM)" value={`${activeUoms} Units`} icon={Ruler} color="#0891b2" />
        <StatCard label="Active Payment Rails" value={`${activePayments} Modes`} icon={CreditCard} color="#f59e0b" />
      </div>

      {/* Multi-Tab Navigation Bar */}
      <Card style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { label: 'Product Categories', id: 'CATEGORIES' },
          { label: 'GST Tax Slabs', id: 'TAXES' },
          { label: 'Units of Measure (UOM)', id: 'UNITS' },
          { label: 'Payment Channels', id: 'PAYMENTS' },
          { label: 'System Defaults', id: 'SETTINGS' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(to right, #035096, #3fa9f5)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#4b5563',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </Card>

      {/* Tab Content Views */}
      <Card style={{ padding: '24px' }}>
        
        {/* Tab 1: Categories */}
        {activeTab === 'CATEGORIES' && (
          <Table headers={[{ label: 'Category ID' }, { label: 'Category Name' }, { label: 'HSN Prefix' }, { label: 'Active Items' }, { label: 'Badge color' }, { label: 'Status' }, { label: 'Actions', style: { textAlign: 'right' } }]}>
            {master.categories.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{c.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{c.name}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{c.hsnPrefix}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{c.itemsCount || 0} products</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', borderLeft: `4px solid ${c.color === 'emerald' ? '#10b981' : c.color === 'blue' ? '#3b82f6' : c.color === 'amber' ? '#f59e0b' : '#035096'}`, fontWeight: 700 }}>
                    {c.color}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : 'danger'}>{c.status}</Badge>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleToggleActive(c.id, 'CATEGORIES', c.status)}
                      style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(c.id, 'CATEGORIES')}
                      style={{ padding: '4px', background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {/* Tab 2: GST Tax Slabs */}
        {activeTab === 'TAXES' && (
          <Table headers={[{ label: 'Tax ID' }, { label: 'Slab Label' }, { label: 'Total GST (%)' }, { label: 'CGST Split (%)' }, { label: 'SGST Split (%)' }, { label: 'Default' }, { label: 'Actions', style: { textAlign: 'right' } }]}>
            {master.taxSlabs.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{t.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 650, color: '#111827' }}>{t.label}</td>
                <td style={{ padding: '12px 16px', fontWeight: 800 }}>{t.rate}%</td>
                <td style={{ padding: '12px 16px' }}>{t.cgst}%</td>
                <td style={{ padding: '12px 16px' }}>{t.sgst}%</td>
                <td style={{ padding: '12px 16px' }}>
                  {t.isDefault ? <Badge variant="success">DEFAULT</Badge> : <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.75rem' }}>No</span>}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteRecord(t.id, 'TAXES')}
                    style={{ padding: '4px', background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {/* Tab 3: Units of Measure */}
        {activeTab === 'UNITS' && (
          <Table headers={[{ label: 'UOM ID' }, { label: 'Unit Name' }, { label: 'Code symbol' }, { label: 'Decimal Precision' }, { label: 'Status' }, { label: 'Actions', style: { textAlign: 'right' } }]}>
            {master.units.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{u.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 650, color: '#111827' }}>{u.name}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace' }}>{u.code}</td>
                <td style={{ padding: '12px 16px' }}>{u.precision} decimals (e.g. {Number(0).toFixed(u.precision)} {u.code})</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status}</Badge>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleToggleActive(u.id, 'UNITS', u.status)}
                      style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(u.id, 'UNITS')}
                      style={{ padding: '4px', background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {/* Tab 4: Payment Channels */}
        {activeTab === 'PAYMENTS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {master.paymentModes.map(p => (
              <Card key={p.id} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #e5e7eb', opacity: p.enabled ? 1 : 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>{p.name}</span>
                  <Badge variant={p.enabled ? 'success' : 'danger'}>{p.enabled ? 'Enabled' : 'Disabled'}</Badge>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem', color: '#6b7280' }}>
                  <span>Code identifier: <strong style={{ fontFamily: 'monospace' }}>{p.code}</strong></span>
                  <span>Gateway surcharges: <strong>{p.feePercent}%</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleToggleActive(p.id, 'PAYMENTS', p.enabled)}
                    style={{ flex: 1, padding: '6px', fontSize: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                  >
                    {p.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(p.id, 'PAYMENTS')}
                    style={{ padding: '6px', background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 5: System Defaults Form */}
        {activeTab === 'SETTINGS' && (
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '460px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Invoice Prefix *</span>
              <Input type="text" value={setPrefix} onChange={e => setSetPrefix(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Fiscal Year *</span>
              <Input type="text" value={setFiscal} onChange={e => setSetFiscal(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>System Local Timezone</span>
              <Select value={setTimezone} onChange={e => setSetTimezone(e.target.value)}>
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="UTC (Coordinated Universal Time)">UTC (GMT 0)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="Europe/London (BST)">Europe/London (BST)</option>
              </Select>
            </div>

            <Button variant="purple" type="submit" style={{ width: 'fit-content', marginTop: '8px' }}>
              Save Configuration Settings
            </Button>
          </form>
        )}

      </Card>

      {/* Master Creator Modal */}
      {isModalOpen && (
        <>
          <div 
            onClick={() => setIsModalOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <form onSubmit={handleModalSubmit} style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                Add New {activeTab === 'CATEGORIES' ? 'Category' : activeTab === 'TAXES' ? 'Tax Slab' : activeTab === 'UNITS' ? 'UOM' : 'Payment Rail'}
              </span>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
            </div>

            {/* Categories Fields */}
            {activeTab === 'CATEGORIES' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Category Name *</span>
                  <input type="text" value={catName} onChange={e => setCatName(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>HSN Code Prefix *</span>
                  <input type="text" value={catHsn} onChange={e => setCatHsn(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Badge Color</span>
                  <Select value={catColor} onChange={e => setCatColor(e.target.value)}>
                    <option value="emerald">Emerald Green</option>
                    <option value="blue">Ocean Blue</option>
                    <option value="purple">Royal Purple</option>
                    <option value="amber">Warm Amber</option>
                  </Select>
                </div>
              </>
            )}

            {/* Taxes Fields */}
            {activeTab === 'TAXES' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Slab Label Name *</span>
                  <input type="text" placeholder="e.g. GST 18%" value={taxLabel} onChange={e => setTaxLabel(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>GST Tax Rate (%) *</span>
                  <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#4b5563', cursor: 'pointer', fontWeight: 600 }}>
                  <input type="checkbox" checked={taxIsDefault} onChange={e => setTaxIsDefault(e.target.checked)} />
                  Set as Default GST Slab
                </label>
              </>
            )}

            {/* Units Fields */}
            {activeTab === 'UNITS' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Measurement Unit Full Name *</span>
                  <input type="text" placeholder="e.g. Kilograms" value={unitName} onChange={e => setUnitName(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Unit Symbol Code *</span>
                  <input type="text" placeholder="e.g. kg" value={unitCode} onChange={e => setUnitCode(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Decimal Precision Decimal</span>
                  <Select value={unitPrecision} onChange={e => setUnitPrecision(e.target.value)}>
                    <option value="0">0 decimals (Pieces, Packets)</option>
                    <option value="1">1 decimals</option>
                    <option value="2">2 decimals (Litres)</option>
                    <option value="3">3 decimals (Weight, Grams)</option>
                  </Select>
                </div>
              </>
            )}

            {/* Payments Fields */}
            {activeTab === 'PAYMENTS' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Payment Channel Name *</span>
                  <input type="text" placeholder="e.g. Card Pay" value={payName} onChange={e => setPayName(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Gateway Code *</span>
                  <input type="text" placeholder="e.g. UPI" value={payCode} onChange={e => setPayCode(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Gateway Surcharges / Processing Fee (%)</span>
                  <input type="number" step="0.01" value={payFee} onChange={e => setPayFee(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ flex: 1, padding: '10px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#4b5563', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(to right, #035096, #3fa9f5)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Baseline Record
              </button>
            </div>

          </form>
        </>
      )}

      {/* Custom styled confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

    </div>
  );
}
