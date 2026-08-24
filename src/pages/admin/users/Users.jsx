import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/userService';
import UserStats from '../../../components/Admin/Users/UserStats';
import UserFilters from '../../../components/Admin/Users/UserFilters';
import UserTable from '../../../components/Admin/Users/UserTable';
import UserForm from '../../../components/Admin/Users/UserForm';
import UserDetails from '../../../components/Admin/Users/UserDetails';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modals/Actions States
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);

  // Active admin session data
  const [session, setSession] = useState({});

  useEffect(() => {
    setUsers(getUsers());
    const sess = JSON.parse(localStorage.getItem('erp_user_session') || '{}');
    setSession(sess);
  }, []);

  const refreshList = () => {
    setUsers(getUsers());
  };

  // Filters calculation
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const availableRoles = [...new Set(users.map(u => u.role))];

  // Actions handlers
  const handleSaveUser = (formData) => {
    if (selectedUser) {
      // Edit mode
      updateUser(selectedUser.id, formData);
    } else {
      // Create mode
      createUser(formData);
    }
    refreshList();
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = (user) => {
    setSelectedUser(user);
    setIsStatusConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedUser) {
      const nextStatus = selectedUser.status === 'Active' ? 'Inactive' : 'Active';
      updateUser(selectedUser.id, { status: nextStatus });
      refreshList();
    }
    setIsStatusConfirmOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      try {
        deleteUser(selectedUser.id);
        refreshList();
      } catch (err) {
        alert(err.message);
      }
    }
    setIsDeleteOpen(false);
    setSelectedUser(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Users</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Manage ERP users, access roles, and account status.</span>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsFormOpen(true);
          }}
          style={{
            padding: '10px 20px',
            background: '#7c7a6e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d6b5e'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c7a6e'}
        >
          + Add User
        </button>
      </div>

      {/* Summary Stats Card Grid */}
      <UserStats users={users} />

      {/* Search & Filter Toolbar */}
      <UserFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        availableRoles={availableRoles}
      />

      {/* Main Table */}
      <UserTable 
        users={filteredUsers}
        onView={setViewingUser}
        onEdit={(user) => { setSelectedUser(user); setIsFormOpen(true); }}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteUser}
        currentUserUsername={session.username}
      />

      {/* MODAL 1: View User Details */}
      {viewingUser && (
        <ModalOverlay onClose={() => setViewingUser(null)}>
          <UserDetails user={viewingUser} onClose={() => setViewingUser(null)} />
        </ModalOverlay>
      )}

      {/* MODAL 2: Form (Add/Edit User) */}
      {isFormOpen && (
        <ModalOverlay onClose={() => { setIsFormOpen(false); setSelectedUser(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              {selectedUser ? 'Edit User Profile' : 'Add New ERP User'}
            </h3>
            <UserForm 
              user={selectedUser}
              onSave={handleSaveUser}
              onCancel={() => { setIsFormOpen(false); setSelectedUser(null); }}
            />
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 3: Status Toggle Confirmation */}
      {isStatusConfirmOpen && selectedUser && (
        <ModalOverlay onClose={() => { setIsStatusConfirmOpen(false); setSelectedUser(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Confirm Status Change
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to {selectedUser.status === 'Active' ? 'deactivate' : 'activate'} user <strong>{selectedUser.name}</strong>? 
              {selectedUser.status === 'Active' && ' This user will not be able to log in or access terminals while deactivated.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={confirmToggleStatus}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#7c7a6e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Yes, Change Status
              </button>
              <button
                onClick={() => { setIsStatusConfirmOpen(false); setSelectedUser(null); }}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {isDeleteOpen && selectedUser && (
        <ModalOverlay onClose={() => { setIsDeleteOpen(false); setSelectedUser(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
              Confirm Delete User
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to delete user <strong>{selectedUser.name}</strong>? This action is permanent and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={confirmDelete}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Delete User
              </button>
              <button
                onClick={() => { setIsDeleteOpen(false); setSelectedUser(null); }}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

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
          zIndex: 998,
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
