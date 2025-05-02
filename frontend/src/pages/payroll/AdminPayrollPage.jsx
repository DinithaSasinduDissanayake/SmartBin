import React, { useState, useEffect, useCallback } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';

/**
 * Page component for admins and financial managers to manage staff payroll
 */
const AdminPayrollPage = () => {
  const [staff, setStaff] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
  const [submittingPayroll, setSubmittingPayroll] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialPayrollFormState = {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    basicSalary: 0,
    overtime: 0,
    bonuses: 0,
    deductions: 0,
    notes: ''
  };
  const [payrollForm, setPayrollForm] = useState(initialPayrollFormState);

  const months = [
    { value: 0, label: 'January' }, { value: 1, label: 'February' }, { value: 2, label: 'March' },
    { value: 3, label: 'April' }, { value: 4, label: 'May' }, { value: 5, label: 'June' },
    { value: 6, label: 'July' }, { value: 7, label: 'August' }, { value: 8, label: 'September' },
    { value: 9, label: 'October' }, { value: 10, label: 'November' }, { value: 11, label: 'December' }
  ];

  const fetchStaffMembers = useCallback(async () => {
    setLoadingStaff(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockStaff = [
        { _id: 's1', name: 'John Doe', email: 'john@smartbin.com', department: 'Operations', joiningDate: '2024-01-15' },
        { _id: 's2', name: 'Jane Smith', email: 'jane@smartbin.com', department: 'Customer Support', joiningDate: '2024-02-10' },
        { _id: 's3', name: 'Robert Johnson', email: 'robert@smartbin.com', department: 'Maintenance', joiningDate: '2023-11-05' }
      ];
      setStaff(mockStaff);
    } catch (err) {
      console.error('Error fetching staff members:', err);
      setError('Failed to load staff members. Please try again later.');
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  const fetchStaffPayroll = useCallback(async (staffId) => {
    if (!staffId) return;
    setLoadingPayroll(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockPayrolls = [
        { _id: 'p1', staffId: staffId, month: 2, year: 2025, basicSalary: 5000, overtime: 300, bonuses: 500, deductions: 150, totalAmount: 5650, status: 'paid', paymentDate: '2025-04-01T10:15:00', notes: 'Monthly salary for March 2025' },
        { _id: 'p2', staffId: staffId, month: 1, year: 2025, basicSalary: 5000, overtime: 200, bonuses: 0, deductions: 100, totalAmount: 5100, status: 'paid', paymentDate: '2025-03-01T09:30:00', notes: 'Monthly salary for February 2025' }
      ];
      setPayrolls(mockPayrolls);
      setSelectedPayroll(null);
    } catch (err) {
      console.error('Error fetching payroll records:', err);
      setError('Failed to load payroll records. Please try again later.');
    } finally {
      setLoadingPayroll(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffMembers();
  }, [fetchStaffMembers]);

  const handleSelectStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setSelectedPayroll(null);
    fetchStaffPayroll(staffMember._id);
  };

  const handleSelectPayroll = (payroll) => {
    setSelectedPayroll(payroll);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayrollForm(prev => ({
      ...prev,
      [name]: ['basicSalary', 'overtime', 'bonuses', 'deductions'].includes(name) ? Number(value) : value
    }));
  };

  const calculateTotal = useCallback(() => {
    return (
      (payrollForm.basicSalary || 0) +
      (payrollForm.overtime || 0) +
      (payrollForm.bonuses || 0) -
      (payrollForm.deductions || 0)
    );
  }, [payrollForm.basicSalary, payrollForm.overtime, payrollForm.bonuses, payrollForm.deductions]);

  const handleSubmitPayroll = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      setError('Please select a staff member first.');
      return;
    }
    setSubmittingPayroll(true);
    setError('');
    setSuccess('');

    const newPayrollData = {
      staffId: selectedStaff._id,
      month: payrollForm.month,
      year: payrollForm.year,
      basicSalary: payrollForm.basicSalary,
      overtime: payrollForm.overtime,
      bonuses: payrollForm.bonuses,
      deductions: payrollForm.deductions,
      totalAmount: calculateTotal(),
      notes: payrollForm.notes
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const createdPayroll = { ...newPayrollData, _id: `temp-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };

      setPayrolls(prev => [createdPayroll, ...prev]);
      setSuccess(`Payroll for ${selectedStaff.name} (${months.find(m => m.value === payrollForm.month)?.label} ${payrollForm.year}) created successfully.`);
      setPayrollForm(initialPayrollFormState);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error creating payroll:', err);
      setError('Failed to create payroll. Please try again.');
    } finally {
      setSubmittingPayroll(false);
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    const payrollToUpdate = payrolls.find(p => p._id === payrollId);
    if (!payrollToUpdate) return;

    const originalPayrolls = [...payrolls];
    setPayrolls(payrolls.map(p =>
      p._id === payrollId ? { ...p, status: 'paid', paymentDate: new Date().toISOString() } : p
    ));
    if (selectedPayroll?._id === payrollId) {
      setSelectedPayroll(prev => ({ ...prev, status: 'paid', paymentDate: new Date().toISOString() }));
    }
    setSuccess('Marking payroll as paid...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Payroll marked as paid successfully.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error marking payroll as paid:', err);
      setError('Failed to mark payroll as paid. Reverting changes.');
      setPayrolls(originalPayrolls);
      if (selectedPayroll?._id === payrollId) {
        setSelectedPayroll(payrollToUpdate);
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount) || 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Payroll Management</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Select Staff Member</Typography>
        {loadingStaff ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : staff.length === 0 ? (
          <Typography>No staff members found.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.map((staffMember) => (
                  <TableRow
                    key={staffMember._id}
                    hover
                    selected={selectedStaff?._id === staffMember._id}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSelectStaff(staffMember)}
                  >
                    <TableCell>{staffMember.name}</TableCell>
                    <TableCell>{staffMember.email}</TableCell>
                    <TableCell>{staffMember.department}</TableCell>
                    <TableCell>{new Date(staffMember.joiningDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleSelectStaff(staffMember); }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {selectedStaff && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Generate Payroll for {selectedStaff.name}</Typography>
          <Box component="form" onSubmit={handleSubmitPayroll}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="month-label">Month</InputLabel>
                  <Select
                    labelId="month-label"
                    id="month"
                    name="month"
                    value={payrollForm.month}
                    label="Month"
                    onChange={handleInputChange}
                    required
                  >
                    {months.map((monthOpt) => (
                      <MenuItem key={monthOpt.value} value={monthOpt.value}>{monthOpt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  id="year"
                  name="year"
                  label="Year"
                  variant="outlined"
                  size="small"
                  value={payrollForm.year}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 2020, max: 2030 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  id="basicSalary"
                  name="basicSalary"
                  label="Basic Salary"
                  variant="outlined"
                  size="small"
                  value={payrollForm.basicSalary}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  id="overtime"
                  name="overtime"
                  label="Overtime"
                  variant="outlined"
                  size="small"
                  value={payrollForm.overtime}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  id="bonuses"
                  name="bonuses"
                  label="Bonuses"
                  variant="outlined"
                  size="small"
                  value={payrollForm.bonuses}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  id="deductions"
                  name="deductions"
                  label="Deductions"
                  variant="outlined"
                  size="small"
                  value={payrollForm.deductions}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  value={payrollForm.notes}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mr: 2 }}>
                  Total: {formatCurrency(calculateTotal())}
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submittingPayroll}
                  startIcon={submittingPayroll ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {submittingPayroll ? 'Generating...' : 'Generate Payroll'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {selectedStaff && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Payroll History for {selectedStaff.name}</Typography>
          {loadingPayroll ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : payrolls.length === 0 ? (
            <Typography>No payroll history found for this staff member.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow
                      key={payroll._id}
                      hover
                      selected={selectedPayroll?._id === payroll._id}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSelectPayroll(payroll)}
                    >
                      <TableCell>{`${months.find(m => m.value === payroll.month)?.label} ${payroll.year}`}</TableCell>
                      <TableCell>{formatCurrency(payroll.totalAmount)}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: payroll.status === 'paid' ? 'success.main' : 'warning.main',
                            fontWeight: 'medium'
                          }}
                        >
                          {payroll.status}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {payroll.paymentDate
                          ? new Date(payroll.paymentDate).toLocaleDateString()
                          : new Date(payroll.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {payroll.status === 'pending' && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(payroll._id); }}
                          >
                            Mark Paid
                          </Button>
                        )}
                        {payroll.status === 'paid' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Print/Download functionality will be implemented here');
                            }}
                          >
                            Print
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {selectedPayroll && selectedStaff && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Payslip Details</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedPayroll(null)}
            >
              Close
            </Button>
          </Box>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}><Typography><strong>Employee:</strong> {selectedStaff.name}</Typography></Grid>
            <Grid item xs={6} sm={3}><Typography><strong>Department:</strong> {selectedStaff.department}</Typography></Grid>
            <Grid item xs={6} sm={3}><Typography><strong>Period:</strong> {`${months.find(m => m.value === selectedPayroll.month)?.label} ${selectedPayroll.year}`}</Typography></Grid>
            <Grid item xs={6} sm={3}>
              <Typography><strong>Status:</strong>
                <Typography component="span" sx={{ color: selectedPayroll.status === 'paid' ? 'success.main' : 'warning.main', ml: 0.5 }}>
                  {selectedPayroll.status}
                </Typography>
              </Typography>
            </Grid>
            {selectedPayroll.paymentDate && (
              <Grid item xs={6} sm={3}><Typography><strong>Payment Date:</strong> {new Date(selectedPayroll.paymentDate).toLocaleDateString()}</Typography></Grid>
            )}
          </Grid>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, mb: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={8}><Typography>Basic Salary</Typography></Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography>{formatCurrency(selectedPayroll.basicSalary)}</Typography></Grid>

              <Grid item xs={8}><Typography>Overtime</Typography></Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography>{formatCurrency(selectedPayroll.overtime)}</Typography></Grid>

              <Grid item xs={8}><Typography>Bonuses</Typography></Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography>{formatCurrency(selectedPayroll.bonuses)}</Typography></Grid>

              <Grid item xs={8}><Typography>Deductions</Typography></Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography>-{formatCurrency(selectedPayroll.deductions)}</Typography></Grid>

              <Grid item xs={12}><hr /></Grid>

              <Grid item xs={8}><Typography variant="h6">Total</Typography></Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography variant="h6">{formatCurrency(selectedPayroll.totalAmount)}</Typography></Grid>
            </Grid>
          </Box>

          {selectedPayroll.notes && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Notes:</Typography>
              <Typography variant="body2">{selectedPayroll.notes}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={() => window.print()}
            >
              Print Payslip
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AdminPayrollPage;