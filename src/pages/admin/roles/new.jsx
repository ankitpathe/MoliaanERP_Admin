import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateRoleForm from '../../../components/Admin/Roles/CreateRoleForm';

export default function AddRole() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Link to="/admin/roles" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textDecoration: 'none' }}><ArrowLeft size={16} /> Back to Roles</Link>
      <CreateRoleForm />
    </div>
  );
}
