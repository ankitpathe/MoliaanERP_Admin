import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, ArrowLeft, Trash2, Copy, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { getRoles, createRole, updateRole, deleteRole } from '../../../services/roleService';
import { useToast } from '../../../hooks/useToast';
import RoleFormModal from '../../../components/Admin/Roles/RoleFormModal';

export default function Roles() {
  const toast = useToast();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  
  // Dirty state tracker
  const [editedPermissions, setEditedPermissions] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Accordion state
  const [expandedGroups, setExpandedGroups] = useState({
    Dashboard: true,
    Users: true,
    Employees: true,
    Sales: true,
    Inventory: true
  });

  // Mobile layout state
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'details'

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  useEffect(() => {
    const list = getRoles();
    setRoles(list);
    if (list.length > 0 && !selectedRoleId) {
      setSelectedRoleId(list[0].id);
      setEditedPermissions(list[0].permissions || {});
    }
  }, []);

  const activeRole = roles.find(r => r.id === selectedRoleId);

  const refreshList = (newSelectedId) => {
    const list = getRoles();
    setRoles(list);
    setIsDirty(false);
    
    const nextSelectedId = newSelectedId || selectedRoleId || (list.length > 0 ? list[0].id : '');
    setSelectedRoleId(nextSelectedId);
    
    const nextActive = list.find(r => r.id === nextSelectedId);
    if (nextActive) {
      setEditedPermissions(nextActive.permissions || {});
    }
  };

  const handleSelectRole = (roleId) => {
    if (isDirty) {
      if (!window.confirm('Unsaved changes will be lost. Discard and proceed?')) {
        return;
      }
    }
    setSelectedRoleId(roleId);
    const target = roles.find(r => r.id === roleId);
    if (target) {
      setEditedPermissions(target.permissions || {});
    }
    setIsDirty(false);
    setMobileView('details');
  };

  // Toggle single action check
  const handleTogglePermission = (group, action) => {
    setEditedPermissions(prev => {
      const current = prev[group] || [];
      const updated = current.includes(action)
        ? current.filter(a => a !== action)
        : [...current, action];
      
      setIsDirty(true);
      return { ...prev, [group]: updated };
    });
  };

  // Enable/Disable All in a group
  const handleToggleGroupAll = (group, allActions) => {
    setEditedPermissions(prev => {
      const current = prev[group] || [];
      const isAllChecked = allActions.every(a => current.includes(a));
      const updated = isAllChecked ? [] : [...allActions];
      
      setIsDirty(true);
      return { ...prev, [group]: updated };
    });
  };

  // Save changes
  const handleSaveChanges = () => {
    if (!activeRole) return;
    try {
      updateRole(activeRole.id, { permissions: editedPermissions });
      toast.showSuccess('Success', 'Permissions saved successfully!');
      refreshList();
    } catch (e) {
      toast.showError('Error', 'Unable to save permissions.');
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (activeRole) {
      setEditedPermissions(activeRole.permissions || {});
      setIsDirty(false);
      toast.showInfo('Changes Discarded', 'Restored to last saved state.');
    }
  };

  // Create Role Submit
  const handleCreateRoleSubmit = (data) => {
    try {
      let initialPerms = {};
      if (data.copyFromId) {
        const copyFrom = roles.find(r => r.id === data.copyFromId);
        if (copyFrom) initialPerms = { ...copyFrom.permissions };
      }
      
      const newRole = createRole({
        name: data.name,
        description: data.description,
        permissions: initialPerms
      });
      toast.showSuccess('Success', `Role "${newRole.name}" created!`);
      setIsCreateModalOpen(false);
      refreshList(newRole.id);
    } catch (e) {
      toast.showError('Error', e.message);
    }
  };

  // Duplicate Role Submit
  const handleDuplicateRoleSubmit = (data) => {
    if (!activeRole) return;
    try {
      const newRole = createRole({
        name: data.name,
        description: data.description,
        permissions: { ...activeRole.permissions }
      });
      toast.showSuccess('Success', `Duplicated as "${newRole.name}"!`);
      setIsDuplicateModalOpen(false);
      refreshList(newRole.id);
    } catch (e) {
      toast.showError('Error', e.message);
    }
  };

  // Delete active role
  const handleDeleteActiveRole = () => {
    if (!activeRole) return;
    if (activeRole.userCount > 0) {
      alert('This role is assigned to users. Reassign those users before deleting this role.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the role "${activeRole.name}"?`)) {
      try {
        deleteRole(activeRole.id);
        toast.showSuccess('Success', 'Role deleted successfully!');
        
        // Pick first role
        const remaining = getRoles().filter(r => r.id !== activeRole.id);
        const nextId = remaining.length > 0 ? remaining[0].id : '';
        refreshList(nextId);
      } catch (e) {
        toast.showError('Error', e.message);
      }
    }
  };

  // Groups and possible actions
  const permissionGroups = {
    Dashboard: ['View'],
    Users: ['View', 'Create', 'Edit', 'Delete'],
    Employees: ['View', 'Create', 'Edit', 'Delete'],
    Sales: ['View', 'Create', 'Edit', 'Delete'],
    Purchase: ['View', 'Create', 'Edit', 'Delete'],
    Inventory: ['View', 'Create', 'Edit', 'Delete'],
    GST: ['View', 'Create', 'Edit', 'Delete'],
    Reports: ['View', 'Create', 'Edit', 'Delete'],
    ActivityLogs: ['View'],
    Settings: ['View', 'Create', 'Edit', 'Delete']
  };

  // Filtered lists
  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));
  const filteredGroups = Object.keys(permissionGroups).filter(group => 
    group.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  const toggleAccordion = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', height: '100%' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Roles & Permissions</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Configure module-level access rules and system user permissions.</span>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1 }} className="roles-layout-split">
        
        {/* LEFT PANEL: Roles List */}
        <div style={{
          width: '320px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '16px',
          display: mobileView === 'details' ? 'none' : 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignSelf: 'stretch'
        }} className="roles-left-panel">
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '10px',
              background: '#7c7a6e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Create Role
          </button>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Search roles..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: '0.85rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: '#fafafa',
                outline: 'none'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
            {filteredRoles.map(role => (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `1px solid ${selectedRoleId === role.id ? '#7c7a6e' : '#f3f4f6'}`,
                  background: selectedRoleId === role.id ? '#f5ebe1' : '#fafafa',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                    {role.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                  </span>
                </div>
                {role.isSystem && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
                    System
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Selected Role Details & Matrix */}
        {activeRole ? (
          <div style={{
            flex: 1,
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            display: mobileView === 'list' ? 'none' : 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignSelf: 'stretch',
            overflowY: 'auto'
          }} className="roles-right-panel">
            
            {/* Mobile Back Button */}
            <button
              onClick={() => setMobileView('list')}
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '8px'
              }}
              className="mobile-back-btn"
            >
              <ArrowLeft size={16} /> Back to Roles
            </button>

            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {activeRole.name} Permissions
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {activeRole.description || 'No description provided.'}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsDuplicateModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: '#4b5563' }}
                >
                  <Copy size={12} /> Duplicate
                </button>
                {!activeRole.isSystem && (
                  <button
                    onClick={handleDeleteActiveRole}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #fee2e2', borderRadius: '8px', background: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>

            {/* Permission Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '300px' }}>
              <input
                type="text"
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Search permission groups..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#fafafa',
                  outline: 'none'
                }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
            </div>

            {/* Permissions Accordion Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredGroups.map(group => {
                const actions = permissionGroups[group];
                const checkedActions = editedPermissions[group] || [];
                const isAllChecked = actions.every(act => checkedActions.includes(act));
                const isExpanded = expandedGroups[group];

                return (
                  <div key={group} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                    {/* Header */}
                    <div 
                      style={{
                        padding: '12px 16px',
                        background: '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleAccordion(group)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isExpanded ? <ChevronDown size={14} style={{ color: '#6b7280' }} /> : <ChevronRight size={14} style={{ color: '#6b7280' }} />}
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{group}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleToggleGroupAll(group, actions); }}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#7c7a6e',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {isAllChecked ? 'Deselect All' : 'Enable All'}
                      </button>
                    </div>

                    {/* Content */}
                    {isExpanded && (
                      <div style={{ padding: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', background: '#fff' }}>
                        {actions.map(action => {
                          const isChecked = checkedActions.includes(action);
                          return (
                            <label 
                              key={action} 
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(group, action)}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '4px',
                                  border: '1px solid #d1d5db',
                                  accentColor: '#7c7a6e',
                                  cursor: 'pointer'
                                }}
                              />
                              <span>{action}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', height: '300px' }}>
            No access roles configured.
          </div>
        )}

      </div>

      {/* STICKY BOTTOM BAR FOR UNSAVED CHANGES */}
      {isDirty && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          zIndex: 1000,
          animation: 'fade-in-up 0.2s ease forwards'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
            Unsaved changes in permissions
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveChanges}
              style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, background: '#7c7a6e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Save Changes
            </button>
            <button
              onClick={handleDiscardChanges}
              style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Create Role */}
      {isCreateModalOpen && (
        <ModalOverlay onClose={() => setIsCreateModalOpen(false)}>
          <RoleFormModal 
            onSave={handleCreateRoleSubmit}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </ModalOverlay>
      )}

      {/* MODAL 2: Duplicate Role */}
      {isDuplicateModalOpen && (
        <ModalOverlay onClose={() => setIsDuplicateModalOpen(false)}>
          <RoleFormModal 
            role={activeRole}
            isDuplicate={true}
            onSave={handleDuplicateRoleSubmit}
            onCancel={() => setIsDuplicateModalOpen(false)}
          />
        </ModalOverlay>
      )}

      <style>{`
        @media (max-width: 1023px) {
          .roles-layout-split {
            flex-direction: column !important;
          }
          .roles-left-panel {
            width: 100% !important;
          }
          .roles-right-panel {
            width: 100% !important;
          }
          .mobile-back-btn {
            display: flex !important;
          }
        }
        @keyframes fade-in-up {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}

// Reusable Modal overlay layout
function ModalOverlay({ children, onClose }) {
  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()} 
          style={{ animation: 'zoom-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
