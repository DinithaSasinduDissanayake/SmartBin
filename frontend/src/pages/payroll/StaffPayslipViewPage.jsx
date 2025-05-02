import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../components/payroll/PayrollComponents.css';

/**
 * Page component for staff members to view their payslips
 */
const StaffPayslipViewPage = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Define months for display
  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];
  
  // Simulated payslip data - replace with actual API calls in production
  const fetchPayslips = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const mockPayslips = [
          {
            _id: 'p1',
            staffId: user._id,
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
            staffId: user._id,
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
          },
          {
            _id: 'p3',
            staffId: user._id,
            month: 0, // January (0-indexed)
            year: 2025,
            basicSalary: 5000,
            overtime: 100,
            bonuses: 250,
            deductions: 100,
            totalAmount: 5250,
            status: 'paid',
            paymentDate: '2025-02-01T11:20:00',
            notes: 'Monthly salary for January 2025'
          }
        ];
        
        setPayslips(mockPayslips);
        setLoading(false);
        setError('');
      }, 1000);
    } catch (err) {
      console.error('Error fetching payslips:', err);
      setError('Failed to load payslips. Please try again later.');
      setLoading(false);
    }
  }, [user?._id]);

  // Load payslips on component mount
  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  // Handle payslip selection
  const handleSelectPayslip = (payslip) => {
    setSelectedPayslip(payslip);
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
      <h2>My Payslips</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      {loading ? (
        <p>Loading your payslips...</p>
      ) : payslips.length === 0 ? (
        <div className="payroll-section">
          <p>No payslips found.</p>
        </div>
      ) : (
        <>
          {/* Payslips list */}
          <div className="payroll-section">
            <h3>Payslip History</h3>
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Payment Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map(payslip => (
                  <tr key={payslip._id}>
                    <td>{`${months[payslip.month]} ${payslip.year}`}</td>
                    <td>{new Date(payslip.paymentDate).toLocaleDateString()}</td>
                    <td>{formatCurrency(payslip.totalAmount)}</td>
                    <td>
                      <span className={`payment-status ${payslip.status}`}>
                        {payslip.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn primary"
                        onClick={() => handleSelectPayslip(payslip)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Selected payslip details */}
          {selectedPayslip && (
            <div className="payroll-section payslip-details">
              <div className="payslip-header">
                <h3 className="payslip-title">Payslip Details</h3>
                <button 
                  className="btn secondary no-print"
                  onClick={() => setSelectedPayslip(null)}
                >
                  Close
                </button>
              </div>
              
              <div className="payslip-meta">
                <div className="payslip-meta-item">
                  <span className="label">Employee:</span>
                  <span>{user?.name || 'Staff Member'}</span>
                </div>
                <div className="payslip-meta-item">
                  <span className="label">Department:</span>
                  <span>{user?.department || 'N/A'}</span>
                </div>
                <div className="payslip-meta-item">
                  <span className="label">Period:</span>
                  <span>{`${months[selectedPayslip.month]} ${selectedPayslip.year}`}</span>
                </div>
                <div className="payslip-meta-item">
                  <span className="label">Payment Date:</span>
                  <span>{new Date(selectedPayslip.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="payslip-summary">
                <div className="payslip-row">
                  <span>Basic Salary</span>
                  <span className="amount">{formatCurrency(selectedPayslip.basicSalary)}</span>
                </div>
                {selectedPayslip.overtime > 0 && (
                  <div className="payslip-row">
                    <span>Overtime</span>
                    <span className="amount">{formatCurrency(selectedPayslip.overtime)}</span>
                  </div>
                )}
                {selectedPayslip.bonuses > 0 && (
                  <div className="payslip-row">
                    <span>Bonuses</span>
                    <span className="amount">{formatCurrency(selectedPayslip.bonuses)}</span>
                  </div>
                )}
                {selectedPayslip.deductions > 0 && (
                  <div className="payslip-row">
                    <span>Deductions</span>
                    <span className="amount">-{formatCurrency(selectedPayslip.deductions)}</span>
                  </div>
                )}
                <div className="payslip-row total">
                  <span>Total</span>
                  <span className="amount">{formatCurrency(selectedPayslip.totalAmount)}</span>
                </div>
              </div>
              
              {selectedPayslip.notes && (
                <div className="payslip-notes">
                  <h4>Notes</h4>
                  <p>{selectedPayslip.notes}</p>
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
        </>
      )}
    </div>
  );
};

export default StaffPayslipViewPage;