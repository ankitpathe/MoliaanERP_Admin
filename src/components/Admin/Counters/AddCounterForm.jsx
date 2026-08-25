import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Monitor, UserCheck, Cpu, Key, CheckSquare, Square } from 'lucide-react';

const DUMMY_MERCHANTS = [
  { id: 'M-101', name: 'Gourmet Kitchen' },
  { id: 'M-102', name: 'QuickMart Plaza' },
  { id: 'M-103', name: 'Apex Pharmacy' },
  { id: 'M-104', name: 'Organic Foods Co.' }
];

export default function AddCounterForm() {
  const navigate = useNavigate();
  const toast = useToast();

  // Form State
  const [name, setName] = useState('');
  const [counterId, setCounterId] = useState('');
  const [type, setType] = useState('Retail');
  const [merchantId, setMerchantId] = useState('');
  const [branch, setBranch] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [syncEndpoint, setSyncEndpoint] = useState('');
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [pin, setPin] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Lists
  const [merchants, setMerchants] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Errors State
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Determine Counter ID
    const existing = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
    const nextNum = existing.length + 1;
    const formattedId = `CTR-00${nextNum}`;
    setCounterId(formattedId);

    // Load Merchants or seed
    const storedMerchants = JSON.parse(localStorage.getItem('merchants') || '[]');
    if (storedMerchants.length === 0) {
      localStorage.setItem('merchants', JSON.stringify(DUMMY_MERCHANTS));
      setMerchants(DUMMY_MERCHANTS);
    } else {
      setMerchants(storedMerchants);
    }

    // Load Users for staff assignment
    const storedUsers = JSON.parse(localStorage.getItem('erp_users') || '[]');
    if (storedUsers.length === 0) {
      const dummyStaff = [
        { username: 'john_cashier', name: 'John Doe' },
        { username: 'sarah_billing', name: 'Sarah Connor' },
        { username: 'mike_kiosk', name: 'Mike Miller' }
      ];
      setUsersList(dummyStaff);
    } else {
      setUsersList(storedUsers.map(u => ({ username: u.username, name: u.name || u.username })));
    }
  }, []);

  const handleToggleStaff = (username) => {
    if (assignedStaff.includes(username)) {
      setAssignedStaff(prev => prev.filter(u => u !== username));
    } else {
      setAssignedStaff(prev => [...prev, username]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Counter Name is required';
    }
    if (!merchantId) {
      newErrors.merchantId = 'Please select a Merchant';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.showError('Validation Error', 'Please complete the required fields.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
      
      const newCounter = {
        id: counterId,
        name: name.trim(),
        code: counterId, // Mapped to code for list tables compatibility
        type,
        merchantId,
        branch: branch.trim() || 'General',
        deviceModel: deviceModel.trim(),
        serialNumber: serialNumber.trim(),
        syncEndpoint: syncEndpoint.trim(),
        assignedStaff,
        pin: pin.trim(),
        status: isActive ? 'Online' : 'Offline', // Online maps to active in reports
        syncStatus: 'not_synced',
        totalBillsToday: 0,
        totalSalesToday: 0,
        createdAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString()
      };

      const updated = [...existing, newCounter];
      localStorage.setItem('erp_admin_counters', JSON.stringify(updated));

      // Append to legacy 'counters' key just in case
      localStorage.setItem('counters', JSON.stringify(updated));

      logActivity({
        activityType: 'COUNTER_REGISTERED',
        module: 'Counters',
        actionDescription: `Created new POS counter "${name}" with ID "${counterId}"`
      });

      toast.showSuccess('Success', 'Counter added successfully.');
      
      setTimeout(() => {
        navigate('/admin/counters/reports');
      }, 500);

    } catch (e) {
      toast.showError('Error', 'Unable to save counter terminal.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
      
      {/* Breadcrumbs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Admin / Counters / New
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Add Counter
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Register a new POS counter and assign it to a merchant.
          </span>
        </div>

        <button 
          onClick={() => navigate('/admin/counters/reports')}
          style={{
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#4b5563',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section 1: Counter Details */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Monitor size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section 1 - Counter Details
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Counter Name *</span>
              <input 
                type="text" 
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                placeholder="e.g. Ground Floor Terminal"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              {errors.name && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.name}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Counter ID</span>
              <input 
                type="text" 
                value={counterId}
                disabled
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.85rem',
                  background: '#f3f4f6',
                  color: '#9ca3af',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Counter Type</span>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              >
                <option value="Retail">Retail</option>
                <option value="Billing">Billing</option>
                <option value="Kiosk">Kiosk</option>
                <option value="Mobile POS">Mobile POS</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Assign to Merchant */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <UserCheck size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section 2 - Assign to Merchant
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Select Merchant *</span>
              <select
                value={merchantId}
                onChange={e => {
                  setMerchantId(e.target.value);
                  if (errors.merchantId) setErrors(prev => ({ ...prev, merchantId: null }));
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.merchantId ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              >
                <option value="">-- Choose Merchant --</option>
                {merchants.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {errors.merchantId && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.merchantId}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Branch / Location</span>
              <input 
                type="text" 
                value={branch}
                onChange={e => setBranch(e.target.value)}
                placeholder="e.g. Main Outlet, Ground Floor"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
            </div>

          </div>
        </div>

        {/* Section 3: Hardware Info */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Cpu size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section 3 - Hardware Info (Optional)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Device Model</span>
              <input 
                type="text" 
                value={deviceModel}
                onChange={e => setDeviceModel(e.target.value)}
                placeholder="e.g. HP Engage One"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Serial Number</span>
              <input 
                type="text" 
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-8821094A"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Sync Endpoint / IP Address</span>
              <input 
                type="text" 
                value={syncEndpoint}
                onChange={e => setSyncEndpoint(e.target.value)}
                placeholder="e.g. 192.168.1.150"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
            </div>

          </div>
        </div>

        {/* Section 4: Access & Assignment */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Key size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section 4 - Access & Assignment
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Assign Staff (Select multiple)</span>
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {usersList.map(u => {
                  const isChecked = assignedStaff.includes(u.username);
                  return (
                    <div 
                      key={u.username}
                      onClick={() => handleToggleStaff(u.username)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: '#374151',
                        padding: '4px 6px',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {isChecked ? <CheckSquare size={16} className="text-violet-600" /> : <Square size={16} className="text-slate-400" />}
                      <span>{u.name} ({u.username})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Access PIN (4-digit numeric)</span>
              <input 
                type="text" 
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 1234"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
            </div>

          </div>
        </div>

        {/* Section 5: Status */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Status:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => setIsActive(!isActive)}>
                <div style={{
                  width: '34px',
                  height: '20px',
                  borderRadius: '99px',
                  background: isActive ? '#10b981' : '#d1d5db',
                  position: 'relative',
                  transition: 'background-color 0.2s ease'
                }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '3px',
                    left: isActive ? '17px' : '3px',
                    transition: 'left 0.2s ease'
                  }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isActive ? '#065f46' : '#991b1b' }}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: '99px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: '#f3f4f6',
              color: '#4b5563'
            }}>
              Sync Status: Not Synced Yet
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContext: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Save Counter
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/admin/counters/reports')}
            style={{
              padding: '10px 20px',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#4b5563',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Cancel
          </button>
        </div>

      </form>

    </div>
  );
}
