import React, { useState, useEffect } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../../services/employeeService';
import { useToast } from '../../../hooks/useToast';
import EmployeeStats from '../../../components/Admin/Employees/EmployeeStats';
import EmployeeFilters from '../../../components/Admin/Employees/EmployeeFilters';
import EmployeeTable from '../../../components/Admin/Employees/EmployeeTable';
import EmployeeForm from '../../../components/Admin/Employees/EmployeeForm';
import EmployeeDetails from '../../../components/Admin/Employees/EmployeeDetails';

export default function Employees() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modals/Actions States
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [viewingEmp, setViewingEmp] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  const refreshList = () => {
    setEmployees(getEmployees());
  };

  // Filters calculation
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const availableDepts = [...new Set(employees.map(e => e.department))];

  // Actions handlers
  const handleSaveEmployee = (formData) => {
    try {
      if (selectedEmp) {
        // Edit mode
        updateEmployee(selectedEmp.id, formData);
        toast.showSuccess('Success', 'Employee record updated successfully!');
      } else {
        // Create mode
        createEmployee(formData);
        toast.showSuccess('Success', 'Employee added successfully!');
      }
      refreshList();
      setIsFormOpen(false);
      setSelectedEmp(null);
    } catch (e) {
      toast.showError('Error', 'Unable to save employee. Please try again.');
    }
  };

  const handleToggleStatus = (emp) => {
    setSelectedEmp(emp);
    setIsStatusConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedEmp) {
      const nextStatus = selectedEmp.status === 'Active' ? 'Inactive' : 'Active';
      updateEmployee(selectedEmp.id, { status: nextStatus });
      toast.showSuccess('Success', 'Status updated successfully!');
      refreshList();
    }
    setIsStatusConfirmOpen(false);
    setSelectedEmp(null);
  };

  const handleDeleteEmployee = (emp) => {
    setSelectedEmp(emp);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEmp) {
      deleteEmployee(selectedEmp.id);
      toast.showSuccess('Success', 'Employee record deleted successfully!');
      refreshList();
    }
    setIsDeleteOpen(false);
    setSelectedEmp(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Employees</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Manage staff records, departmental assignments, and operational status.</span>
        </div>
        <button
          onClick={() => {
            setSelectedEmp(null);
            setIsFormOpen(true);
          }}
          style={{
            padding: '10px 20px',
            background: '#7c7a6e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d6b5e'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c7a6e'}
        >
          + Add Employee
        </button>
      </div>

      {/* Summary Stats Card Grid */}
      <EmployeeStats employees={employees} />

      {/* Search & Filter Toolbar */}
      <EmployeeFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        availableDepts={availableDepts}
      />

      {/* Main Table */}
      <EmployeeTable 
        employees={filteredEmployees}
        onView={setViewingEmp}
        onEdit={(emp) => { setSelectedEmp(emp); setIsFormOpen(true); }}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteEmployee}
      />

      {/* MODAL 1: View Employee Details */}
      {viewingEmp && (
        <ModalOverlay onClose={() => setViewingEmp(null)}>
          <EmployeeDetails employee={viewingEmp} onClose={() => setViewingEmp(null)} />
        </ModalOverlay>
      )}

      {/* MODAL 2: Form (Add/Edit Employee) */}
      {isFormOpen && (
        <ModalOverlay onClose={() => { setIsFormOpen(false); setSelectedEmp(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '600px', width: '90vw' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              {selectedEmp ? 'Edit Employee Record' : 'Add New Employee'}
            </h3>
            <EmployeeForm 
              employee={selectedEmp}
              onSave={handleSaveEmployee}
              onCancel={() => { setIsFormOpen(false); setSelectedEmp(null); }}
            />
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 3: Status Toggle Confirmation */}
      {isStatusConfirmOpen && selectedEmp && (
        <ModalOverlay onClose={() => { setIsStatusConfirmOpen(false); setSelectedEmp(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Confirm Status Change
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to change status of <strong>{selectedEmp.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={confirmToggleStatus}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#7c7a6e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Yes, Change Status
              </button>
              <button
                onClick={() => { setIsStatusConfirmOpen(false); setSelectedEmp(null); }}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {isDeleteOpen && selectedEmp && (
        <ModalOverlay onClose={() => { setIsDeleteOpen(false); setSelectedEmp(null); }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
              Confirm Delete Record
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to delete employee <strong>{selectedEmp.name}</strong>? This action is permanent and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={confirmDelete}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Delete Record
              </button>
              <button
                onClick={() => { setIsDeleteOpen(false); setSelectedEmp(null); }}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

    </div>
  );
}

// Reusable Modal overlay layout
function ModalOverlay({ children, onClose }) {
  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()} 
          style={{ animation: 'zoom-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
