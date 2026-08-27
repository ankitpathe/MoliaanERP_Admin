import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Camera, Mail, Phone, Lock, Eye, EyeOff, Smartphone, Laptop, MapPin, Clock, LogOut, ShieldCheck, User, Download, Upload, Copy } from 'lucide-react';
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Toggle from '../../../components/ui/Toggle';
import Badge from '../../../components/ui/Badge';
import SectionDivider from '../../../components/ui/SectionDivider';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const DEFAULT_PROFILE = {
  name: "Ankit Pathe",
  email: "admin@moliaan.com",
  phone: "9876543210",
  role: "Super Administrator",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  location: "Chhindwara, MP",
  twoFactorAuth: false,
  lastLogin: new Date().toISOString()
};

export default function Profile() {
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  // Profile state
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Show/Hide password toggle states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Activities logs list state
  const [activities, setActivities] = useState([]);

  // Load from LocalStorage
  useEffect(() => {
    const raw = localStorage.getItem('erp_admin_profile');
    if (raw) {
      try {
        setProfile(JSON.parse(raw));
      } catch (e) {
        setProfile(DEFAULT_PROFILE);
      }
    } else {
      localStorage.setItem('erp_admin_profile', JSON.stringify(DEFAULT_PROFILE));
      setProfile(DEFAULT_PROFILE);
    }

    // Load recent activity logs
    const rawLogs = localStorage.getItem('erp_activity_logs');
    if (rawLogs) {
      try {
        const parsed = JSON.parse(rawLogs);
        const filtered = parsed
          .slice(0, 6)
          .map(l => ({
            text: `${l.actionDescription || l.action} (${l.module || 'System'})`,
            time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Just now'
          }));
        setActivities(filtered);
      } catch (e) {
        setActivities([]);
      }
    }
  }, []);

  const saveProfileState = (updated) => {
    localStorage.setItem('erp_admin_profile', JSON.stringify(updated));
    setProfile(updated);
    // Dispatch custom event to notify AdminHeader.jsx
    window.dispatchEvent(new Event('admin_profile_updated'));
  };

  // Submit Profile Edits
  const handleSaveInfo = (e) => {
    e.preventDefault();
    setIsEditing(false);
    saveProfileState(profile);

    const rawLogs = localStorage.getItem('erp_activity_logs') || '[]';
    let currentLogs = [];
    try { currentLogs = JSON.parse(rawLogs); } catch(e) {}
    const newLog = {
      id: "LOG-" + Date.now().toString().slice(-4),
      timestamp: new Date().toISOString(),
      actor: profile.name,
      role: profile.role,
      ipAddress: "192.168.1.102",
      action: "ADMIN_PROFILE_UPDATED",
      category: "SECURITY",
      resource: "Administrator Settings",
      status: "SUCCESS",
      details: { updatedFields: ['name', 'email', 'phone', 'location'] }
    };
    localStorage.setItem('erp_activity_logs', JSON.stringify([newLog, ...currentLogs]));

    toast.showSuccess('Profile Saved', 'Personal information saved successfully.');
  };

  // Cancel edits
  const handleCancelEdit = () => {
    setIsEditing(false);
    const raw = localStorage.getItem('erp_admin_profile');
    if (raw) setProfile(JSON.parse(raw));
  };

  // Update Password Submit
  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.showError('Validation Error', 'Please input current password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.showError('Password Too Short', 'New password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.showError('Matching Error', 'New password confirmation does not match.');
      return;
    }

    toast.showSuccess('Security Saved', 'Security credentials updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    const rawLogs = localStorage.getItem('erp_activity_logs') || '[]';
    let currentLogs = [];
    try { currentLogs = JSON.parse(rawLogs); } catch(e) {}
    const newLog = {
      id: "LOG-" + Date.now().toString().slice(-4),
      timestamp: new Date().toISOString(),
      actor: profile.name,
      role: profile.role,
      ipAddress: "192.168.1.102",
      action: "PASSWORD_UPDATED",
      category: "SECURITY",
      resource: "Admin Account Lock credentials",
      status: "SUCCESS",
      details: { result: "Success" }
    };
    localStorage.setItem('erp_activity_logs', JSON.stringify([newLog, ...currentLogs]));
  };

  // Database Backup (JSON Export)
  const handleExportBackup = () => {
    try {
      const dbBackup = {
        erp_users: JSON.parse(localStorage.getItem('erp_users') || '[]'),
        erp_stocks: JSON.parse(localStorage.getItem('erp_stocks') || '[]'),
        erp_invoices: JSON.parse(localStorage.getItem('erp_invoices') || '[]'),
        erp_admin_counters: JSON.parse(localStorage.getItem('erp_admin_counters') || '[]'),
        erp_admin_ads: JSON.parse(localStorage.getItem('erp_admin_ads') || '[]'),
        erp_activity_logs: JSON.parse(localStorage.getItem('erp_activity_logs') || '[]'),
        erp_admin_subscriptions: JSON.parse(localStorage.getItem('erp_admin_subscriptions') || '[]'),
        erp_admin_profile: JSON.parse(localStorage.getItem('erp_admin_profile') || '{}')
      };

      const jsonString = JSON.stringify(dbBackup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Moliaan_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.showSuccess('Backup Complete', 'Database snapshot exported successfully.');
    } catch (e) {
      toast.showError('Backup Error', 'Failed to generate JSON backup snapshot.');
    }
  };

  // Database Restore (JSON Import)
  const handleRestoreBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Basic validation check
        const requiredKeys = ['erp_users', 'erp_stocks', 'erp_invoices'];
        const hasRequired = requiredKeys.every(k => parsed.hasOwnProperty(k));
        
        if (!hasRequired) {
          toast.showError('Invalid Backup File', 'JSON snapshot does not contain core ERP databases.');
          return;
        }

        // Write to local storage
        Object.keys(parsed).forEach(key => {
          localStorage.setItem(key, JSON.stringify(parsed[key]));
        });

        toast.showSuccess('Database Restored', 'Database backup imported successfully. Reloading platform...');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        toast.showError('Import Error', 'Failed to parse JSON file or invalid schema.');
      }
    };
    reader.readAsText(file);
  };

  // Logout from all devices
  const handleLogOutAll = () => {
    setIsConfirmLogoutOpen(true);
  };

  const handleConfirmLogoutAll = () => {
    toast.showInfo('Logging Out...', 'Terminating active login tokens.');
    
    logActivity({
      activityType: 'SECURITY_ALERT',
      module: 'Security & Auth',
      actionDescription: 'Executed log out from all devices command.'
    });

    setIsConfirmLogoutOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // 2FA Toggle
  const handleToggle2FA = (val) => {
    const updated = { ...profile, twoFactorAuth: val };
    saveProfileState(updated);
    toast.showSuccess('2FA Settings Saved', val ? 'Two-factor Authentication enabled.' : 'Two-factor Authentication disabled.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Profile"
        title="Account Configuration"
        subtitle="Manage your identity settings, password updates, and system data snapshots."
      />

      {/* 1. Profile Summary Card */}
      <Card style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ position: 'relative', width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #f3f4f6', background: '#f9fafb' }}>
            <img 
              src={profile.avatarUrl} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>{profile.name}</span>
              <Badge variant="success">{profile.role}</Badge>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={12} /> {profile.email}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Location: {profile.location}</span>
          </div>

        </div>

        {!isEditing && (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile Details</Button>
        )}
      </Card>

      {/* Backup and Restore Utilities */}
      <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
            System Database Snapshot & Recovery
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Backup all database logs, counters, inventories, and local configurations.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="purple" onClick={handleExportBackup} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Export Database Backup (JSON)
          </Button>

          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#374151',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Upload size={14} /> Restore Database from JSON
            <input type="file" onChange={handleRestoreBackup} accept=".json" style={{ display: 'none' }} />
          </label>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="profile-cols">
        
        {/* Left Column Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 2. Personal Information */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Personal Information
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Primary administrator profile identifiers.</span>
            </div>

            <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-cols">
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Full Name</span>
                  <Input 
                    type="text" 
                    value={profile.name} 
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing} 
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Email Address</span>
                  <Input 
                    type="email" 
                    value={profile.email} 
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing} 
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Phone Number</span>
                  <Input 
                    type="text" 
                    value={profile.phone} 
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing} 
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Location</span>
                  <Input 
                    type="text" 
                    value={profile.location} 
                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing} 
                    required 
                  />
                </div>

              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <Button variant="secondary" onClick={handleCancelEdit} type="button">Cancel</Button>
                  <Button variant="purple" type="submit">Save Profile</Button>
                </div>
              )}
            </form>
          </Card>

          {/* Recent Security Activities */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Recent Security Activities
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Timeline of administrative logins and configurations.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activities.map((act, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.75rem' }}>
                  <div style={{ marginTop: '2px', width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{act.text}</span>
                    <span style={{ fontSize: '0.675rem', color: '#9ca3af' }}>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Column Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Security & Credentials */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Security Settings
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Change account password credentials.</span>
            </div>

            {/* Change Password */}
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#4b5563' }}>Current Password</span>
                <div style={{ position: 'relative' }}>
                  <Input 
                    type={showCurrent ? "text" : "password"} 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    style={{ paddingRight: '36px' }}
                    required 
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '10px', top: '10px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#4b5563' }}>New Password</span>
                <div style={{ position: 'relative' }}>
                  <Input 
                    type={showNew ? "text" : "password"} 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    style={{ paddingRight: '36px' }}
                    required 
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '10px', top: '10px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#4b5563' }}>Confirm New Password</span>
                <div style={{ position: 'relative' }}>
                  <Input 
                    type={showConfirm ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    style={{ paddingRight: '36px' }}
                    required 
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '10px', top: '10px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <Button variant="secondary" type="submit" style={{ width: 'fit-content', marginTop: '4px' }}>Update Password</Button>

            </form>

            <SectionDivider />

            {/* 2FA lock */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>Two-Factor Authentication (2FA)</span>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Add extra verification checks on administrator logins.</span>
              </div>
              <Toggle checked={profile.twoFactorAuth} onChange={handleToggle2FA} />
            </div>

            <SectionDivider />

            {/* Active Sessions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Active login sessions</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Laptop size={15} style={{ color: '#10b981' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 650 }}>Chrome on Windows 11</span>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Chhindwara (192.168.1.102) • Active Now</span>
                    </div>
                  </div>
                  <Badge variant="success">Active Now</Badge>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Smartphone size={15} style={{ color: '#6b7280' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 650 }}>Mobile POS Terminal</span>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Ground Floor Counter • 2 hrs ago</span>
                    </div>
                  </div>
                  <Badge variant="info">Active</Badge>
                </div>

              </div>
            </div>

          </Card>

          {/* Danger Zone */}
          <div style={{ border: '1px solid #fee2e2', background: 'rgba(254, 226, 226, 0.15)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Danger Zone: Account Actions
              </span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>
                Executing this command terminates current session tokens on other machines.
              </span>
            </div>
            <button
              onClick={handleLogOutAll}
              style={{
                width: 'fit-content',
                padding: '8px 16px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
              }}
            >
              Log out from all devices
            </button>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes greenPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            transform: scale(1.4);
            opacity: 0.6;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          }
        }
        @media (max-width: 1023px) {
          .profile-cols {
            grid-template-columns: 1fr !important;
          }
          .form-cols {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Custom styled confirmation dialog */}
      <ConfirmDialog
        isOpen={isConfirmLogoutOpen}
        title="Log Out From All Devices"
        message="Are you sure you want to disconnect all active browser sessions? You will need to log back in to access Moliaan ERP."
        confirmText="Log Out All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmLogoutAll}
        onCancel={() => setIsConfirmLogoutOpen(false)}
      />

    </div>
  );
}
