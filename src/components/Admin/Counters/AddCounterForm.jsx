import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Monitor, UserCheck, Cpu, Key, CheckSquare, Square } from 'lucide-react';
import Select from '../../ui/Select';

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
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [printerType, setPrinterType] = useState('Thermal 80mm');

  // Lists
  const [usersList, setUsersList] = useState([]);

  // Errors State
  const [errors, setErrors] = useState({});

  useEffect(() => {
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
    if (!code.trim()) {
      newErrors.code = 'Counter Code is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.showError('Validation Error', 'Please complete the required fields.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
      
      const newCounter = {
        id: "CTR-" + Date.now().toString().slice(-4),
        name: name.trim(),
        code: code.trim() || ("POS-" + name.toUpperCase().slice(0, 4)),
        location: location.trim() || "Main Retail Outlet",
        assignedStaff: assignedStaff.join(', ') || "Default Cashier",
        printerType: printerType || "Thermal 80mm ESC/POS",
        status: "ONLINE",
        totalBillsToday: 0,
        grossSalesToday: 0,
        lastHeartbeat: new Date().toISOString()
      };

      const updated = [newCounter, ...existing]; // PREPEND new counter record
      localStorage.setItem('erp_admin_counters', JSON.stringify(updated));

      logActivity({
        activityType: 'COUNTER_REGISTERED',
        module: 'Counters',
        actionDescription: `Registered new billing terminal ${newCounter.name}`
      });

      toast.showSuccess('Success', `Registered new billing terminal ${newCounter.name}`);
      
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
            Register a new POS counter and assign it to a location.
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
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Counter Code *</span>
              <input 
                type="text" 
                value={code}
                onChange={e => {
                  setCode(e.target.value);
                  if (errors.code) setErrors(prev => ({ ...prev, code: null }));
                }}
                placeholder="e.g. POS-WWE"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.code ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              {errors.code && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.code}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Location</span>
              <input 
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Main Store"
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

        {/* Section 2: Printer Setup */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Cpu size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section 2 - Hardware & Printer Setup
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Printer Type</span>
              <Select
                value={printerType}
                onChange={e => setPrinterType(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Thermal 80mm">Thermal 80mm</option>
                <option value="Thermal 58mm">Thermal 58mm</option>
                <option value="Laser A4">Laser A4</option>
                <option value="Dot Matrix">Dot Matrix</option>
              </Select>
            </div>

          </div>
        </div>

        {/* Section 3: Access & Assignment */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <UserCheck size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section 3 - Access & Assignment
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

          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
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
