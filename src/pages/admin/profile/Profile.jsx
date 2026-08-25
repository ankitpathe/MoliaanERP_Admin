import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Camera, Mail, Phone, Lock, Eye, EyeOff, Smartphone, Laptop, MapPin, Clock, LogOut, Sun, Moon, Bell, ShieldCheck, User } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Toggle from '../../../components/ui/Toggle';
import Badge from '../../../components/ui/Badge';
import SectionDivider from '../../../components/ui/SectionDivider';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const PROFILE_KEY = 'adminProfile';

const DUMMY_ACTIVITIES = [
  { text: "Logged in from Chrome on Windows", time: "10 mins ago" },
  { text: "Updated security settings (2FA Enabled)", time: "2 hours ago" },
  { text: "Changed store default configurations", time: "Yesterday" },
  { text: "Exported CSV subscription audit report", time: "2 days ago" },
  { text: "Added POS-03 Basement Grocery Hub counter", time: "3 days ago" },
  { text: "Logged in from Firefox on MacOS", time: "5 days ago" }
];

export default function Profile() {
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  // Profile fields
  const [profile, setProfile] = useState({
    name: 'Administrator',
    email: 'admin@moliaan.com',
    phone: '9876543210',
    username: 'admin_root',
    designation: 'Moliaan ERP Platform Owner & Head of Diagnostics',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    twoFactorEnabled: false,
    theme: 'light',
    notificationPrefs: {
      syncAlerts: true,
      subRequests: true,
      pushAlerts: false
    }
  });

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
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      setProfile(JSON.parse(raw));
    } else {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }

    // Load recent activity logs or fallback to dummy entries
    const rawLogs = localStorage.getItem('erp_activity_logs');
    if (rawLogs) {
      const parsed = JSON.parse(rawLogs);
      const filtered = parsed
        .filter(l => l.userName === 'Administrator' || l.userName === 'Owner/Admin')
        .slice(0, 8)
        .map(l => ({
          text: `${l.actionDescription} (${l.module})`,
          time: new Date(l.timestamp).toLocaleTimeString()
        }));
      
      setActivities(filtered.length > 0 ? filtered : DUMMY_ACTIVITIES);
    } else {
      setActivities(DUMMY_ACTIVITIES);
    }
  }, []);

  const saveProfileState = (updated) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    setProfile(updated);
  };

  // Avatar Upload Helper
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.showError('Format Error', 'Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const updated = { ...profile, avatarUrl: event.target.result };
      saveProfileState(updated);
      toast.showSuccess('Avatar Updated', 'Circular profile avatar modified successfully.');
      
      logActivity({
        activityType: 'PROFILE_UPDATED',
        module: 'Security & Auth',
        actionDescription: 'Updated administrator profile avatar image.'
      });
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Edits
  const handleSaveInfo = (e) => {
    e.preventDefault();
    setIsEditing(false);
    saveProfileState(profile);

    logActivity({
      activityType: 'PROFILE_UPDATED',
      module: 'Security & Auth',
      actionDescription: `Updated personal information details for @${profile.username}.`
    });

    toast.showSuccess('Profile Saved', 'Personal information saved successfully.');
  };

  // Cancel edits
  const handleCancelEdit = () => {
    setIsEditing(false);
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) setProfile(JSON.parse(raw));
  };

  // Update Password Submit
  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.showError('Validation Error', 'Please input current password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.showError('Password Too Short', 'New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.showError('Matching Error', 'New password confirmation does not match.');
      return;
    }

    // Success simulation
    toast.showSuccess('Password Updated', 'Your security password changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    logActivity({
      activityType: 'SECURITY_ALERT',
      module: 'Security & Auth',
      actionDescription: 'Admin account security password changed successfully.'
    });
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

  // Inline dynamic togglers
  const handleToggle2FA = (val) => {
    const updated = { ...profile, twoFactorEnabled: val };
    saveProfileState(updated);
    toast.showSuccess('2FA Settings Saved', val ? 'Two-factor Authentication enabled.' : 'Two-factor Authentication disabled.');
  };

  const handleTogglePref = (key, val) => {
    const updated = {
      ...profile,
      notificationPrefs: {
        ...profile.notificationPrefs,
        [key]: val
      }
    };
    saveProfileState(updated);
    toast.showSuccess('Preference Saved', 'Notifications settings synced.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Profile"
        title="My Profile"
        subtitle="Manage your account details, security settings, and global interface preferences."
      />

      {/* 1. Profile Summary Card */}
      <Card style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Avatar Upload Frame */}
          <div style={{ position: 'relative', width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #f3f4f6', background: '#f9fafb' }} className="group">
            <img 
              src={profile.avatarUrl} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <label style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              opacity: 0,
              transition: 'opacity 0.2s'
            }} className="avatar-label">
              <Camera size={18} />
              <input type="file" onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>{profile.name}</span>
              <Badge variant="success">ADMIN</Badge>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={12} /> {profile.email}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Member since August 2026</span>
          </div>

        </div>

        {!isEditing && (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
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
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Primary administrator profile identifiers and designations.</span>
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Username</span>
                  <Input 
                    type="text" 
                    value={`@${profile.username}`} 
                    disabled 
                  />
                </div>

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Designation / Bio</span>
                <textarea
                  value={profile.designation}
                  onChange={e => setProfile({ ...profile, designation: e.target.value })}
                  disabled={!isEditing}
                  style={{
                    padding: '10px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    outline: 'none',
                    minHeight: '80px',
                    resize: 'vertical',
                    background: !isEditing ? '#f9fafb' : '#ffffff',
                    color: '#1f2937'
                  }}
                />
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <Button variant="secondary" onClick={handleCancelEdit} type="button">Cancel</Button>
                  <Button variant="purple" type="submit">Save Changes</Button>
                </div>
              )}
            </form>
          </Card>

          {/* 3. Preferences */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Preferences
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Global client settings and real-time alert filters.</span>
            </div>

            {/* Notification items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>Sync alert notifications</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Receive mail alerts for terminal sync conflicts.</span>
                </div>
                <Toggle 
                  checked={profile.notificationPrefs.syncAlerts} 
                  onChange={v => handleTogglePref('syncAlerts', v)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>Subscription requests</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Alerts on merchant payment validations queue.</span>
                </div>
                <Toggle 
                  checked={profile.notificationPrefs.subRequests} 
                  onChange={v => handleTogglePref('subRequests', v)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>Desktop Push Alerts</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Turn on browser notifications for gateway events.</span>
                </div>
                <Toggle 
                  checked={profile.notificationPrefs.pushAlerts} 
                  onChange={v => handleTogglePref('pushAlerts', v)} 
                />
              </div>

            </div>
          </Card>

        </div>

        {/* Right Column Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 4. Security */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Security Settings
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Adjust security hashes, 2FA locks, and monitor active sessions.</span>
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
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Add extra authentication checks on administrator logins.</span>
              </div>
              <Toggle checked={profile.twoFactorEnabled} onChange={handleToggle2FA} />
            </div>

            <SectionDivider />

            {/* Mock active sessions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Active login sessions</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Laptop size={15} style={{ color: '#4f46e5' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 650 }}>Chrome on Windows 11</span>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>New Delhi, IN • Current session</span>
                    </div>
                  </div>
                  <Badge variant="success">This Device</Badge>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Smartphone size={15} style={{ color: '#6b7280' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 650 }}>Safari on iPhone 15</span>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Mumbai, IN • 3 hours ago</span>
                    </div>
                  </div>
                  <Button variant="secondary" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Log out</Button>
                </div>

              </div>
            </div>

          </Card>

          {/* 5. Account Activity Feed */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Recent Security Activities
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Timeline of administrator logins and configurations modifications.</span>
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

          {/* 6. Danger Zone */}
          <div style={{ border: '1px solid #fee2e2', background: 'rgba(254, 226, 226, 0.15)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Danger Zone: Account Actions
              </span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>
                Executing this command terminates current authentication tokens on all connected machines.
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
        .group:hover .avatar-label {
          opacity: 1 !important;
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
