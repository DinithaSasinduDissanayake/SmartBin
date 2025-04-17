import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
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
  Legend
} from 'chart.js';
import './FinancialDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FinancialDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('month'); // 'month', 'quarter', 'year'
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'revenue', 'expenses', 'subscriptions'
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
                const response = await api.get(`/financials/dashboard?range=${dateRange}`);
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
    }, [user, dateRange]); // Re-fetch when user or date range changes

    // Mock data for the charts - will be replaced with actual data
    const mockRevenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue',
                data: [5000, 6200, 7500, 6800, 7200, 8100],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4
            },
            {
                label: 'Expenses',
                data: [4200, 4500, 5100, 5300, 4800, 5500],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4
            }
        ]
    };
    
    const mockPlanData = {
        labels: ['Basic', 'Standard', 'Premium', 'Business'],
        datasets: [{
            data: [30, 50, 20, 10],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    const mockExpensesData = {
        labels: ['Fuel', 'Maintenance', 'Salaries', 'Utilities', 'Equipment', 'Other'],
        datasets: [{
            label: 'Expenses by Category',
            data: [1200, 800, 2500, 600, 1100, 300],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)'
            ],
            borderWidth: 1
        }]
    };
    
    // Chart options
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Revenue vs Expenses Trend'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };
    
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Revenue by Subscription Plan'
            }
        }
    };
    
    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Expenses by Category'
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading Financial Dashboard...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!dashboardData) {
        return <div className="loading">No data available.</div>;
    }
    
    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

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
                            <option value="quarter">This Quarter</option>
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
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    <div className="dashboard-grid">
                        <div className="dashboard-card highlight">
                            <h3>Total Revenue</h3>
                            <p>{formatCurrency(dashboardData.totalRevenue?.month || 0)}</p>
                            <span className="card-subtitle">
                                {dateRange === 'month' ? 'This Month' : 
                                 dateRange === 'quarter' ? 'This Quarter' : 
                                 'This Year'}
                            </span>
                        </div>
                        <div className="dashboard-card highlight">
                            <h3>Total Expenses</h3>
                            <p>{formatCurrency(dashboardData.totalExpenses?.month || 0)}</p>
                            <span className="card-subtitle">
                                {dateRange === 'month' ? 'This Month' : 
                                 dateRange === 'quarter' ? 'This Quarter' : 
                                 'This Year'}
                            </span>
                        </div>
                        <div className="dashboard-card highlight">
                            <h3>Net Profit</h3>
                            <p>{formatCurrency((dashboardData.totalRevenue?.month || 0) - (dashboardData.totalExpenses?.month || 0))}</p>
                            <span className="card-subtitle">
                                {dateRange === 'month' ? 'This Month' : 
                                 dateRange === 'quarter' ? 'This Quarter' : 
                                 'This Year'}
                            </span>
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
                            <span className="card-subtitle">From All Plans</span>
                        </div>
                    </div>
                    
                    <div className="dashboard-charts">
                        <div className="chart-container">
                            <h3>Revenue vs Expenses</h3>
                            <div className="chart-wrapper">
                                <Line 
                                    data={mockRevenueData} 
                                    options={lineChartOptions}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
                <>
                    <div className="dashboard-grid">
                        <div className="dashboard-card highlight">
                            <h3>Total Revenue</h3>
                            <p>{formatCurrency(dashboardData.totalRevenue?.month || 0)}</p>
                            <span className="card-subtitle">This Month</span>
                        </div>
                        <div className="dashboard-card">
                            <h3>Revenue Growth</h3>
                            <p>+8.5%</p>
                            <span className="card-subtitle">From Last Month</span>
                        </div>
                        <div className="dashboard-card">
                            <h3>Average Revenue</h3>
                            <p>{formatCurrency(dashboardData.totalRevenue?.month / 30 || 0)}</p>
                            <span className="card-subtitle">Per Day</span>
                        </div>
                    </div>
                    
                    <div className="dashboard-charts">
                        <div className="chart-container">
                            <h3>Revenue by Subscription Plan</h3>
                            <div className="chart-wrapper">
                                <Doughnut 
                                    data={mockPlanData} 
                                    options={doughnutOptions}
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
                                    {/* Will be replaced with actual transactions */}
                                    <tr>
                                        <td>2025-04-15</td>
                                        <td>John Smith</td>
                                        <td>Premium Plan - Monthly</td>
                                        <td>{formatCurrency(99.99)}</td>
                                        <td><span className="status completed">Completed</span></td>
                                    </tr>
                                    <tr>
                                        <td>2025-04-14</td>
                                        <td>Sarah Johnson</td>
                                        <td>Standard Plan - Annual</td>
                                        <td>{formatCurrency(899.88)}</td>
                                        <td><span className="status completed">Completed</span></td>
                                    </tr>
                                    <tr>
                                        <td>2025-04-14</td>
                                        <td>Michael Wilson</td>
                                        <td>Basic Plan - Monthly</td>
                                        <td>{formatCurrency(49.99)}</td>
                                        <td><span className="status pending">Pending</span></td>
                                    </tr>
                                    <tr>
                                        <td>2025-04-13</td>
                                        <td>Emily Davis</td>
                                        <td>Premium Plan - Monthly</td>
                                        <td>{formatCurrency(99.99)}</td>
                                        <td><span className="status completed">Completed</span></td>
                                    </tr>
                                    <tr>
                                        <td>2025-04-12</td>
                                        <td>David Brown</td>
                                        <td>Business Plan - Quarterly</td>
                                        <td>{formatCurrency(599.97)}</td>
                                        <td><span className="status completed">Completed</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="view-all">
                            <button className="view-all-btn">View All Transactions</button>
                        </div>
                    </div>
                </>
            )}
            
            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
                <>
                    <div className="dashboard-grid">
                        <div className="dashboard-card highlight">
                            <h3>Total Expenses</h3>
                            <p>{formatCurrency(dashboardData.totalExpenses?.month || 0)}</p>
                            <span className="card-subtitle">This Month</span>
                        </div>
                        <div className="dashboard-card">
                            <h3>Largest Category</h3>
                            <p>Salaries</p>
                            <span className="card-subtitle">{formatCurrency(2500)}</span>
                        </div>
                        <div className="dashboard-card">
                            <h3>Budget Status</h3>
                            <p>85%</p>
                            <span className="card-subtitle">of Monthly Budget</span>
                        </div>
                    </div>
                    
                    <div className="dashboard-charts">
                        <div className="chart-container">
                            <h3>Expenses by Category</h3>
                            <div className="chart-wrapper">
                                <Bar 
                                    data={mockExpensesData} 
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Will be replaced with actual expenses */}
                                    <tr>
                                        <td>2025-04-15</td>
                                        <td>Fuel</td>
                                        <td>Weekly fleet refueling</td>
                                        <td>{formatCurrency(350)}</td>
                                    </tr>
                                    <tr>
                                        <td>2025-04-14</td>
                                        <td>Maintenance</td>
                                        <td>Vehicle service - Truck #103</td>
                                        <td>{formatCurrency(250)}</td>
                                    </tr>
                                    <tr>
                                        <td>2025-04-13</td>
                                        <td>Utilities</td>
                                        <td>Electricity bill - Main facility</td>
                                        <td>{formatCurrency(420)}</td>
                                    </tr>
                                    <tr>
                                        <td>2025-04-12</td>
                                        <td>Equipment</td>
                                        <td>New sorting machine parts</td>
                                        <td>{formatCurrency(780)}</td>
                                    </tr>
                                    <tr>
                                        <td>2025-04-10</td>
                                        <td>Salaries</td>
                                        <td>Mid-month advance payments</td>
                                        <td>{formatCurrency(1200)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="view-all">
                            <button className="view-all-btn">View All Expenses</button>
                        </div>
                    </div>
                </>
            )}
            
            {/* Subscriptions Tab */}
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
                            <p>15</p>
                            <span className="card-subtitle">This Month</span>
                        </div>
                        <div className="dashboard-card">
                            <h3>Cancellations</h3>
                            <p>3</p>
                            <span className="card-subtitle">This Month</span>
                        </div>
                    </div>
                    
                    <div className="dashboard-charts">
                        <div className="chart-container">
                            <h3>Subscriptions by Plan</h3>
                            <div className="chart-wrapper">
                                <Doughnut 
                                    data={mockPlanData} 
                                    options={doughnutOptions}
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
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Basic</td>
                                        <td>{formatCurrency(49.99)}</td>
                                        <td>Monthly</td>
                                        <td>45</td>
                                        <td>{formatCurrency(2249.55)}</td>
                                    </tr>
                                    <tr>
                                        <td>Standard</td>
                                        <td>{formatCurrency(79.99)}</td>
                                        <td>Monthly</td>
                                        <td>68</td>
                                        <td>{formatCurrency(5439.32)}</td>
                                    </tr>
                                    <tr>
                                        <td>Premium</td>
                                        <td>{formatCurrency(99.99)}</td>
                                        <td>Monthly</td>
                                        <td>27</td>
                                        <td>{formatCurrency(2699.73)}</td>
                                    </tr>
                                    <tr>
                                        <td>Business</td>
                                        <td>{formatCurrency(199.99)}</td>
                                        <td>Monthly</td>
                                        <td>12</td>
                                        <td>{formatCurrency(2399.88)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3"><strong>Total</strong></td>
                                        <td><strong>152</strong></td>
                                        <td><strong>{formatCurrency(12788.48)}</strong></td>
                                    </tr>
                                </tfoot>
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
