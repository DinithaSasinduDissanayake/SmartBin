import api from './api';

const payrollApi = {
  // Generate payroll for a period (Admin/FM)
  generatePayroll: (periodStart, periodEnd) =>
    api.post('/payroll/generate', { periodStart, periodEnd }),

  // Get payroll history for a specific staff member (Admin/FM or Staff Owner)
  getStaffPayrollHistory: (staffId) =>
    api.get(`/payroll/staff/${staffId}`),

  // Get details of a specific payroll log (Admin/FM or Staff Owner)
  getPayrollLogById: (logId) =>
    api.get(`/payroll/${logId}`),

  // Mark payroll as paid (Admin/FM)
  markAsPaid: (logId, paymentDetails) =>
    api.patch(`/payroll/${logId}/mark-paid`, paymentDetails), // paymentDetails = { paymentDate, transactionRef }
};

export default payrollApi;