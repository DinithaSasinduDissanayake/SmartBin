import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import financialApi from '../../services/financialApi'; // Import specific financialApi
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || (user.role !== 'financial_manager' && user.role !== 'admin')) {
        setError('Access Denied');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Use financialApi consistently
        const response = await financialApi.getDashboardData(dateRange);
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching financial dashboard data:", err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, dateRange]); // Keep dependencies

  const prepareChartData = () => {
    if (!dashboardData || !dashboardData.summary) { // Check for summary object
      return {
        revenueExpenseData: [],
        planRevenueData: [],
        expenseCategoryData: [],
        planSubscriptionData: [], // Keep this if used elsewhere, otherwise remove
        hasData: false
      };
    }

    // Generate complete set of labels based on date range
    let completeLabels = [];
    let revenueTrendMap = new Map();
    let expenseTrendMap = new Map();

    // Convert existing data to maps for easy lookup
    (dashboardData.trends?.revenue || []).forEach(item => revenueTrendMap.set(item.month, item.total));
    (dashboardData.trends?.expenses || []).forEach(item => expenseTrendMap.set(item.month, item.total));

    const today = new Date();

    // Generate complete set of labels based on dateRange (month)
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
    // Generate complete set of labels based on dateRange (last3months)
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
    // Generate complete set of labels based on dateRange (year)
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
      revenue: revenueTrendMap.get(label) || 0, // Ensure 0 if undefined
      expenses: expenseTrendMap.get(label) || 0 // Ensure 0 if undefined
    }));

    const hasData = revenueExpenseData.some(item => item.revenue > 0 || item.expenses > 0);

    // Prepare data for Revenue by Plan Pie chart
    const planRevenueData = dashboardData.revenueByPlan?.map(item => ({
      name: item.planName, // Use planName from backend
      value: item.revenue   // Use revenue from backend
    })) || [];

    // Prepare data for Expenses by Category Bar chart
    const expenseCategoryData = dashboardData.expensesByCategory?.map(item => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1), // Capitalize first letter
      value: item.total     // Use total from backend
    })) || [];

    // Prepare data for Subscriptions by Plan Pie chart (using revenueByPlan data)
    const planSubscriptionData = dashboardData.revenueByPlan?.map(item => ({
      name: item.planName, // Use planName from backend
      value: item.count    // Use count from backend for subscription count by plan
    })) || [];


    return {
      revenueExpenseData,
      planRevenueData,
      expenseCategoryData,
      planSubscriptionData, // Now represents count by plan
      hasData
    };
  };

  const { revenueExpenseData, planRevenueData, expenseCategoryData, planSubscriptionData, hasData } = prepareChartData();

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

  // Check loading/error/nodata states using summary object
  if (loading) {
    return <div className="loading">Loading Financial Dashboard...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Check if essential summary data is missing
  if (!dashboardData || !dashboardData.summary) {
    return <div className="loading">No data available.</div>;
  }

  // Check for genuinely empty data based on summary and arrays
  const isEmptyData =
    (dashboardData.summary.activeSubscriptions || 0) === 0 &&
    (dashboardData.summary.totalRevenue || 0) === 0 &&
    (dashboardData.summary.totalExpenses || 0) === 0 &&
    // (dashboardData.summary.outstandingPayments || 0) === 0 && // Uncomment if outstandingPayments is added
    Array.isArray(dashboardData.revenueByPlan) && dashboardData.revenueByPlan.length === 0 &&
    Array.isArray(dashboardData.expensesByCategory) && dashboardData.expensesByCategory.length === 0;

  if (isEmptyData && !hasData) { // Also check if trend data is empty
    return (
      <div className="empty-state">
        <p>No financial data available for this period.</p>
      </div>
    );
  }

  const renderPeriodSubtitle = () => (
    <span className="card-subtitle">
      {dateRange === 'month' ? 'This Month' :
        dateRange === 'last3months' ? 'Last 3 Months' :
          'This Year'}
    </span>
  );

  // Function to handle date range selection
  const handleDateRangeChange = (value) => {
    setDateRange(value);
    setIsDropdownOpen(false);
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
              >
                {getDateRangeLabel()}
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div 
                    className={`dropdown-item ${dateRange === 'month' ? 'active' : ''}`}
                    onClick={() => handleDateRangeChange('month')}
                  >
                    This Month
                  </div>
                  <div 
                    className={`dropdown-item ${dateRange === 'last3months' ? 'active' : ''}`}
                    onClick={() => handleDateRangeChange('last3months')}
                  >
                    Last 3 Months
                  </div>
                  <div 
                    className={`dropdown-item ${dateRange === 'year' ? 'active' : ''}`}
                    onClick={() => handleDateRangeChange('year')}
                  >
                    This Year
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            className="export-btn"
            onClick={() => alert('Export functionality to be implemented')}
          >
            Export Report
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          <FontAwesomeIcon icon={faChartPie} /> Overview
        </button>
        <button
          className={activeTab === 'revenue' ? 'active' : ''}
          onClick={() => setActiveTab('revenue')}
        >
          <FontAwesomeIcon icon={faMoneyBillTrendUp} /> Revenue
        </button>
        <button
          className={activeTab === 'expenses' ? 'active' : ''}
          onClick={() => setActiveTab('expenses')}
        >
          <FontAwesomeIcon icon={faArrowTrendDown} /> Expenses
        </button>
        <button
          className={activeTab === 'subscriptions' ? 'active' : ''}
          onClick={() => setActiveTab('subscriptions')}
        >
          <FontAwesomeIcon icon={faUsers} /> Subscriptions
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card highlight">
              <h3>Total Revenue</h3>
              {/* Access summary data correctly */}
              <p>{formatCurrency(dashboardData.summary.totalRevenue || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card highlight">
              <h3>Total Expenses</h3>
              {/* Access summary data correctly */}
              <p>{formatCurrency(dashboardData.summary.totalExpenses || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card highlight">
              <h3>Net Profit</h3>
              {/* Access summary data correctly */}
              <p>{formatCurrency(dashboardData.summary.netProfit || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card">
              <h3>Active Subscriptions</h3>
              {/* Access summary data correctly */}
              <p>{dashboardData.summary.activeSubscriptions || 0}</p>
              <span className="card-subtitle">Total Active</span>
            </div>
            {/* Remove Outstanding Payments card if not implemented in backend */}
            {/* <div className="dashboard-card">
              <h3>Outstanding Payments</h3>
              <p>{formatCurrency(dashboardData.summary.outstandingPayments || 0)}</p>
              <span className="card-subtitle">Pending Collection</span>
            </div> */}
            {/* Subscription Revenue card might need adjustment based on backend data */}
            {/* <div className="dashboard-card">
              <h3>Subscription Revenue</h3>
              <p>{formatCurrency(dashboardData.totalRevenue?.subscriptions || 0)}</p>
              {renderPeriodSubtitle()}
            </div> */}
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
                      data={revenueExpenseData} // Use correctly prepared data
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

      {activeTab === 'revenue' && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card highlight">
              <h3>Total Revenue</h3>
              {/* Access summary data correctly */}
              <p>{formatCurrency(dashboardData.summary.totalRevenue || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            {/* Remove Revenue Growth card if not implemented */}
            {/* <div className="dashboard-card">
              <h3>Revenue Growth</h3>
              <p>{(dashboardData.revenueGrowthPercentage || 0).toFixed(1)}%</p>
              <span className="card-subtitle">From Previous Period</span>
            </div> */}
            {/* Remove Average Revenue card if not implemented */}
            {/* <div className="dashboard-card">
              <h3>Average Revenue</h3>
              <p>{formatCurrency(dashboardData.averageDailyRevenue || 0)}</p>
              <span className="card-subtitle">Per Day (in Period)</span>
            </div> */}
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Revenue by Subscription Plan</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={planRevenueData} // Use correctly prepared data
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
                  {/* Use recentTransactions.payments from backend */}
                  {dashboardData.recentTransactions?.payments?.length > 0 ? (
                    dashboardData.recentTransactions.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.date)}</td>
                        <td>{payment.customer || 'N/A'}</td>
                        <td>{payment.description || 'N/A'}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td><span className={`status ${payment.status?.toLowerCase()}`}>{payment.status}</span></td>
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

      {activeTab === 'expenses' && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card highlight">
              <h3>Total Expenses</h3>
              {/* Access summary data correctly */}
              <p>{formatCurrency(dashboardData.summary.totalExpenses || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            {/* Adjust Largest Category card if needed */}
            <div className="dashboard-card">
              <h3>Largest Category</h3>
              <p>{dashboardData.expensesByCategory?.[0]?.category || 'N/A'}</p>
              <span className="card-subtitle">{formatCurrency(dashboardData.expensesByCategory?.[0]?.total || 0)}</span>
            </div>
            {/* Remove Budget Status card if not implemented */}
            {/* <div className="dashboard-card">
              <h3>Budget Status</h3>
              <p>N/A</p>
              <span className="card-subtitle">Budget data needed</span>
            </div> */}
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Expenses by Category</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={expenseCategoryData} // Use correctly prepared data
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }} // Adjusted bottom margin
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70} // Keep height for angled labels
                      interval={0} // Show all labels
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
                  {/* Use recentTransactions.expenses from backend */}
                  {dashboardData.recentTransactions?.expenses?.length > 0 ? (
                    dashboardData.recentTransactions.expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{formatDate(expense.date)}</td>
                        {/* Capitalize first letter of category */}
                        <td>{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</td>
                        <td>{expense.description || 'N/A'}</td>
                        <td>{formatCurrency(expense.amount)}</td>
                        <td><span className={`status ${expense.status?.toLowerCase()}`}>{expense.status}</span></td>
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

      {activeTab === 'subscriptions' && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card highlight">
              <h3>Active Subscriptions</h3>
              {/* Access summary data correctly */}
              <p>{dashboardData.summary.activeSubscriptions || 0}</p>
              <span className="card-subtitle">Total</span>
            </div>
            <div className="dashboard-card">
              <h3>New Subscriptions</h3>
              {/* Access summary data correctly */}
              <p>{dashboardData.summary.newSubscriptions || 0}</p>
              {renderPeriodSubtitle()}
            </div>
            {/* Remove Cancellations card if not implemented */}
            {/* <div className="dashboard-card">
              <h3>Cancellations</h3>
              <p>{dashboardData.cancellations || 0}</p>
              {renderPeriodSubtitle()}
            </div> */}
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              {/* Changed title to reflect data source */}
              <h3>Subscriptions by Plan (Count)</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={planSubscriptionData} // Use data prepared for subscription counts
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value" // 'value' now holds the count
                      label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`} // Show count and percentage
                    >
                      {planSubscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    {/* Tooltip formatter for count */}
                    <Tooltip formatter={(value) => `${value} subscribers`} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
                  {/* Use subscriptionPlans from backend */}
                  {dashboardData.subscriptionPlans?.length > 0 ? (
                    dashboardData.subscriptionPlans.map((plan) => (
                      // Use plan._id for key if available, otherwise plan.name
                      <tr key={plan._id || plan.name}>
                        <td>{plan.name}</td>
                        <td>{formatCurrency(plan.price)}</td>
                        <td>{plan.duration}</td>
                        <td>{plan.subscriberCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4">No subscription plans found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="view-all">
              {/* Link to manage plans */}
              <Link to="/dashboard/subscription-plans" className="view-all-btn">Manage Subscription Plans</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialDashboard;
