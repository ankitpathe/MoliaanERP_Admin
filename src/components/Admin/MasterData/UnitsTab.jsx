import React, { useState } from 'react';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { addMasterItem, updateMasterItem, deleteMasterItem } from '../../../services/masterDataService';
import { useToast } from '../../../hooks/useToast';

export default function UnitsTab({ units, onRefresh }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [allowDecimals, setAllowDecimals] = useState(false);

  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDecimals, setEditDecimals] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    try {
      addMasterItem('units', { 
        name: name.trim(), 
        code: code.trim().toUpperCase(),
        allowDecimals
      });
      toast.showSuccess('Success', 'Unit added successfully!');
      setName('');
      setCode('');
      setAllowDecimals(false);
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      toast.showError('Error', err.message);
    }
  };

  const handleStartEdit = (unit) => {
    setEditingId(unit.id);
    setEditName(unit.name);
    setEditCode(unit.code);
    setEditDecimals(unit.allowDecimals);
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim() || !editCode.trim()) return;
    try {
      updateMasterItem('units', id, { 
        name: editName.trim(), 
        code: editCode.trim().toUpperCase(),
        allowDecimals: editDecimals
      });
      toast.showSuccess('Success', 'Unit updated successfully!');
      setEditingId(null);
      onRefresh();
    } catch (err) {
      toast.showError('Error', err.message);
    }
  };

  const handleToggleStatus = (unit) => {
    try {
      updateMasterItem('units', unit.id, { status: !unit.status });
      onRefresh();
    } catch (err) {
      toast.showError('Error', err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this measurement unit?')) {
      deleteMasterItem('units', id);
      toast.showSuccess('Success', 'Unit deleted successfully!');
      onRefresh();
    }
  };

  const filtered = units.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search units by name or code..."
          style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', minWidth: '240px' }}
        />
        <button
          onClick={() => setIsAdding(true)}
          style={{ padding: '8px 14px', background: '#7c7a6e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} /> Add Unit
        </button>
      </div>

      {/* Add Form Row */}
      {isAdding && (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px dashed #7c7a6e', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4b5563' }}>Unit Name *</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kilogram" style={{ padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4b5563' }}>Code *</span>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. KG" style={{ padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} required />
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer', marginBottom: '8px' }}>
            <input type="checkbox" checked={allowDecimals} onChange={(e) => setAllowDecimals(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }} />
            <span>Allow Decimals</span>
          </label>
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
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Unit Name</th>
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Short Code</th>
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>Allow Decimals</th>
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(unit => {
              const isEditing = editingId === unit.id;
              return (
                <tr key={unit.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>
                    {isEditing ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{unit.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {isEditing ? (
                      <input type="text" value={editCode} onChange={(e) => setEditCode(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '80px' }} />
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{unit.code}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {isEditing ? (
                      <input type="checkbox" checked={editDecimals} onChange={(e) => setEditDecimals(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }} />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{unit.allowDecimals ? 'Yes' : 'No'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(unit)}
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: unit.status ? '#ecfdf5' : '#fef2f2',
                        color: unit.status ? '#059669' : '#dc2626',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {unit.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSaveEdit(unit.id)} style={{ background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer' }}><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEdit(unit)} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer' }}><Edit size={14} /></button>
                          <button onClick={() => handleDelete(unit.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
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
