import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsers } from '../../../services/userService';
import UserDetailsCard from '../../../components/Admin/Users/UserDetails';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const list = getUsers();
    const found = list.find(u => u.id === id);
    setUser(found || null);
  }, [id]);

  const handleClose = () => {
    navigate('/admin/users');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>User Account Details</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Detailed profile information and module permission summaries.</span>
      </div>

      {user ? (
        <UserDetailsCard user={user} onClose={handleClose} />
      ) : (
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>User ID "{id}" was not found in the ERP registry.</p>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#374151'
            }}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}
