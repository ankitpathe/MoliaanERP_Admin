import React, { useState } from 'react';
import { Eye } from 'lucide-react';

export default function LogTable({ logs, onInspect }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = logs.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(logs.length / rowsPerPage);

  const getActionBadgeStyle = (type) => {
    const t = type?.toUpperCase();
    if (t === 'CREATE' || t === 'LOGIN' || t === 'LOGIN_SUCCESS') {
      return { background: '#ecfdf5', color: '#059669' };
    }
    if (t === 'UPDATE' || t === 'CONFIG' || t === 'CONFIG_CHANGED' || t === 'PAYMENT' || t === 'PRINT' || t === 'DOWNLOAD' || t === 'EXPORT') {
      return { background: '#eff6ff', color: '#2563eb' };
    }
    if (t === 'DELETE' || t === 'LOGOUT' || t === 'FAILED_LOGIN' || t === 'STATUS_DISABLED') {
      return { background: '#fef2f2', color: '#dc2626' };
    }
    return { background: '#f3f4f6', color: '#4b5563' };
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflowX: 'auto'
      }}>
        {currentRows.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No audit logs recorded for the selected filters.</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>User / Role</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Action</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Module</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Description</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((log, idx) => {
                const badgeStyle = getActionBadgeStyle(log.activityType);
                return (
                  <tr key={log.id || idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    
                    {/* Timestamp */}
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{log.date}</span>
                        <span style={{ fontSize: '0.725rem', color: '#9ca3af' }}>{log.time}</span>
                      </div>
                    </td>

                    {/* User / Role */}
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{log.userName}</span>
                        <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>{log.userRole}</span>
                      </div>
                    </td>

                    {/* Action Type */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        ...badgeStyle
                      }}>
                        {log.activityType}
                      </span>
                    </td>

                    {/* Module */}
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                      {log.module}
                    </td>

                    {/* Description */}
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>
                      {log.actionDescription}
                    </td>

                    {/* Action trigger */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => onInspect(log)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          color: '#7c7a6e',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={14} /> Inspect
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, logs.length)} of {logs.length} entries
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
