import React, { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

export default function EmployeeTable({ 
  employees, 
  onView, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}) {
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage, setEmployeesPerPage] = useState(10);
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

  const sortedEmployees = [...employees].sort((a, b) => {
    let fieldA = a[sortField]?.toLowerCase() || '';
    let fieldB = b[sortField]?.toLowerCase() || '';
    
    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastEmp = currentPage * employeesPerPage;
  const indexOfFirstEmp = indexOfLastEmp - employeesPerPage;
  const currentEmployees = sortedEmployees.slice(indexOfFirstEmp, indexOfLastEmp);
  const totalPages = Math.ceil(sortedEmployees.length / employeesPerPage);

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

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active': 
        return { background: '#ecfdf5', color: '#059669' };
      case 'On Leave': 
        return { background: '#fffbeb', color: '#d97706' };
      case 'Inactive': 
        return { background: '#f9fafb', color: '#9ca3af' };
      default: 
        return { background: '#f3f4f6', color: '#4b5563' };
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
        {currentEmployees.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No employees found matching parameters.</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <th 
                  onClick={() => handleSort('name')} 
                  style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Employee {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>
                  Contact Info
                </th>
                <th 
                  onClick={() => handleSort('department')} 
                  style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Department {sortField === 'department' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>
                  Designation
                </th>
                <th 
                  onClick={() => handleSort('status')} 
                  style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Status {sortField === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>
                  Joining Date
                </th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((emp, idx) => {
                const badgeStyle = getStatusBadgeStyle(emp.status);
                return (
                  <tr key={emp.id || idx} style={{ borderBottom: '1px solid #f3f4f6', position: 'relative' }}>
                    
                    {/* User Profile Cell */}
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getInitials(emp.name)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                          {emp.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ID: {emp.id}</span>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{emp.email}</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{emp.phone}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563', fontWeight: 550 }}>
                      {emp.department}
                    </td>

                    {/* Designation */}
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4b5563' }}>
                      {emp.designation}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        ...badgeStyle
                      }}>
                        {emp.status}
                      </span>
                    </td>

                    {/* Joining Date */}
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#6b7280' }}>
                      {emp.joiningDate}
                    </td>

                    {/* Action Dropdowns */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', position: 'relative' }}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === emp.id ? null : emp.id)}
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

                      {activeDropdown === emp.id && (
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
                              onClick={() => { onView(emp); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                            >
                              <Eye size={12} /> View Profile
                            </button>
                            <button
                              onClick={() => { onEdit(emp); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                            >
                              <Edit size={12} /> Edit Record
                            </button>
                            <button
                              onClick={() => { onToggleStatus(emp); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                            >
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #7c7a6e' }} />
                              Toggle Status
                            </button>
                            <button
                              onClick={() => { onDelete(emp); setActiveDropdown(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '0.8rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}
                            >
                              <Trash2 size={12} /> Delete Record
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
            Showing {indexOfFirstEmp + 1} to {Math.min(indexOfLastEmp, employees.length)} of {employees.length} staff
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
