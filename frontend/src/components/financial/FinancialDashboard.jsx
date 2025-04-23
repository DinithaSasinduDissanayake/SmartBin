import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import financialApi from '../../services/financialApi'; // Import specific financialApi
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
import './FinancialDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

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
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || (user.role !== 'financial_manager' && user.role !== 'admin')) {
        setError('Access Denied');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await financialApi.getDashboardData(dateRange); // Use financialApi
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
  }, [user, dateRange]);

  const prepareChartData = () => {
    if (!dashboardData) {
      return { revenueExpenseData: {}, planRevenueData: {}, expenseCategoryData: {}, planSubscriptionData: {} };
    }

    // Generate complete set of labels based on date range
    let completeLabels = [];
    let revenueTrendMap = new Map();
    let expenseTrendMap = new Map();

    // Convert existing data to maps for easy lookup
    (dashboardData.trends?.revenue || []).forEach(item => revenueTrendMap.set(item.month, item.total));
    (dashboardData.trends?.expenses || []).forEach(item => expenseTrendMap.set(item.month, item.total));

    const today = new Date();
    
    // Generate complete set of labels based on dateRange
    if (dateRange === 'month') {
      // For month: days 1-current day of month
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const currentDay = Math.min(today.getDate(), daysInMonth);
      
      for (let i = 1; i <= currentDay; i++) {
        const dayStr = i.toString();
        completeLabels.push(dayStr);
        if (!revenueTrendMap.has(dayStr)) revenueTrendMap.set(dayStr, 0);
        if (!expenseTrendMap.has(dayStr)) expenseTrendMap.set(dayStr, 0);
      }
    } else if (dateRange === 'last3months') {
      // For last 3 months: get the previous 3 months including current
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Loop through the last 3 months (including current)
      for (let i = 0; i < 3; i++) {
        // Calculate month index (handling year wrap-around)
        let monthIndex = currentMonth - 2 + i;
        let year = currentYear;
        
        if (monthIndex < 0) {
          monthIndex += 12;
          year -= 1;
        }
        
        const monthLabel = `${monthNames[monthIndex]}-${year}`;
        completeLabels.push(monthLabel);
        
        // For all months, initialize with available data or 0
        if (!revenueTrendMap.has(monthLabel)) revenueTrendMap.set(monthLabel, 0);
        if (!expenseTrendMap.has(monthLabel)) expenseTrendMap.set(monthLabel, 0);
      }
    } else { // year
      // For year: Jan-current month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = today.getFullYear();
      
      for (let i = 0; i <= today.getMonth(); i++) {
        const monthLabel = `${monthNames[i]}-${year}`;
        completeLabels.push(monthLabel);
        if (!revenueTrendMap.has(monthLabel)) revenueTrendMap.set(monthLabel, 0);
        if (!expenseTrendMap.has(monthLabel)) expenseTrendMap.set(monthLabel, 0);
      }
    }

    // Use our complete labels for the chart with values from maps (will be 0 for missing data)
    const revenueExpenseData = {
      labels: completeLabels,
      datasets: [
        {
          label: 'Revenue',
          data: completeLabels.map(label => revenueTrendMap.get(label)),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          spanGaps: true
        },
        {
          label: 'Expenses',
          data: completeLabels.map(label => expenseTrendMap.get(label)),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          spanGaps: true
        }
      ]
    };

    // Check if there's any non-null data to display
    const allZeroValues = revenueExpenseData.datasets.every(dataset => 
      dataset.data.every(value => value === 0 || value === null)
    );

    // For other chart data, keep the original logic
    const planRevenueLabels = dashboardData.revenueByPlan?.map(item => item.plan) || [];
    const planRevenueData = {
      labels: planRevenueLabels,
      datasets: [{
        label: 'Revenue',
        data: dashboardData.revenueByPlan?.map(item => item.revenue) || [],
        borderWidth: 1
      }]
    };

    const expenseCategoryLabels = dashboardData.expensesByCategory?.map(item => item.category) || [];
    const expenseCategoryData = {
      labels: expenseCategoryLabels,
      datasets: [{
        label: 'Expenses by Category',
        data: dashboardData.expensesByCategory?.map(item => item.total) || [],
        borderWidth: 1
      }]
    };

    const planSubscriptionLabels = dashboardData.revenueByPlan?.map(item => item.plan) || [];
    const planSubscriptionData = {
      labels: planSubscriptionLabels,
      datasets: [{
        label: 'Subscriptions (by Revenue)',
        data: dashboardData.revenueByPlan?.map(item => item.revenue) || [],
        borderWidth: 1
      }]
    };

    return { 
      revenueExpenseData, 
      planRevenueData, 
      expenseCategoryData, 
      planSubscriptionData, 
      allZeroValues 
    };
  };

  const { revenueExpenseData, planRevenueData, expenseCategoryData, planSubscriptionData, allZeroValues } = prepareChartData();

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
      colors: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
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

  const lineChartOptions = { 
    ...commonChartOptions, 
    plugins: { 
      ...commonChartOptions.plugins, 
      title: { 
        display: true, 
        text: getChartTitle() 
      } 
    } 
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Distribution' },
      colors: { enabled: true }
    }
  };
  const barChartOptions = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, legend: { display: false }, title: { display: true, text: 'Expenses by Category' } } };

  if (loading) {
    return <div className="loading">Loading Financial Dashboard...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!dashboardData) {
    return <div className="loading">No data available.</div>;
  }

  const isEmptyData =
    dashboardData.activeSubscriptions === 0 &&
    (dashboardData.totalRevenue?.period || 0) === 0 &&
    (dashboardData.totalExpenses?.period || 0) === 0 &&
    (dashboardData.outstandingPayments || 0) === 0 &&
    Array.isArray(dashboardData.revenueByPlan) && dashboardData.revenueByPlan.length === 0 &&
    Array.isArray(dashboardData.expensesByCategory) && dashboardData.expensesByCategory.length === 0;

  if (isEmptyData) {
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

  return (
    <div className="financial-dashboard">
      <div className="dashboard-header">
        <h2>Financial Dashboard</h2>
        <div className="dashboard-controls">
          <div className="date-range-selector">
            <label htmlFor="date-range">Time Period:</label>
            <select
              id="date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="month">This Month</option>
              <option value="last3months">Last 3 Months</option>
              <option value="year">This Year</option>
            </select>
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
          Overview
        </button>
        <button
          className={activeTab === 'revenue' ? 'active' : ''}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </button>
        <button
          className={activeTab === 'expenses' ? 'active' : ''}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={activeTab === 'subscriptions' ? 'active' : ''}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card highlight">
              <h3>Total Revenue</h3>
              <p>{formatCurrency(dashboardData.totalRevenue?.period || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card highlight">
              <h3>Total Expenses</h3>
              <p>{formatCurrency(dashboardData.totalExpenses?.period || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card highlight">
              <h3>Net Profit</h3>
              <p>{formatCurrency((dashboardData.totalRevenue?.period || 0) - (dashboardData.totalExpenses?.period || 0))}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card">
              <h3>Active Subscriptions</h3>
              <p>{dashboardData.activeSubscriptions || 0}</p>
              <span className="card-subtitle">Total Active</span>
            </div>
            <div className="dashboard-card">
              <h3>Outstanding Payments</h3>
              <p>{formatCurrency(dashboardData.outstandingPayments || 0)}</p>
              <span className="card-subtitle">Pending Collection</span>
            </div>
            <div className="dashboard-card">
              <h3>Subscription Revenue</h3>
              <p>{formatCurrency(dashboardData.totalRevenue?.subscriptions || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              {allZeroValues ? (
                <div className="no-data-message">
                  <p>No revenue or expense data available for {dateRange === 'month' ? 'this month' : dateRange === 'last3months' ? 'last 3 months' : 'this year'}.</p>
                </div>
              ) : (
                <div className="chart-wrapper">
                  <Line
                    data={revenueExpenseData}
                    options={lineChartOptions}
                  />
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
              <p>{formatCurrency(dashboardData.totalRevenue?.period || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card">
              <h3>Revenue Growth</h3>
              <p>{(dashboardData.revenueGrowthPercentage || 0).toFixed(1)}%</p>
              <span className="card-subtitle">From Previous Period</span>
            </div>
            <div className="dashboard-card">
              <h3>Average Revenue</h3>
              <p>{formatCurrency(dashboardData.averageDailyRevenue || 0)}</p>
              <span className="card-subtitle">Per Day (in Period)</span>
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Revenue by Subscription Plan</h3>
              <div className="chart-wrapper">
                <Doughnut
                  data={planRevenueData}
                  options={{ ...doughnutOptions, plugins: { ...doughnutOptions.plugins, title: { display: true, text: 'Revenue by Subscription Plan' } } }}
                />
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
              <p>{formatCurrency(dashboardData.totalExpenses?.period || 0)}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card">
              <h3>Largest Category</h3>
              <p>{dashboardData.largestExpenseCategory?.category || 'N/A'}</p>
              <span className="card-subtitle">{formatCurrency(dashboardData.largestExpenseCategory?.total || 0)}</span>
            </div>
            <div className="dashboard-card">
              <h3>Budget Status</h3>
              <p>N/A</p>
              <span className="card-subtitle">Budget data needed</span>
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Expenses by Category</h3>
              <div className="chart-wrapper">
                <Bar
                  data={expenseCategoryData}
                  options={barChartOptions}
                />
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
                  {dashboardData.recentTransactions?.expenses?.length > 0 ? (
                    dashboardData.recentTransactions.expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{formatDate(expense.date)}</td>
                        <td>{expense.category}</td>
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
              <p>{dashboardData.activeSubscriptions || 0}</p>
              <span className="card-subtitle">Total</span>
            </div>
            <div className="dashboard-card">
              <h3>New Subscriptions</h3>
              <p>{dashboardData.newSubscriptions || 0}</p>
              {renderPeriodSubtitle()}
            </div>
            <div className="dashboard-card">
              <h3>Cancellations</h3>
              <p>{dashboardData.cancellations || 0}</p>
              {renderPeriodSubtitle()}
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Subscriptions by Plan</h3>
              <div className="chart-wrapper">
                <Doughnut
                  data={planSubscriptionData}
                  options={{ ...doughnutOptions, plugins: { ...doughnutOptions.plugins, title: { display: true, text: 'Subscriptions by Revenue' } } }}
                />
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
                  {dashboardData.subscriptionPlans?.length > 0 ? (
                    dashboardData.subscriptionPlans.map((plan) => (
                      <tr key={plan.id}>
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
              <button className="view-all-btn" onClick={() => window.location.href = '/dashboard/subscription-plans'}>Manage Subscription Plans</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialDashboard;
