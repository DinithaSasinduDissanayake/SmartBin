import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import financialApi from '../../services/financialApi';
// Replace Chart.js imports with Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  Sector
} from 'recharts';
import { 
  faChartPie, 
  faMoneyBillTrendUp, 
  faArrowTrendDown, 
  faUsers,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './FinancialDashboard.css';

// Keep your currency formatter
const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numericAmount);
};

// Keep your date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

const FinancialDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Memoize fetchDashboardData to avoid unnecessary recreations
  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setError('Authentication required: Please log in to view this dashboard');
      setLoading(false);
      return;
    }
      
    // Check if user has required permissions
    if (user.role !== 'financial_manager' && user.role !== 'admin') {
      setError('Access Denied: You need financial manager or admin privileges to view this dashboard');
      setLoading(false);
      return;
    }
      
    try {
      setLoading(true);
      setError(null);
        
      // Use financialApi consistently
      const response = await financialApi.getDashboardData(dateRange);
        
      // Enhanced validation with more specific errors
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
        
      // Ensure all data structures exist with defaults to prevent rendering errors
      const data = {
        summary: response.data.summary || { 
          totalRevenue: 0, 
          totalExpenses: 0, 
          netProfit: 0, 
          activeSubscriptions: 0,
          newSubscriptions: 0 
        },
        revenueByPlan: response.data.revenueByPlan || [],
        expensesByCategory: response.data.expensesByCategory || [],
        trends: response.data.trends || { revenue: [], expenses: [] },
        subscriptionPlans: response.data.subscriptionPlans || [],
        recentTransactions: response.data.recentTransactions || { 
          payments: [], 
          expenses: [] 
        }
      };
        
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching financial dashboard data:", err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user, dateRange]); // Keep dependencies

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Update to use memoized function

  // Memoize the chart data preparation to avoid recalculations on each render
  const prepareChartData = useMemo(() => {
    if (!dashboardData || !dashboardData.summary) {
      return {
        revenueExpenseData: [],
        planRevenueData: [],
        expenseCategoryData: [],
        planSubscriptionData: [],
        hasData: false
      };
    }

    // Generate complete set of labels based on date range
    let completeLabels = [];
    let revenueTrendMap = new Map();
    let expenseTrendMap = new Map();

    // Convert existing data to maps for easy lookup
    (dashboardData.trends?.revenue || []).forEach(item => revenueTrendMap.set(item.month || item.date || item.day, item.total || item.amount || 0));
    (dashboardData.trends?.expenses || []).forEach(item => expenseTrendMap.set(item.month || item.date || item.day, item.total || item.amount || 0));

    const today = new Date();

    // Generate complete set of labels based on dateRange
    if (dateRange === 'month') {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const currentDay = Math.min(today.getDate(), daysInMonth);
      for (let i = 1; i <= currentDay; i++) {
        const dayStr = i.toString();
        completeLabels.push(dayStr);
        if (!revenueTrendMap.has(dayStr)) revenueTrendMap.set(dayStr, 0);
        if (!expenseTrendMap.has(dayStr)) expenseTrendMap.set(dayStr, 0);
      }
    } 
    else if (dateRange === 'last3months') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      for (let i = 0; i < 3; i++) {
        let monthIndex = currentMonth - 2 + i;
        let year = currentYear;
        if (monthIndex < 0) {
          monthIndex += 12;
          year -= 1;
        }
        const monthLabel = `${monthNames[monthIndex]}-${year}`;
        completeLabels.push(monthLabel);
        if (!revenueTrendMap.has(monthLabel)) revenueTrendMap.set(monthLabel, 0);
        if (!expenseTrendMap.has(monthLabel)) expenseTrendMap.set(monthLabel, 0);
      }
    } 
    else { // year
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = today.getFullYear();
      for (let i = 0; i <= today.getMonth(); i++) {
        const monthLabel = `${monthNames[i]}-${year}`;
        completeLabels.push(monthLabel);
        if (!revenueTrendMap.has(monthLabel)) revenueTrendMap.set(monthLabel, 0);
        if (!expenseTrendMap.has(monthLabel)) expenseTrendMap.set(monthLabel, 0);
      }
    }

    // Prepare data for Recharts Line chart
    const revenueExpenseData = completeLabels.map(label => ({
      name: label,
      revenue: revenueTrendMap.get(label) || 0,
      expenses: expenseTrendMap.get(label) || 0
    }));

    const hasData = revenueExpenseData.some(item => item.revenue > 0 || item.expenses > 0);

    // Prepare data for Revenue by Plan Pie chart - ensure proper access to planName, revenue and count
    const planRevenueData = (dashboardData.revenueByPlan || []).map(item => ({
      name: item.planName || item.name || 'Unknown Plan',
      value: Number(item.revenue || item.value || item.amount || 0) || 0
    })).filter(item => item.value > 0); // Filter out zero values for cleaner charts

    // Prepare data for Expenses by Category Bar chart
    const expenseCategoryData = (dashboardData.expensesByCategory || []).map(item => ({
      name: item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'Miscellaneous',
      value: Number(item.total || item.value || item.amount || 0) || 0
    })).filter(item => item.value > 0); // Filter out zero values for cleaner charts

    // Prepare data for Subscriptions by Plan Pie chart - ensure we handle count properly
    const planSubscriptionData = (dashboardData.revenueByPlan || []).map(item => ({
      name: item.planName || item.name || 'Unknown Plan',
      value: Number(item.count || item.subscribers || 0) || 0
    })).filter(item => item.value > 0); // Filter out zero values for cleaner charts

    return {
      revenueExpenseData,
      planRevenueData,
      expenseCategoryData,
      planSubscriptionData,
      hasData
    };
  }, [dashboardData, dateRange]);

  // Destructure the memoized chart data
  const { revenueExpenseData, planRevenueData, expenseCategoryData, planSubscriptionData, hasData } = prepareChartData;

  // Custom colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  // Active Pie Chart animation
  const onPieEnter = (_, index) => {
    setActivePieIndex(index);
  };
  
  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-midAngle * Math.PI / 180);
    const cos = Math.cos(-midAngle * Math.PI / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={14}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
          {`${formatCurrency(value)}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  // Get the appropriate chart title based on the selected date range
  const getChartTitle = () => {
    switch(dateRange) {
      case 'month':
        return 'Revenue vs Expenses Trend (This Month)';
      case 'last3months':
        return 'Revenue vs Expenses Trend (Last 3 Months)';
      case 'year':
        return 'Revenue vs Expenses Trend (Year to Date)';
      default:
        return 'Revenue vs Expenses Trend';
    }
  };

  // Function to handle date range selection with enhanced feedback
  const handleDateRangeChange = (value) => {
    if (value === dateRange) return; // No change needed
    
    setDateRange(value);
    setIsDropdownOpen(false);
    // Reset active pie index when changing date range
    setActivePieIndex(0);
  };

  // Get label for selected date range
  const getDateRangeLabel = () => {
    switch(dateRange) {
      case 'month': return 'This Month';
      case 'last3months': return 'Last 3 Months';
      case 'year': return 'This Year';
      default: return 'This Month';
    }
  };

  // Function to handle report export with improved error handling
  const handleExportReport = async () => {
    try {
      setExportLoading(true);
      const response = await financialApi.exportReport(dateRange);
      
      // Ensure we have data in the response
      if (!response || !response.data) {
        throw new Error('No data received for report export');
      }
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a link element and click it to trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting report:", err);
      const errorMsg = err.response?.data?.message || 'Failed to export report. Please try again later.';
      alert(`Export failed: ${errorMsg}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Refresh dashboard data
  const handleRefreshData = () => {
    fetchDashboardData();
  };

  // Check loading/error/nodata states
  if (loading) {
    return <div className="loading">Loading Financial Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={handleRefreshData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if essential summary data is missing
  if (!dashboardData || !dashboardData.summary) {
    return <div className="loading">No data available. Please check API connection.</div>;
  }

  // Check for genuinely empty data based on summary and arrays
  const isEmptyData =
    (dashboardData.summary.activeSubscriptions || 0) === 0 &&
    (dashboardData.summary.totalRevenue || 0) === 0 &&
    (dashboardData.summary.totalExpenses || 0) === 0 &&
    Array.isArray(dashboardData.revenueByPlan) && dashboardData.revenueByPlan.length === 0 &&
    Array.isArray(dashboardData.expensesByCategory) && dashboardData.expensesByCategory.length === 0;

  const renderPeriodSubtitle = () => (
    <span className="card-subtitle">
      {dateRange === 'month' ? 'This Month' :
        dateRange === 'last3months' ? 'Last 3 Months' :
          'This Year'}
    </span>
  );

  return (
    <div className="financial-dashboard">
      <div className="dashboard-header">
        <h2>Financial Dashboard</h2>
        <div className="dashboard-controls">
          <div className="date-range-selector" ref={dropdownRef}>
            <label>Time Period:</label>
            <div className="custom-dropdown">
              <button 
                className="dropdown-toggle" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Select time period"
                aria-expanded={isDropdownOpen}
                disabled={loading}
              >
                {getDateRangeLabel()}
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu" role="menu">
                  <div 
                    className={`dropdown-item ${dateRange === 'month' ? 'active' : ''}`}
                    onClick={() => handleDateRangeChange('month')}
                    role="menuitem"
                  >
                    This Month
                  </div>
                  <div 
                    className={`dropdown-item ${dateRange === 'last3months' ? 'active' : ''}`}
                    onClick={() => handleDateRangeChange('last3months')}
                    role="menuitem"
                  >
                    Last 3 Months
                  </div>
                  <div 
                    className={`dropdown-item ${dateRange === 'year' ? 'active' : ''}`}
                    onClick={() => handleDateRangeChange('year')}
                    role="menuitem"
                  >
                    This Year
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            className="btn refresh-btn"
            onClick={handleRefreshData}
            title="Refresh dashboard data"
            disabled={loading}
          >
            ↻ Refresh
          </button>
          <button
            className={`export-btn ${exportLoading ? 'loading' : ''}`}
            onClick={handleExportReport}
            aria-label="Export financial report"
            disabled={exportLoading || loading || isEmptyData}
          >
            {exportLoading ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      <div className="dashboard-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'overview'}
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          <FontAwesomeIcon icon={faChartPie} /> Overview
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'revenue'}
          className={activeTab === 'revenue' ? 'active' : ''}
          onClick={() => setActiveTab('revenue')}
        >
          <FontAwesomeIcon icon={faMoneyBillTrendUp} /> Revenue
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'expenses'}
          className={activeTab === 'expenses' ? 'active' : ''}
          onClick={() => setActiveTab('expenses')}
        >
          <FontAwesomeIcon icon={faArrowTrendDown} /> Expenses
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'subscriptions'}
          className={activeTab === 'subscriptions' ? 'active' : ''}
          onClick={() => setActiveTab('subscriptions')}
        >
          <FontAwesomeIcon icon={faUsers} /> Subscriptions
        </button>
      </div>

      <div role="tabpanel" aria-labelledby="tab-overview" hidden={activeTab !== 'overview'}>
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card highlight">
                <h3>Total Revenue</h3>
                <p>{formatCurrency(dashboardData.summary.totalRevenue || 0)}</p>
                {renderPeriodSubtitle()}
              </div>
              <div className="dashboard-card highlight">
                <h3>Total Expenses</h3>
                <p>{formatCurrency(dashboardData.summary.totalExpenses || 0)}</p>
                {renderPeriodSubtitle()}
              </div>
              <div className="dashboard-card highlight">
                <h3>Net Profit</h3>
                <p>{formatCurrency(dashboardData.summary.netProfit || 0)}</p>
                {renderPeriodSubtitle()}
              </div>
              <div className="dashboard-card">
                <h3>Active Subscriptions</h3>
                <p>{dashboardData.summary.activeSubscriptions || 0}</p>
                <span className="card-subtitle">Total Active</span>
              </div>
            </div>

            <div className="dashboard-charts">
              <div className="chart-container">
                {!hasData ? (
                  <div className="no-data-message">
                    <p>No revenue or expense data available for {dateRange === 'month' ? 'this month' : dateRange === 'last3months' ? 'last 3 months' : 'this year'}.</p>
                  </div>
                ) : (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={revenueExpenseData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#4caf50"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          name="Expenses"
                          stroke="#f44336"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="chart-title">{getChartTitle()}</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div role="tabpanel" aria-labelledby="tab-revenue" hidden={activeTab !== 'revenue'}>
        {activeTab === 'revenue' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card highlight">
                <h3>Total Revenue</h3>
                <p>{formatCurrency(dashboardData.summary.totalRevenue || 0)}</p>
                {renderPeriodSubtitle()}
              </div>
            </div>

            <div className="dashboard-charts">
              <div className="chart-container">
                <h3>Revenue by Subscription Plan</h3>
                {planRevenueData.length === 0 ? (
                  <div className="no-data-message">
                    <p>No revenue data available by subscription plan.</p>
                  </div>
                ) : (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          data={planRevenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          onMouseEnter={onPieEnter}
                        >
                          {planRevenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="recent-transactions">
              <h3>Recent Transactions</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData.recentTransactions?.payments?.length > 0) ? (
                      dashboardData.recentTransactions.payments.map((payment) => (
                        <tr key={payment.id || payment._id}>
                          <td>{formatDate(payment.date)}</td>
                          <td>{payment.customer || 'N/A'}</td>
                          <td>{payment.description || 'N/A'}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td><span className={`status ${payment.status?.toLowerCase() || ''}`}>{payment.status || 'N/A'}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5">No recent payments found for this period.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <div role="tabpanel" aria-labelledby="tab-expenses" hidden={activeTab !== 'expenses'}>
        {activeTab === 'expenses' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card highlight">
                <h3>Total Expenses</h3>
                <p>{formatCurrency(dashboardData.summary.totalExpenses || 0)}</p>
                {renderPeriodSubtitle()}
              </div>
              <div className="dashboard-card">
                <h3>Largest Category</h3>
                <p>{dashboardData.expensesByCategory?.[0]?.category ? 
                  (dashboardData.expensesByCategory[0].category.charAt(0).toUpperCase() + 
                   dashboardData.expensesByCategory[0].category.slice(1)) : 
                  'N/A'}</p>
                <span className="card-subtitle">{formatCurrency(dashboardData.expensesByCategory?.[0]?.total || 0)}</span>
              </div>
            </div>

            <div className="dashboard-charts">
              <div className="chart-container">
                <h3>Expenses by Category</h3>
                {expenseCategoryData.length === 0 ? (
                  <div className="no-data-message">
                    <p>No expense data available by category.</p>
                  </div>
                ) : (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={expenseCategoryData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="value" name="Amount" radius={[5, 5, 0, 0]}>
                          {expenseCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="recent-transactions">
              <h3>Recent Expenses</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData.recentTransactions?.expenses?.length > 0) ? (
                      dashboardData.recentTransactions.expenses.map((expense) => (
                        <tr key={expense.id || expense._id}>
                          <td>{formatDate(expense.date)}</td>
                          <td>{expense.category ? (expense.category.charAt(0).toUpperCase() + expense.category.slice(1)) : 'N/A'}</td>
                          <td>{expense.description || 'N/A'}</td>
                          <td>{formatCurrency(expense.amount)}</td>
                          <td><span className={`status ${expense.status?.toLowerCase() || ''}`}>{expense.status || 'N/A'}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5">No recent expenses found for this period.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <div role="tabpanel" aria-labelledby="tab-subscriptions" hidden={activeTab !== 'subscriptions'}>
        {activeTab === 'subscriptions' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card highlight">
                <h3>Active Subscriptions</h3>
                <p>{dashboardData.summary.activeSubscriptions || 0}</p>
                <span className="card-subtitle">Total</span>
              </div>
              <div className="dashboard-card">
                <h3>New Subscriptions</h3>
                <p>{dashboardData.summary.newSubscriptions || 0}</p>
                {renderPeriodSubtitle()}
              </div>
            </div>

            <div className="dashboard-charts">
              <div className="chart-container">
                <h3>Subscriptions by Plan (Count)</h3>
                {planSubscriptionData.length === 0 ? (
                  <div className="no-data-message">
                    <p>No subscription data available by plan.</p>
                  </div>
                ) : (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={planSubscriptionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {planSubscriptionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} subscribers`} />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="subscription-plans">
              <h3>Subscription Plans Overview</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Plan Name</th>
                      <th>Price</th>
                      <th>Billing</th>
                      <th>Active Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData.subscriptionPlans?.length > 0) ? (
                      dashboardData.subscriptionPlans.map((plan) => (
                        <tr key={plan._id || plan.id || plan.name}>
                          <td>{plan.name}</td>
                          <td>{formatCurrency(plan.price)}</td>
                          <td>{plan.duration}</td>
                          <td>{plan.subscriberCount || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4">No subscription plans found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="view-all">
                <Link to="/dashboard/subscription-plans" className="view-all-btn">Manage Subscription Plans</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinancialDashboard;
