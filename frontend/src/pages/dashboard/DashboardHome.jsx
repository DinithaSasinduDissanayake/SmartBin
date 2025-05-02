import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../../contexts/AuthContext';
import FinancialDashboard from '../../components/financial/FinancialDashboard';
import FinancialManagerDashboard from '../../components/financial/manager/FinancialManagerDashboard';
import './DashboardHome.css';

// Placeholder service calls for summary data
// In a real implementation, these would call actual API endpoints
const fetchCustomerDashboardData = async () => {
  // Simulated API call response
  return {
    openComplaints: 2,
    nextPickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    subscriptionStatus: 'Active',
    subscriptionPlan: 'Premium',
    accountBalance: '$120.00',
    totalCollections: 24,
    upcomingPayment: {
      amount: '$49.99',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }
  };
};

const fetchStaffDashboardData = async () => {
  return {
    attendanceStatus: 'Checked In',
    assignedTasks: 5,
    completedTasks: 3,
    performanceRating: 4.7,
    upcomingPayday: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    lastPayAmount: '$1,200.00'
  };
};

const fetchAdminDashboardData = async () => {
  return {
    totalUsers: 450,
    activeSubscriptions: 320,
    openComplaints: 8,
    pendingPayrolls: 12,
    systemHealth: 'Good',
    recentSignups: 15,
    monthlyRevenue: '$24,500'
  };
};

const DashboardHome = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { role } = useAuth()?.user || user || {};
  const navigate = useNavigate(); // Initialize useNavigate
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        switch(role) {
          case 'customer':
            data = await fetchCustomerDashboardData();
            break;
          case 'staff':
            data = await fetchStaffDashboardData();
            break;
          case 'admin':
            data = await fetchAdminDashboardData();
            break;
          case 'financial_manager':
            // Financial managers see their dedicated dashboard
            // No need to fetch data here
            setLoading(false);
            return;
          default:
            throw new Error('Unknown user role');
        }
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchDashboardData();
    }
  }, [role]);

  if (!user || !role) {
    return <div className="dashboard-content"><p>Please log in to view your dashboard.</p></div>;
  }

  if (role === 'financial_manager') {
    return (
      <div className="dashboard-content">
        <FinancialManagerDashboard />
      </div>
    );
  }

  if (loading) {
    return <div className="dashboard-content"><p>Loading dashboard data...</p></div>;
  }

  if (error) {
    return <div className="dashboard-content"><p className="error-message">{error}</p></div>;
  }

  const renderCustomerDashboard = () => (
    <>
      <h2>Customer Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Subscription</h3>
          <p><strong>Status:</strong> {dashboardData.subscriptionStatus}</p>
          <p><strong>Plan:</strong> {dashboardData.subscriptionPlan}</p>
          <p><strong>Balance:</strong> {dashboardData.accountBalance}</p>
        </div>
        <div className="dashboard-card">
          <h3>Services</h3>
          <p><strong>Next Pickup:</strong> {dashboardData.nextPickupDate}</p>
          <p><strong>Total Collections:</strong> {dashboardData.totalCollections}</p>
        </div>
        <div className="dashboard-card">
          <h3>Support</h3>
          <p><strong>Open Complaints:</strong> {dashboardData.openComplaints}</p>
          <button className="btn secondary">Submit a Complaint</button>
        </div>
        <div className="dashboard-card">
          <h3>Next Payment</h3>
          <p><strong>Amount:</strong> {dashboardData.upcomingPayment.amount}</p>
          <p><strong>Due Date:</strong> {dashboardData.upcomingPayment.dueDate}</p>
        </div>
      </div>
    </>
  );

  const renderStaffDashboard = () => (
    <>
      <h2>Staff Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Attendance</h3>
          <p><strong>Status:</strong> <span className="status checked-in">{dashboardData.attendanceStatus}</span></p>
          <button className="btn secondary">Clock Out</button>
        </div>
        <div className="dashboard-card">
          <h3>Tasks</h3>
          <p><strong>Assigned:</strong> {dashboardData.assignedTasks}</p>
          <p><strong>Completed:</strong> {dashboardData.completedTasks}</p>
          <button className="btn secondary">View Tasks</button>
        </div>
        <div className="dashboard-card">
          <h3>Performance</h3>
          <p><strong>Rating:</strong> {dashboardData.performanceRating}/5.0</p>
          <button className="btn secondary">View Details</button>
        </div>
        <div className="dashboard-card">
          <h3>Payroll</h3>
          <p><strong>Next Payday:</strong> {dashboardData.upcomingPayday}</p>
          <p><strong>Last Pay:</strong> {dashboardData.lastPayAmount}</p>
          <button className="btn secondary">View Payslips</button>
        </div>
      </div>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      <h2>Admin Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Users</h3>
          <p><strong>Total Users:</strong> {dashboardData.totalUsers}</p>
          <p><strong>Active Subscriptions:</strong> {dashboardData.activeSubscriptions}</p>
          <p><strong>Recent Signups:</strong> {dashboardData.recentSignups} in the last 30 days</p>
        </div>
        <div className="dashboard-card">
          <h3>Support</h3>
          <p><strong>Open Complaints:</strong> {dashboardData.openComplaints}</p>
          <button className="btn secondary">Manage Complaints</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="dashboard-content">
      {role === 'customer' && renderCustomerDashboard()}
      {role === 'staff' && renderStaffDashboard()}
      {role === 'admin' && renderAdminDashboard()}
    </div>
  );
};

export default DashboardHome;