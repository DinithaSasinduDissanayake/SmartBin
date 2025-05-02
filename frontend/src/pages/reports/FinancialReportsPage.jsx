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
import { LinearProgress } from '@mui/material'; // Assuming Material UI is used, adjust if needed
import financialApi from '../../services/financialApi';
import './FinancialReportsPage.css'; 

const FinancialReportsPage = () => {
  const [reportType, setReportType] = useState('profit-loss');
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const handleGenerateReport = async () => {
    // Basic validation
    if (!startDate || !endDate) {
       setError('Please select both start and end dates.');
       return;
    }
    
    // Validate date range
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

  // Function to handle PDF export
  const handleExportReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    
    setExportLoading(true);
    setError('');
    
    try {
      // Create date range parameter for the API call
      const params = { startDate, endDate, type: reportType };
      
      // Call the export API function with proper parameters
      const response = await financialApi.exportReport(params);
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${startDate}-to-${endDate}.pdf`);
      
      // Append link to body, click it to start download, then clean up
      document.body.appendChild(link);
      link.click();
      
      // Clean up by removing the link and revoking the URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Report export error:', err);
      setError('Failed to export report as PDF. Please try again later.');
    } finally {
      setExportLoading(false);
    }
  };

  // Format currency for report display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount) || 0);
  };

  const renderProfitLossReport = (data) => {
    if (!data || !data.summary) return <p>No profit & loss data available for the selected period.</p>;
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <h4>Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total Revenue:</span>
              <span className="value">{formatCurrency(data.summary.totalRevenue)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Expenses:</span>
              <span className="value">{formatCurrency(data.summary.totalExpenses)}</span>
            </div>
            <div className="summary-item highlight">
              <span className="label">Net Profit:</span>
              <span className="value">{formatCurrency(data.summary.netProfit)}</span>
            </div>
          </div>
        </div>
        
        {data.monthlyData && data.monthlyData.length > 0 && (
          <div className="report-chart">
            <h4>Monthly Trends</h4>
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
          </div>
        )}
      </div>
    );
  };
  
  const renderRevenueByCustomerReport = (data) => {
    if (!data || !data.customers || data.customers.length === 0) 
      return <p>No customer revenue data available for the selected period.</p>;
    
    // Sort customers by revenue (highest first)
    const sortedCustomers = [...data.customers].sort((a, b) => b.revenue - a.revenue);
    const topCustomers = sortedCustomers.slice(0, 10); // Show top 10
    
    // Prepare data for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <h4>Customer Revenue Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total Customers:</span>
              <span className="value">{data.totalCustomers}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Revenue:</span>
              <span className="value">{formatCurrency(data.totalRevenue)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Average Per Customer:</span>
              <span className="value">{formatCurrency(data.averageRevenue)}</span>
            </div>
          </div>
        </div>
        
        <div className="report-charts-grid">
          <div className="chart-container">
            <h4>Top Customers by Revenue</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h4>Revenue Distribution</h4>
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
          </div>
        </div>
        
        <div className="report-table">
          <h4>Customer Details</h4>
          <table className="data-table">
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
        </div>
      </div>
    );
  };
  
  const renderExpenseDetailsReport = (data) => {
    if (!data || !data.expenses || data.expenses.length === 0)
      return <p>No expense data available for the selected period.</p>;
    
    // Group expenses by category
    const expensesByCategory = data.expensesByCategory || [];
    
    // Prepare colors for charts
    const COLORS = ['#ff9800', '#e91e63', '#2196f3', '#4caf50', '#9c27b0', '#795548'];
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <h4>Expense Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total Expenses:</span>
              <span className="value">{formatCurrency(data.totalExpenses)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Largest Category:</span>
              <span className="value">
                {expensesByCategory[0]?.category || 'N/A'} 
                {expensesByCategory[0]?.amount ? ` (${formatCurrency(expensesByCategory[0].amount)})` : ''}
              </span>
            </div>
          </div>
        </div>
        
        <div className="report-charts-grid">
          <div className="chart-container">
            <h4>Expenses by Category</h4>
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
          </div>
          
          <div className="chart-container">
            <h4>Monthly Expense Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyExpenses || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" name="Expenses" stroke="#f44336" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-table">
          <h4>Recent Expenses</h4>
          <table className="data-table">
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
        </div>
      </div>
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
    <div className="financial-reports-page dashboard-content">
      <h2>Financial Reports</h2>

      <div className="report-controls">
        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <input 
            type="date" 
            id="startDate" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate || undefined}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input 
            type="date" 
            id="endDate" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            min={startDate || undefined}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reportType">Report Type:</label>
          <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="profit-loss">Profit & Loss</option>
            <option value="revenue-by-customer">Revenue By Customer</option>
            <option value="expense-details">Expense Details</option>
          </select>
        </div>
        <button 
          className="btn primary" 
          onClick={handleGenerateReport} 
          disabled={loading || !startDate || !endDate}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {reportData && (
          <div className="export-section"> {/* Wrap button and progress bar */}
            <button
              className="btn secondary"
              onClick={handleExportReport}
              disabled={exportLoading || !startDate || !endDate}
            >
              {exportLoading ? 'Exporting...' : 'Export PDF Report'}
            </button>
            {exportLoading && <LinearProgress style={{ marginTop: '8px' }} />} {/* Add progress bar */}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="report-output">
        <h3>{reportType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report</h3>
        {loading && <p className="loading-message">Loading report data...</p>}
        {!loading && reportData && renderReportData()}
        {!loading && !reportData && !error && <p>Select parameters and generate a report.</p>}
      </div>
    </div>
  );
};

export default FinancialReportsPage;