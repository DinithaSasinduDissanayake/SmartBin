import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../components/payroll/PayrollComponents.css';

/**
 * Page component for admins and financial managers to manage staff payroll
 */
const AdminPayrollPage = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [payrollForm, setPayrollForm] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    basicSalary: 0,
    overtime: 0,
    bonuses: 0,
    deductions: 0,
    notes: ''
  });

  // Define months for the dropdown
  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];
  
  // Simulated data - replace with actual API calls in production
  const fetchStaffMembers = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const mockStaff = [
          {
            _id: 's1',
            name: 'John Doe',
            email: 'john@smartbin.com',
            role: 'staff',
            department: 'Operations',
            joiningDate: '2024-01-15'
          },
          {
            _id: 's2',
            name: 'Jane Smith',
            email: 'jane@smartbin.com',
            role: 'staff',
            department: 'Customer Support',
            joiningDate: '2024-02-10'
          },
          {
            _id: 's3',
            name: 'Robert Johnson',
            email: 'robert@smartbin.com',
            role: 'staff',
            department: 'Maintenance',
            joiningDate: '2023-11-05'
          }
        ];
        
        setStaff(mockStaff);
        setLoading(false);
        setError('');
      }, 1000);
    } catch (err) {
      console.error('Error fetching staff members:', err);
      setError('Failed to load staff members. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Fetch payroll records for a specific staff member
  const fetchStaffPayroll = useCallback((staffId) => {
    if (!staffId) return;
    
    setLoading(true);
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const mockPayrolls = [
          {
            _id: 'p1',
            staffId: staffId,
            month: 2, // March (0-indexed)
            year: 2025,
            basicSalary: 5000,
            overtime: 300,
            bonuses: 500,
            deductions: 150,
            totalAmount: 5650,
            status: 'paid',
            paymentDate: '2025-04-01T10:15:00',
            notes: 'Monthly salary for March 2025'
          },
          {
            _id: 'p2',
            staffId: staffId,
            month: 1, // February (0-indexed)
            year: 2025,
            basicSalary: 5000,
            overtime: 200,
            bonuses: 0,
            deductions: 100,
            totalAmount: 5100,
            status: 'paid',
            paymentDate: '2025-03-01T09:30:00',
            notes: 'Monthly salary for February 2025'
          }
        ];
        
        setPayrolls(mockPayrolls);
        setSelectedPayroll(null);
        setLoading(false);
        setError('');
      }, 1000);
    } catch (err) {
      console.error('Error fetching payroll records:', err);
      setError('Failed to load payroll records. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Load staff members on component mount
  useEffect(() => {
    fetchStaffMembers();
  }, [fetchStaffMembers]);

  // Handle staff selection
  const handleSelectStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setSelectedPayroll(null);
    fetchStaffPayroll(staffMember._id);
  };

  // Handle payroll selection
  const handleSelectPayroll = (payroll) => {
    setSelectedPayroll(payroll);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayrollForm(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : Number(value)
    }));
  };

  // Calculate total amount
  const calculateTotal = () => {
    return (
      payrollForm.basicSalary + 
      payrollForm.overtime + 
      payrollForm.bonuses - 
      payrollForm.deductions
    );
  };

  // Handle payroll form submission
  const handleSubmitPayroll = (e) => {
    e.preventDefault();
    
    if (!selectedStaff) {
      setError('Please select a staff member first.');
      return;
    }
    
    // Create new payroll object
    const newPayroll = {
      _id: `temp-${Date.now()}`,
      staffId: selectedStaff._id,
      month: payrollForm.month,
      year: payrollForm.year,
      basicSalary: payrollForm.basicSalary,
      overtime: payrollForm.overtime,
      bonuses: payrollForm.bonuses,
      deductions: payrollForm.deductions,
      totalAmount: calculateTotal(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: payrollForm.notes
    };
    
    // Add to payrolls list
    setPayrolls([newPayroll, ...payrolls]);
    
    // Show success message
    setSuccess(`Payroll for ${selectedStaff.name} (${months[payrollForm.month]} ${payrollForm.year}) has been created.`);
    
    // Reset form to defaults with current month/year
    setPayrollForm({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      basicSalary: 0,
      overtime: 0,
      bonuses: 0,
      deductions: 0,
      notes: ''
    });
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  // Handle marking a payroll as paid
  const handleMarkAsPaid = (payrollId) => {
    const updatedPayrolls = payrolls.map(payroll => 
      payroll._id === payrollId 
        ? { ...payroll, status: 'paid', paymentDate: new Date().toISOString() }
        : payroll
    );
    
    setPayrolls(updatedPayrolls);
    
    // Update selected payroll if it's the one being marked as paid
    if (selectedPayroll && selectedPayroll._id === payrollId) {
      setSelectedPayroll({
        ...selectedPayroll, 
        status: 'paid', 
        paymentDate: new Date().toISOString()
      });
    }
    
    setSuccess('Payroll has been marked as paid.');
    setTimeout(() => setSuccess(''), 5000);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="dashboard-content">
      <h2>Payroll Management</h2>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}
      
      {/* Staff list section */}
      <div className="payroll-section">
        <h3>Select Staff Member</h3>
        {loading && staff.length === 0 ? (
          <p>Loading staff members...</p>
        ) : staff.length === 0 ? (
          <p>No staff members found.</p>
        ) : (
          <table className="payroll-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Joining Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(staffMember => (
                <tr 
                  key={staffMember._id}
                  className={selectedStaff?._id === staffMember._id ? 'selected' : ''}
                >
                  <td>{staffMember.name}</td>
                  <td>{staffMember.email}</td>
                  <td>{staffMember.department}</td>
                  <td>{new Date(staffMember.joiningDate).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn primary"
                      onClick={() => handleSelectStaff(staffMember)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Payroll generation form */}
      {selectedStaff && (
        <div className="payroll-section">
          <h3>Generate Payroll for {selectedStaff.name}</h3>
          <form onSubmit={handleSubmitPayroll} className="payroll-generator-form">
            <div className="form-group">
              <label htmlFor="month">Month</label>
              <select
                id="month"
                name="month"
                value={payrollForm.month}
                onChange={handleInputChange}
                required
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                min="2020"
                max="2030"
                value={payrollForm.year}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="basicSalary">Basic Salary</label>
              <input
                type="number"
                id="basicSalary"
                name="basicSalary"
                min="0"
                step="0.01"
                value={payrollForm.basicSalary}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="overtime">Overtime</label>
              <input
                type="number"
                id="overtime"
                name="overtime"
                min="0"
                step="0.01"
                value={payrollForm.overtime}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="bonuses">Bonuses</label>
              <input
                type="number"
                id="bonuses"
                name="bonuses"
                min="0"
                step="0.01"
                value={payrollForm.bonuses}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="deductions">Deductions</label>
              <input
                type="number"
                id="deductions"
                name="deductions"
                min="0"
                step="0.01"
                value={payrollForm.deductions}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={payrollForm.notes}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn primary">
                Generate Payroll
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Payroll history */}
      {selectedStaff && payrolls.length > 0 && (
        <div className="payroll-section">
          <h3>Payroll History for {selectedStaff.name}</h3>
          <table className="payroll-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created/Paid Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(payroll => (
                <tr 
                  key={payroll._id}
                  className={selectedPayroll?._id === payroll._id ? 'selected clickable' : 'clickable'}
                  onClick={() => handleSelectPayroll(payroll)}
                >
                  <td>{`${months[payroll.month]} ${payroll.year}`}</td>
                  <td>{formatCurrency(payroll.totalAmount)}</td>
                  <td>
                    <span className={`payment-status ${payroll.status}`}>
                      {payroll.status}
                    </span>
                  </td>
                  <td>
                    {payroll.paymentDate 
                      ? new Date(payroll.paymentDate).toLocaleDateString() 
                      : new Date(payroll.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {payroll.status === 'pending' && (
                      <button 
                        className="btn primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsPaid(payroll._id);
                        }}
                      >
                        Mark as Paid
                      </button>
                    )}
                    {payroll.status === 'paid' && (
                      <button 
                        className="btn secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Implement print/download functionality here
                          alert('Print/Download functionality will be implemented here');
                        }}
                      >
                        Print
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Payslip details */}
      {selectedPayroll && (
        <div className="payroll-section payslip-details">
          <div className="payslip-header">
            <h3 className="payslip-title">Payslip Details</h3>
            <button 
              className="btn secondary no-print"
              onClick={() => setSelectedPayroll(null)}
            >
              Close
            </button>
          </div>
          
          <div className="payslip-meta">
            <div className="payslip-meta-item">
              <span className="label">Employee:</span>
              <span>{selectedStaff.name}</span>
            </div>
            <div className="payslip-meta-item">
              <span className="label">Department:</span>
              <span>{selectedStaff.department}</span>
            </div>
            <div className="payslip-meta-item">
              <span className="label">Period:</span>
              <span>{`${months[selectedPayroll.month]} ${selectedPayroll.year}`}</span>
            </div>
            <div className="payslip-meta-item">
              <span className="label">Status:</span>
              <span className={`payment-status ${selectedPayroll.status}`}>
                {selectedPayroll.status}
              </span>
            </div>
            {selectedPayroll.paymentDate && (
              <div className="payslip-meta-item">
                <span className="label">Payment Date:</span>
                <span>{new Date(selectedPayroll.paymentDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="payslip-summary">
            <div className="payslip-row">
              <span>Basic Salary</span>
              <span className="amount">{formatCurrency(selectedPayroll.basicSalary)}</span>
            </div>
            <div className="payslip-row">
              <span>Overtime</span>
              <span className="amount">{formatCurrency(selectedPayroll.overtime)}</span>
            </div>
            <div className="payslip-row">
              <span>Bonuses</span>
              <span className="amount">{formatCurrency(selectedPayroll.bonuses)}</span>
            </div>
            <div className="payslip-row">
              <span>Deductions</span>
              <span className="amount">-{formatCurrency(selectedPayroll.deductions)}</span>
            </div>
            <div className="payslip-row total">
              <span>Total</span>
              <span className="amount">{formatCurrency(selectedPayroll.totalAmount)}</span>
            </div>
          </div>
          
          {selectedPayroll.notes && (
            <div className="payslip-notes">
              <h4>Notes</h4>
              <p>{selectedPayroll.notes}</p>
            </div>
          )}
          
          <div className="payslip-actions no-print">
            <button 
              className="btn primary"
              onClick={() => {
                // Implement print functionality
                window.print();
              }}
            >
              Print Payslip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayrollPage;