import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createEmployee } from '../../../services/employeeService';
import { useToast } from '../../../hooks/useToast';
import EmployeeForm from '../../../components/Admin/Employees/EmployeeForm';

export default function AddEmployee() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSave = (formData) => {
    try {
      createEmployee(formData);
      toast.showSuccess('Success', 'Employee added successfully!');
      navigate('/admin/employees');
    } catch (e) {
      toast.showError('Error', 'Unable to create employee record.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard unsaved changes?')) {
      navigate('/admin/employees');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => navigate('/admin/employees')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            alignSelf: 'flex-start'
          }}
        >
          <ArrowLeft size={16} /> Back to Employees
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Register Employee</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Create an employee record, assign departments, and select operational designation.</span>
        </div>
      </div>

      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb'
      }}>
        <EmployeeForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
