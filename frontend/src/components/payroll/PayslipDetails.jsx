import React, { useState } from 'react';
import payrollApi from '../../services/payrollApi';
import './PayrollComponents.css';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (amount) => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const PayslipDetails = ({ payrollLog, isAdmin = false, onUpdate, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    paymentDate: new Date().toISOString().split('T')[0], // Today's date as default
    transactionRef: '',
  });
  const [error, setError] = useState('');

  if (!payrollLog) return null;

  const handlePrint = () => {
    window.print();
  };

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
    setError('');
  };

  const handleMarkAsPaid = async (e) => {
    e.preventDefault();
    if (!paymentDetails.transactionRef.trim()) {
      setError('Transaction reference is required');
      return;
    }

    setLoading(true);
    try {
      await payrollApi.markAsPaid(payrollLog._id, paymentDetails);
      setShowPaymentModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as paid');
      console.error('Error marking payroll as paid:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payslip-details">
      <div className="payslip-header no-print">
        <h3 className="payslip-title">Payslip Details</h3>
        <div>
          <button 
            className="btn secondary" 
            onClick={onClose}
          >
            Back
          </button>
          <button 
            className="btn secondary" 
            style={{ marginLeft: '10px' }} 
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>

      <div className="payslip-meta">
        <div className="payslip-meta-item">
          <div className="label">Employee:</div>
          <div>{payrollLog.staff?.name || 'Unknown'}</div>
        </div>
        <div className="payslip-meta-item">
          <div className="label">Period:</div>
          <div>{formatDate(payrollLog.periodStart)} - {formatDate(payrollLog.periodEnd)}</div>
        </div>
        <div className="payslip-meta-item">
          <div className="label">Payment Status:</div>
          <div>
            <span className={`payment-status ${payrollLog.isPaid ? 'paid' : 'pending'}`}>
              {payrollLog.isPaid ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>
        {payrollLog.isPaid && (
          <>
            <div className="payslip-meta-item">
              <div className="label">Payment Date:</div>
              <div>{formatDate(payrollLog.paymentDate)}</div>
            </div>
            <div className="payslip-meta-item">
              <div className="label">Transaction Ref:</div>
              <div>{payrollLog.transactionRef}</div>
            </div>
          </>
        )}
      </div>

      <h4>Earnings</h4>
      <div className="payslip-summary">
        <div className="payslip-row">
          <div>Base Salary</div>
          <div className="amount">{formatCurrency(payrollLog.baseSalary)}</div>
        </div>
        {payrollLog.overtime > 0 && (
          <div className="payslip-row">
            <div>Overtime</div>
            <div className="amount">{formatCurrency(payrollLog.overtime)}</div>
          </div>
        )}
        {payrollLog.bonus > 0 && (
          <div className="payslip-row">
            <div>Bonus</div>
            <div className="amount">{formatCurrency(payrollLog.bonus)}</div>
          </div>
        )}
        <div className="payslip-row">
          <div><strong>Total Earnings</strong></div>
          <div className="amount">{formatCurrency(payrollLog.totalEarnings)}</div>
        </div>
      </div>

      <h4>Deductions</h4>
      <div className="payslip-summary">
        {payrollLog.deductions && payrollLog.deductions.map((deduction, index) => (
          <div className="payslip-row" key={index}>
            <div>{deduction.description}</div>
            <div className="amount">{formatCurrency(deduction.amount)}</div>
          </div>
        ))}
        <div className="payslip-row">
          <div><strong>Total Deductions</strong></div>
          <div className="amount">{formatCurrency(payrollLog.totalDeductions)}</div>
        </div>
      </div>

      <div className="payslip-row total">
        <div>Net Pay</div>
        <div className="amount">{formatCurrency(payrollLog.netPay)}</div>
      </div>

      {isAdmin && !payrollLog.isPaid && (
        <div className="payslip-actions no-print">
          <button 
            className="btn primary" 
            onClick={() => setShowPaymentModal(true)}
            disabled={loading}
          >
            Mark as Paid
          </button>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showPaymentModal && (
        <div className="payment-modal">
          <div className="payment-modal-header">
            <h3>Mark Payroll as Paid</h3>
            <button 
              className="btn secondary" 
              onClick={() => setShowPaymentModal(false)}
              disabled={loading}
            >
              ×
            </button>
          </div>
          
          {error && <div className="form-error">{error}</div>}
          
          <div className="payment-modal-body">
            <form onSubmit={handleMarkAsPaid}>
              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={paymentDetails.paymentDate}
                  onChange={handlePaymentDetailsChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="transactionRef">Transaction Reference</label>
                <input
                  type="text"
                  id="transactionRef"
                  name="transactionRef"
                  value={paymentDetails.transactionRef}
                  onChange={handlePaymentDetailsChange}
                  disabled={loading}
                  required
                  placeholder="Bank transfer reference, check number, etc."
                />
              </div>
              <div className="payment-modal-footer">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipDetails;