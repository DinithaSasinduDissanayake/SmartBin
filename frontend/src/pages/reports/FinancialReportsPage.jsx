import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  LinearProgress,
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
  Alert
} from '@mui/material';
import financialApi from '../../services/financialApi';

const FinancialReportsPage = () => {
  const [reportType, setReportType] = useState('profit-loss');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const params = { startDate, endDate };
      let response;

      switch (reportType) {
        case 'profit-loss':
          response = await financialApi.getProfitLossReport(params);
          setReportData(response.data);
          break;
        case 'revenue-by-customer':
          response = await financialApi.getRevenueByCustomerReport(params);
          setReportData(response.data);
          break;
        case 'expense-details':
          response = await financialApi.getExpenseDetailsReport(params);
          setReportData(response.data);
          break;
        default:
          throw new Error('Invalid report type selected');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.message || `Failed to generate ${reportType} report.`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    setExportLoading(true);
    setError('');

    try {
      const params = { startDate, endDate, type: reportType };
      const response = await financialApi.exportReport(params);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${startDate}-to-${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report export error:', err);
      setError('Failed to export report as PDF. Please try again later.');
    } finally {
      setExportLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount) || 0);
  };

  const renderProfitLossReport = (data) => {
    if (!data || !data.summary) return <Typography>No profit & loss data available for the selected period.</Typography>;

    return (
      <Box>
        <Box>
          <Typography variant="h6">Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography>Total Revenue: {formatCurrency(data.summary.totalRevenue)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>Total Expenses: {formatCurrency(data.summary.totalExpenses)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>Net Profit: {formatCurrency(data.summary.netProfit)}</Typography>
            </Grid>
          </Grid>
        </Box>

        {data.monthlyData && data.monthlyData.length > 0 && (
          <Box>
            <Typography variant="h6">Monthly Trends</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4caf50" />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f44336" />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#2196f3" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    );
  };

  const renderRevenueByCustomerReport = (data) => {
    if (!data || !data.customers || data.customers.length === 0)
      return <Typography>No customer revenue data available for the selected period.</Typography>;

    const sortedCustomers = [...data.customers].sort((a, b) => b.revenue - a.revenue);
    const topCustomers = sortedCustomers.slice(0, 10);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
      <Box>
        <Box>
          <Typography variant="h6">Customer Revenue Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography>Total Customers: {data.totalCustomers}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>Total Revenue: {formatCurrency(data.totalRevenue)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>Average Per Customer: {formatCurrency(data.averageRevenue)}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Top Customers by Revenue</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Revenue Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topCustomers}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {topCustomers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="h6">Customer Details</Typography>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>Average Order</th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((customer, index) => (
                <tr key={index}>
                  <td>{customer.name}</td>
                  <td>{formatCurrency(customer.revenue)}</td>
                  <td>{customer.orders}</td>
                  <td>{formatCurrency(customer.averageOrder)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  };

  const renderExpenseDetailsReport = (data) => {
    if (!data || !data.expenses || data.expenses.length === 0)
      return <Typography>No expense data available for the selected period.</Typography>;

    const expensesByCategory = data.expensesByCategory || [];
    const COLORS = ['#ff9800', '#e91e63', '#2196f3', '#4caf50', '#9c27b0', '#795548'];

    return (
      <Box>
        <Box>
          <Typography variant="h6">Expense Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>Total Expenses: {formatCurrency(data.totalExpenses)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                Largest Category: {expensesByCategory[0]?.category || 'N/A'}{' '}
                {expensesByCategory[0]?.amount ? ` (${formatCurrency(expensesByCategory[0].amount)})` : ''}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Expenses by Category</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Monthly Expense Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyExpenses || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" name="Expenses" stroke="#f44336" />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="h6">Recent Expenses</Typography>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map((expense, index) => (
                <tr key={index}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.category}</td>
                  <td>{expense.description}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  };

  const renderReportData = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'profit-loss':
        return renderProfitLossReport(reportData);
      case 'revenue-by-customer':
        return renderRevenueByCustomerReport(reportData);
      case 'expense-details':
        return renderExpenseDetailsReport(reportData);
      default:
        return <pre>{JSON.stringify(reportData, null, 2)}</pre>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Reports
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              id="startDate"
              label="Start Date"
              type="date"
              variant="outlined"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{
                max: endDate || undefined
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              id="endDate"
              label="End Date"
              type="date"
              variant="outlined"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{
                min: startDate || undefined
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="reportType-label">Report Type</InputLabel>
              <Select
                labelId="reportType-label"
                id="reportType"
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="profit-loss">Profit & Loss</MenuItem>
                <MenuItem value="revenue-by-customer">Revenue By Customer</MenuItem>
                <MenuItem value="expense-details">Expense Details</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateReport}
              disabled={loading || !startDate || !endDate}
              fullWidth
              sx={{ height: '40px' }}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Grid>
          {reportData && (
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ position: 'relative', width: '100%' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleExportReport}
                  disabled={exportLoading || !startDate || !endDate}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  {exportLoading ? 'Exporting...' : 'Export PDF Report'}
                </Button>
                {exportLoading && (
                  <LinearProgress
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '100%'
                    }}
                  />
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {reportType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report
        </Typography>
        {loading && <Typography sx={{ my: 2 }}>Loading report data...</Typography>}
        {!loading && reportData && renderReportData()}
        {!loading && !reportData && !error && <Typography sx={{ my: 2 }}>Select parameters and generate a report.</Typography>}
      </Paper>
    </Box>
  );
};

export default FinancialReportsPage;