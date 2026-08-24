import React, { useState, useEffect } from 'react';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../../services/branchService';
import { useToast } from '../../../hooks/useToast';
import BranchStats from './BranchStats';
import BranchTable from './BranchTable';
import BranchFormModal from './BranchFormModal';
import { Building2, Search, X, MapPin, Landmark, Phone, Mail, FileText } from 'lucide-react';

export default function BranchManagement() {
  const toast = useToast();
  const [branches, setBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal actions states
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [viewingBranch, setViewingBranch] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);

  useEffect(() => {
    setBranches(getBranches());
  }, []);

  const refreshList = () => {
    setBranches(getBranches());
  };

  const filteredBranches = branches.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'All' || b.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSaveBranch = (formData) => {
    try {
      if (selectedBranch) {
        // Edit Mode
        updateBranch(selectedBranch.id, formData);
        toast.showSuccess('Success', 'Branch settings updated successfully!');
      } else {
        // Create Mode
        createBranch(formData);
        toast.showSuccess('Success', 'New branch/warehouse added successfully!');
      }
      refreshList();
      setIsFormOpen(false);
      setSelectedBranch(null);
    } catch (e) {
      toast.showError('Error', e.message || 'Unable to save branch.');
    }
  };

  const handleToggleStatus = (branch) => {
    setSelectedBranch(branch);
    setIsStatusConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedBranch) {
      const nextStatus = selectedBranch.status === 'Active' ? 'Inactive' : 'Active';
      updateBranch(selectedBranch.id, { status: nextStatus });
      toast.showSuccess('Success', 'Status toggled successfully!');
      refreshList();
    }
    setIsStatusConfirmOpen(false);
    setSelectedBranch(null);
  };

  const handleDeleteBranch = (branch) => {
    setSelectedBranch(branch);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBranch) {
      try {
        deleteBranch(selectedBranch.id);
        toast.showSuccess('Success', 'Branch location deleted successfully!');
        refreshList();
      } catch (e) {
        toast.showError('Error', e.message || 'Unable to delete branch.');
      }
    }
    setIsDeleteOpen(false);
    setSelectedBranch(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Branches</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Manage office branches, storage warehouses, and retail outlet locations.</span>
        </div>
        <button
          onClick={() => {
            setSelectedBranch(null);
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
            cursor: 'pointer'
          }}
        >
          + Add Location
        </button>
      </div>

      {/* KPI stats */}
      <BranchStats branches={branches} />

      {/* Toolbar filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        background: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code, manager, or city..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#fafafa',
              outline: 'none'
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            outline: 'none',
            color: '#4b5563',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Types</option>
          <option value="Head Office">Head Office</option>
          <option value="Retail Store">Retail Store</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Outlet">Outlet</option>
          <option value="Regional Office">Regional Office</option>
        </select>
      </div>

      {/* Data Table */}
      <BranchTable 
        branches={filteredBranches}
        onView={setViewingBranch}
        onEdit={(branch) => { setSelectedBranch(branch); setIsFormOpen(true); }}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteBranch}
      />

      {/* MODAL 1: View details */}
      {viewingBranch && (
        <ModalOverlay onClose={() => setViewingBranch(null)}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '440px', width: '90vw', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5ebe1', color: '#7c7a6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>{viewingBranch.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Code: {viewingBranch.code} ({viewingBranch.type})</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                <MapPin size={16} style={{ color: '#9ca3af', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: '#6b7280', width: '80px', flexShrink: 0 }}>Address:</span>
                <span style={{ color: '#374151' }}>{viewingBranch.street}, {viewingBranch.city}, {viewingBranch.state} - {viewingBranch.pincode}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                <Landmark size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                <span style={{ color: '#6b7280', width: '80px', flexShrink: 0 }}>GSTIN:</span>
                <span style={{ color: '#374151' }}>{viewingBranch.gstin || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                <Phone size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                <span style={{ color: '#6b7280', width: '80px', flexShrink: 0 }}>Phone:</span>
                <span style={{ color: '#374151' }}>{viewingBranch.phone}</span>
              </div>
              {viewingBranch.email && (
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                  <Mail size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <span style={{ color: '#6b7280', width: '80px', flexShrink: 0 }}>Email:</span>
                  <span style={{ color: '#374151' }}>{viewingBranch.email}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setViewingBranch(null)}
              style={{ padding: '10px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', cursor: 'pointer' }}
            >
              Close View
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 2: Form Create / Edit */}
      {isFormOpen && (
        <ModalOverlay onClose={() => { setIsFormOpen(false); setSelectedBranch(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '600px', width: '90vw' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              {selectedBranch ? 'Edit Location Details' : 'Add New Location'}
            </h3>
            <BranchFormModal 
              branch={selectedBranch}
              onSave={handleSaveBranch}
              onCancel={() => { setIsFormOpen(false); setSelectedBranch(null); }}
            />
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 3: Status confirmation */}
      {isStatusConfirmOpen && selectedBranch && (
        <ModalOverlay onClose={() => { setIsStatusConfirmOpen(false); setSelectedBranch(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Confirm Status Change
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to toggle status for branch <strong>{selectedBranch.name}</strong> to {selectedBranch.status === 'Active' ? 'Inactive' : 'Active'}?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={confirmToggleStatus}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#7c7a6e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Yes, Change Status
              </button>
              <button
                onClick={() => { setIsStatusConfirmOpen(false); setSelectedBranch(null); }}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 4: Delete confirmation */}
      {isDeleteOpen && selectedBranch && (
        <ModalOverlay onClose={() => { setIsDeleteOpen(false); setSelectedBranch(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
              Confirm Delete Location
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to delete branch <strong>{selectedBranch.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={confirmDelete}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Delete Location
              </button>
              <button
                onClick={() => { setIsDeleteOpen(false); setSelectedBranch(null); }}
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
