import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Monitor, UserCheck, Cpu, Key, CheckSquare, Square, Eye, EyeOff, User, KeyRound } from 'lucide-react';
import Select from '../../ui/Select';
import Button from '../../ui/Button';

const DUMMY_MERCHANTS = [
  { id: 'M-101', name: 'Gourmet Kitchen' },
  { id: 'M-102', name: 'QuickMart Plaza' },
  { id: 'M-103', name: 'Apex Pharmacy' },
  { id: 'M-104', name: 'Organic Foods Co.' }
];

export default function AddCounterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');

  // Operator Personal Info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  // Operator Security Settings
  const [operatorUsername, setOperatorUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors State
  const [errors, setErrors] = useState({});

  const handleFullNameChange = (val) => {
    setFullName(val);
    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: null }));
    if (!id) {
      const suggested = val.toLowerCase().trim().replace(/\s+/g, '.');
      setOperatorUsername(suggested);
      if (errors.operatorUsername) setErrors(prev => ({ ...prev, operatorUsername: null }));
    }
  };

  useEffect(() => {
    if (id) {
      const existing = JSON.parse(localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters') || '[]');
      const found = existing.find(c => 
        String(c.id).toLowerCase() === String(id).toLowerCase() || 
        String(c.code).toLowerCase() === String(id).toLowerCase()
      );
      if (found) {
        setName(found.name || '');
        setCode(found.code || '');
        setLocation(found.location || '');

        if (found.operator) {
          setFullName(found.operator.fullName || '');
          setPhone(found.operator.phone || '');
          setEmail(found.operator.email || '');
          setEmployeeId(found.operator.employeeId || '');
          setOperatorUsername(found.operator.username || '');
          setPassword(found.operator.password || '');
          setConfirmPassword(found.operator.password || '');
        }
      }
    }
  }, [id]);

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Counter Name is required';
    }


    // Operator Personal Info Validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      newErrors.phone = 'Phone Number must be exactly 10 digits';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Invalid Email address format';
    }

    // Operator Security Settings Validation
    if (!operatorUsername.trim()) {
      newErrors.operatorUsername = 'Username/Login ID is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation Password is required';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.showError('Validation Error', 'Please complete the required fields.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters') || '[]');
      
      // TODO: hash password before storing when backend is added
      const operatorObj = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        employeeId: employeeId.trim(),
        username: operatorUsername.trim(),
        password: password
      };

      let updated;
      if (id) {
        updated = existing.map(c => {
          if (String(c.id).toLowerCase() === String(id).toLowerCase() || String(c.code).toLowerCase() === String(id).toLowerCase()) {
            return {
              ...c,
              name: name.trim(),
              code: code.trim(),
              location: location.trim(),
              operator: operatorObj
            };
          }
          return c;
        });

        logActivity({
          activityType: 'COUNTER_MODIFIED',
          module: 'Counters',
          actionDescription: `Updated billing terminal ${name.trim()}`
        });
        toast.showSuccess('Success', `Updated billing terminal ${name.trim()}`);
      } else {
        const newCounter = {
          id: "CTR-" + Date.now().toString().slice(-4),
          name: name.trim(),
          code: code.trim() || ("POS-" + name.toUpperCase().slice(0, 4)),
          location: location.trim() || "Main Retail Outlet",
          status: "ONLINE",
          totalBillsToday: 0,
          grossSalesToday: 0,
          lastHeartbeat: new Date().toISOString(),
          operator: operatorObj
        };
        updated = [newCounter, ...existing];

        logActivity({
          activityType: 'COUNTER_REGISTERED',
          module: 'Counters',
          actionDescription: `Registered new billing terminal ${newCounter.name}`
        });
        toast.showSuccess('Success', `Registered new billing terminal ${newCounter.name}`);
      }

      localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
      localStorage.setItem('counters', JSON.stringify(updated));
      
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
            {id ? 'Admin / Counters / Edit' : 'Admin / Counters / New'}
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            {id ? 'Edit Counter' : 'Add Counter'}
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {id ? 'Modify registration settings and terminal mapping.' : 'Register a new POS counter and assign it to a location.'}
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
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Counter Code (Optional)</span>
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


        {/* Section 4: Personal Information */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <User size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PERSONAL INFORMATION
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Full Name *</span>
              <input 
                type="text" 
                value={fullName}
                onChange={e => handleFullNameChange(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.fullName ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              {errors.fullName && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.fullName}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Phone Number *</span>
              <input 
                type="text" 
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                }}
                placeholder="e.g. 9876543210"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              {errors.phone && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.phone}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Email Address</span>
              <input 
                type="text" 
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                }}
                placeholder="e.g. cashier@example.com"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              {errors.email && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.email}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Employee ID / Staff Code</span>
              <input 
                type="text" 
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-2026-90"
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

        {/* Section 5: Security Settings */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <KeyRound size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SECURITY SETTINGS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Username / Login ID *</span>
              <input 
                type="text" 
                value={operatorUsername}
                onChange={e => {
                  setOperatorUsername(e.target.value);
                  if (errors.operatorUsername) setErrors(prev => ({ ...prev, operatorUsername: null }));
                }}
                placeholder="e.g. ramesh.sharma"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.operatorUsername ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              {errors.operatorUsername && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.operatorUsername}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>New Password *</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                  }}
                  placeholder="Min 6 characters"
                  style={{
                    padding: '10px 40px 10px 14px',
                    borderRadius: '8px',
                    border: errors.password ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff',
                    width: '100%'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.password}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Confirm Password *</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Re-enter password"
                  style={{
                    padding: '10px 40px 10px 14px',
                    borderRadius: '8px',
                    border: errors.confirmPassword ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff',
                    width: '100%'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{errors.confirmPassword}</span>}
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => {
              if (password && confirmPassword && password === confirmPassword && password.length >= 6) {
                toast.showSuccess('Credentials Set', 'Login credentials verified.');
              } else {
                toast.showError('Verification Failed', 'Please verify your password entries.');
              }
            }}
            style={{ alignSelf: 'flex-start', marginTop: '8px' }}
          >
            {id ? 'Update Password' : 'Set Login Credentials'}
          </Button>
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
            {id ? 'Update Counter' : 'Save Counter'}
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
