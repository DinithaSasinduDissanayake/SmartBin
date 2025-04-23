// frontend/src/components/layouts/DashboardLayout.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../dashboard/Header';
import Sidebar from '../dashboard/Sidebar';
import SubscriptionPlans from '../financial/SubscriptionPlans';
import FinancialDashboard from '../financial/FinancialDashboard';
import ProfilePage from '../../pages/profile/ProfilePage';
// Import new staff components
import AttendanceTracker from '../staff/AttendanceTracker';
import PerformanceMetrics from '../staff/PerformanceMetrics';
import './DashboardLayout.css';

// Placeholder dashboard components for different roles
const DashboardHome = ({ user }) => {
  // If user is a financial manager, show financial dashboard
  if (user?.role === 'financial_manager') {
    return <FinancialDashboard />;
  }
  
  // Default dashboard for other roles
  return (
    <div className="dashboard-content">
      <h2>Dashboard Home</h2>
      <p>Welcome to your dashboard!</p>
    </div>
  );
};

// Inline NotFound component
const NotFoundPage = () => (
  <div className="dashboard-content" style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <Link to="/dashboard">Go back to Dashboard</Link>
  </div>
);

function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <main className="dashboard-content-area">
          <Routes>
            {/* Pass user to DashboardHome so it can conditionally render */}
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Customer routes */}
            {user?.role === 'customer' && (
              <>
                <Route path="subscriptions" element={<UserSubscriptionsPage />} />
                <Route path="documents" element={<UserDocumentsPage />} />
                {/* Add other customer-specific routes */}
              </>
            )}

            {/* Admin routes */}
            {user?.role === 'admin' && (
              <>
                <Route path="/users" element={<div className="dashboard-content"><h2>User Management</h2></div>} />
                <Route path="/statistics" element={<div className="dashboard-content"><h2>Statistics</h2></div>} />
                <Route path="/settings" element={<div className="dashboard-content"><h2>System Settings</h2></div>} />
                <Route path="/financial-overview" element={<FinancialDashboard />} /> {/* Add route for Admin */}
              </>
            )}
            
            {/* Financial manager routes */}
            {user?.role === 'financial_manager' && (
              <>
                <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                <Route path="/budget-allocation" element={<div className="dashboard-content"><h2>Budget Allocation</h2></div>} />
                <Route path="/salary" element={<div className="dashboard-content"><h2>Salary Management</h2></div>} />
                <Route path="/payments" element={<div className="dashboard-content"><h2>Payments</h2></div>} />
                <Route path="/financial-overview" element={<FinancialDashboard />} /> {/* Add route for Financial Manager */}
              </>
            )}
            
            {/* Staff routes */}
            {user?.role === 'staff' && (
              <>
                <Route path="/attendance" element={<AttendanceTracker />} /> 
                <Route path="/tasks" element={<div className="dashboard-content"><h2>Tasks</h2></div>} />
                <Route path="/performance" element={<PerformanceMetrics />} /> 
              </>
            )}
            
            {/* Fallback route */}
            <Route path="*" element={<NotFoundPage />} /> {/* Use the inline NotFound component */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;