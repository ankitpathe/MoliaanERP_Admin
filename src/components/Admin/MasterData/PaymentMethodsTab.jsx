import React, { useState } from 'react';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { addMasterItem, updateMasterItem, deleteMasterItem } from '../../../services/masterDataService';
import { useToast } from '../../../hooks/useToast';

export default function PaymentMethodsTab({ paymentMethods, onRefresh }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('CASH');

  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('CASH');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      addMasterItem('paymentMethods', { 
        name: name.trim(), 
        type
      });
      toast.showSuccess('Success', 'Payment method added successfully!');
      setName('');
      setType('CASH');
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      toast.showError('Error', err.message);
    }
  };

  const handleStartEdit = (pm) => {
    setEditingId(pm.id);
    setEditName(pm.name);
    setEditType(pm.type);
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim()) return;
    try {
      updateMasterItem('paymentMethods', id, { 
        name: editName.trim(), 
        type: editType
      });
      toast.showSuccess('Success', 'Payment method updated successfully!');
      setEditingId(null);
      onRefresh();
    } catch (err) {
      toast.showError('Error', err.message);
    }
  };

  const handleToggleStatus = (pm) => {
    try {
      updateMasterItem('paymentMethods', pm.id, { status: !pm.status });
      onRefresh();
    } catch (err) {
      toast.showError('Error', err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      deleteMasterItem('paymentMethods', id);
      toast.showSuccess('Success', 'Payment method deleted successfully!');
      onRefresh();
    }
  };

  const filtered = paymentMethods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search payment modes..."
          style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', minWidth: '240px' }}
        />
        <button
          onClick={() => setIsAdding(true)}
          style={{ padding: '8px 14px', background: '#7c7a6e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} /> Add Method
        </button>
      </div>

      {/* Add Form Row */}
      {isAdding && (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px dashed #7c7a6e', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4b5563' }}>Method Name *</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Google Pay" style={{ padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '150px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4b5563' }}>Type *</span>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}>
              <option value="CASH">Cash</option>
              <option value="DIGITAL">Digital (UPI / Wallet)</option>
              <option value="CARD">Card Machine</option>
              <option value="CREDIT">Customer Khata / Credit</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Save</button>
            <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '6px 12px', background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Mode Name</th>
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Channel Type</th>
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(pm => {
              const isEditing = editingId === pm.id;
              return (
                <tr key={pm.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>
                    {isEditing ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{pm.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {isEditing ? (
                      <select value={editType} onChange={(e) => setEditType(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>
                        <option value="CASH">Cash</option>
                        <option value="DIGITAL">Digital</option>
                        <option value="CARD">Card</option>
                        <option value="CREDIT">Khata</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{pm.type}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(pm)}
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: pm.status ? '#ecfdf5' : '#fef2f2',
                        color: pm.status ? '#059669' : '#dc2626',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {pm.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSaveEdit(pm.id)} style={{ background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer' }}><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEdit(pm)} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer' }}><Edit size={14} /></button>
                          <button onClick={() => handleDelete(pm.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
