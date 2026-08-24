import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateBranchForm from '../../../components/Admin/Branches/CreateBranchForm';

export default function AddBranch() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Link to="/admin/branches" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textDecoration: 'none' }}><ArrowLeft size={16} /> Back to Branches</Link>
      <CreateBranchForm />
    </div>
  );
}
