import React from 'react';
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

const PayrollHistoryTable = ({ payrollLogs = [], onSelectPayroll, isAdminView = false }) => {
  if (payrollLogs.length === 0) {
    return <p className="no-data-message">No payroll records found.</p>;
  }

  return (
    <div className="payroll-container">
      <table className="payroll-history-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Staff</th>
            <th>Net Pay</th>
            <th>Payment Status</th>
            <th>Payment Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {payrollLogs.map((log) => (
            <tr key={log._id}>
              <td>{formatDate(log.periodStart)} - {formatDate(log.periodEnd)}</td>
              <td>{log.staff?.name || 'Unknown'}</td>
              <td>{formatCurrency(log.netPay)}</td>
              <td>
                <span className={`payment-status ${log.isPaid ? 'paid' : 'pending'}`}>
                  {log.isPaid ? 'Paid' : 'Pending'}
                </span>
              </td>
              <td>{log.paymentDate ? formatDate(log.paymentDate) : 'Not paid'}</td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => onSelectPayroll(log._id)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollHistoryTable;