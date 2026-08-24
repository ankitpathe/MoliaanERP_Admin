import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployees } from '../../../services/employeeService';
import EmployeeDetailsCard from '../../../components/Admin/Employees/EmployeeDetails';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const list = getEmployees();
    const found = list.find(e => e.id === id);
    setEmployee(found || null);
  }, [id]);

  const handleClose = () => {
    navigate('/admin/employees');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Employee Account Profile</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Detailed staff information and operational assignments.</span>
      </div>

      {employee ? (
        <EmployeeDetailsCard employee={employee} onClose={handleClose} />
      ) : (
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>Employee ID "{id}" was not found in the ERP registry.</p>
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
