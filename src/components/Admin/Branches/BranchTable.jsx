import React, { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2, Check } from 'lucide-react';

export default function BranchTable({ 
  branches, 
  onView, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [branchesPerPage, setBranchesPerPage] = useState(10);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const indexOfLastBranch = currentPage * branchesPerPage;
  const indexOfFirstBranch = indexOfLastBranch - branchesPerPage;
  const currentBranches = branches.slice(indexOfFirstBranch, indexOfLastBranch);
  const totalPages = Math.ceil(branches.length / branchesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setActiveDropdown(null);
  };

  const getBranchTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Head Office': return { background: '#e0f2fe', color: '#0369a1' };
      case 'Warehouse': return { background: '#fef3c7', color: '#b45309' };
      case 'Retail Store': return { background: '#ecfdf5', color: '#047857' };
      case 'Outlet': return { background: '#f5f3ff', color: '#6d28d9' };
      default: return { background: '#f3f4f6', color: '#4b5563' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflowX: 'auto'
      }}>
        {currentBranches.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No branch locations found matching parameters.</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Branch / Warehouse</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Manager Details</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Location City</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Default</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBranches.map((branch, idx) => {
                const typeStyle = getBranchTypeBadgeStyle(branch.type);
                return (
                  <tr key={branch.id || idx} style={{ borderBottom: '1px solid #f3f4f6', position: 'relative' }}>
                    
                    {/* Branch Identity */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                          {branch.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Code: {branch.code}</span>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        ...typeStyle
                      }}>
                        {branch.type}
                      </span>
                    </td>

                    {/* Manager info */}
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{branch.manager}</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{branch.phone}</span>
                      </div>
                    </td>

                    {/* Location City */}
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563' }}>
                      {branch.city}
                    </td>

                    {/* Status marker */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: branch.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                        color: branch.status === 'Active' ? '#059669' : '#dc2626'
                      }}>
                        {branch.status}
                      </span>
                    </td>

                    {/* Default identifier */}
                    <td style={{ padding: '12px 16px' }}>
                      {branch.isDefault ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Check size={14} strokeWidth={3} /> Default
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>

                    {/* Action Dropdowns */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', position: 'relative' }}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === branch.id ? null : branch.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          color: '#9ca3af'
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeDropdown === branch.id && (
                        <>
                          <div 
                            onClick={() => setActiveDropdown(null)} 
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                          />
                          <div style={{
                            position: 'absolute',
                            right: '16px',
                            top: '40px',
                            background: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            zIndex: 20,
                            padding: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: '150px'
                          }}>
                            <button
                              onClick={() => { onView(branch); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                            >
                              <Eye size={12} /> View Details
                            </button>
                            <button
                              onClick={() => { onEdit(branch); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                            >
                              <Edit size={12} /> Edit Location
                            </button>
                            <button
                              onClick={() => { onToggleStatus(branch); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                            >
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #7c7a6e' }} />
                              Toggle Status
                            </button>
                            <button
                              onClick={() => { onDelete(branch); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}
                            >
                              <Trash2 size={12} /> Delete Location
                            </button>
                          </div>
                        </>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            Showing {indexOfFirstBranch + 1} to {Math.min(indexOfLastBranch, branches.length)} of {branches.length} locations
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
