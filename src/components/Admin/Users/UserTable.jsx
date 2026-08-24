import React, { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

export default function UserTable({ 
  users, 
  onView, 
  onEdit, 
  onToggleStatus, 
  onDelete,
  currentUserUsername 
}) {
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let fieldA = a[sortField]?.toLowerCase() || '';
    let fieldB = b[sortField]?.toLowerCase() || '';
    
    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setActiveDropdown(null);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflowX: 'auto'
      }}>
        {currentUsers.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No users found matching parameters.</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <th 
                  onClick={() => handleSort('name')} 
                  style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  User {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>
                  Email
                </th>
                <th 
                  onClick={() => handleSort('role')} 
                  style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Role {sortField === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th 
                  onClick={() => handleSort('status')} 
                  style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Status {sortField === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th 
                  onClick={() => handleSort('lastActive')} 
                  style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Last Active {sortField === 'lastActive' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, idx) => {
                const isSelf = user.username?.toLowerCase() === currentUserUsername?.toLowerCase();
                return (
                  <tr key={user.id || idx} style={{ borderBottom: '1px solid #f3f4f6', position: 'relative' }}>
                    
                    {/* User Profile Cell */}
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#f5ebe1',
                        color: '#7c7a6e',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getInitials(user.name)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                          {user.name} {isSelf && <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 400 }}>(You)</span>}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>@{user.username}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563' }}>
                      {user.email}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563', fontWeight: 550 }}>
                      {user.role}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: user.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                        color: user.status === 'Active' ? '#059669' : '#dc2626'
                      }}>
                        {user.status}
                      </span>
                    </td>

                    {/* Last active / Created */}
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#6b7280' }}>
                      {user.lastActive}
                    </td>

                    {/* Action Dropdowns */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', position: 'relative' }}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
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

                      {activeDropdown === user.id && (
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
                              onClick={() => { onView(user); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                            >
                              <Eye size={12} /> View Profile
                            </button>
                            <button
                              onClick={() => { onEdit(user); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                            >
                              <Edit size={12} /> Edit Account
                            </button>
                            <button
                              onClick={() => { onToggleStatus(user); setActiveDropdown(null); }}
                              disabled={isSelf}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '8px', 
                                fontSize: '0.8rem', 
                                background: 'transparent', 
                                border: 'none', 
                                width: '100%', 
                                textAlign: 'left', 
                                cursor: isSelf ? 'not-allowed' : 'pointer', 
                                color: isSelf ? '#9ca3af' : '#374151' 
                              }}
                            >
                              <CheckCirclePlaceholder active={user.status === 'Active'} />
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => { onDelete(user); setActiveDropdown(null); }}
                              disabled={isSelf}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '8px', 
                                fontSize: '0.8rem', 
                                background: 'transparent', 
                                border: 'none', 
                                width: '100%', 
                                textAlign: 'left', 
                                cursor: isSelf ? 'not-allowed' : 'pointer', 
                                color: isSelf ? '#9ca3af' : '#ef4444' 
                              }}
                            >
                              <Trash2 size={12} /> Delete User
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
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, users.length)} of {users.length} users
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

function CheckCirclePlaceholder({ active }) {
  return (
    <div style={{
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: `2px solid ${active ? '#d97706' : '#059669'}`,
      background: 'transparent'
    }} />
  );
}
