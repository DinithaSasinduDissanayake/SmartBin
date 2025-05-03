// frontend/src/components/layouts/DashboardLayout.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from '../dashboard/Sidebar';
// Removed DashboardHome import as it's replaced by role-specific dashboards
import ProfilePage from '../../pages/profile/ProfilePage';

// Import role-specific dashboards
import AdminDashboard from '../../pages/dashboard/AdminDashboard';
import CustomerDashboard from '../../pages/dashboard/CustomerDashboard';
import FinancialManagerDashboard from '../../pages/dashboard/FinancialManagerDashboard';
import StaffDashboard from '../../pages/dashboard/StaffDashboard';

// ... other imports remain the same ...
import AdminPayrollPage from '../../pages/payroll/AdminPayrollPage';
import StaffPayslipViewPage from '../../pages/payroll/StaffPayslipViewPage';
import MyComplaintsPage from '../../pages/complaints/MyComplaintsPage';
import AllComplaintsPage from '../../pages/complaints/AllComplaintsPage';
import UserSubscriptionsPage from '../../pages/subscriptions/UserSubscriptionsPage';
import UserDocumentsPage from '../../pages/documents/UserDocumentsPage';
// Re-add the FinancialDashboard import for the financial-overview route
import FinancialDashboard from '../../components/financial/FinancialDashboard';
import SubscriptionPlans from '../../components/financial/SubscriptionPlans'; // Keep this if it's a separate page/component used elsewhere
import FinancialReportsPage from '../../pages/reports/FinancialReportsPage';
import AttendanceReportsPage from '../../pages/reports/AttendanceReportsPage';
import PerformanceReportsPage from '../../pages/reports/PerformanceReportsPage';
import BudgetAllocationPage from '../../pages/budget/BudgetAllocationPage';
import PaymentsPage from '../../pages/payments/PaymentsPage';
import UserManagementPage from '../../pages/admin/UserManagementPage';
import StatisticsPage from '../../pages/statistics/StatisticsPage';
import SystemSettingsPage from '../../pages/admin/SystemSettingsPage';
// Import the PickupRequests component
import PickupRequests from '../../components/PickupRequests';
import PickupForm from '../../components/PickupForm';
import MyBinDetails from '../../components/MyBinDetails';
import PickupDetails from '../../components/PickupDetails';
import PickupRequestDetails from '../../components/PickupRequestDetails';

import './DashboardLayout.css';

// Helper component to render the correct dashboard based on role
const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    // Should ideally not happen due to ProtectedRoute, but good practice
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    case 'financial_manager':
      return <FinancialManagerDashboard />;
    case 'staff':
      return <StaffDashboard />;
    default:
      // Fallback or redirect if role is unknown/unexpected
      return <Navigate to="/login" />;
  }
};

function DashboardLayout() {
  const { user } = useAuth(); // Keep user context for other routes if needed

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <main className="dashboard-content-area">
          <Routes>
            {/* Main dashboard route now renders based on role */}
            <Route path="/" element={<RoleBasedDashboard />} />

            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Common routes for all users */}
            <Route path="/pickup-requests" element={<PickupRequests />} />
            
            {/* Customer-specific pickup management */}
            {user?.role === 'customer' && (
              <>
                <Route path="/pickup-form" element={<PickupForm />} />
                <Route path="/my-bin-details" element={<MyBinDetails />} />
                <Route path="/pickup/:id" element={<PickupDetails />} />
              </>
            )}

            {/* Admin/staff pickup request details */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <Route path="/pickup-request/:id" element={<PickupRequestDetails />} />
            )}

            {/* Common routes accessible by financial managers and admin */}
            {(user?.role === 'financial_manager' || user?.role === 'admin') && (
              <>
                <Route path="/financial-overview" element={<FinancialDashboard />} />
              </>
            )}

            {/* Customer specific routes (if any remain outside the dashboard) */}
            {user?.role === 'customer' && (
              <>
                {/* Example: Keep complaints if it's a separate page */}
                <Route path="/complaints" element={<MyComplaintsPage />} />
                <Route path="/subscriptions" element={<UserSubscriptionsPage />} />
                <Route path="/documents" element={<UserDocumentsPage />} />
                {/* Add other customer-specific routes here */}
              </>
            )}

            {/* Financial Manager specific routes (if any remain outside the dashboard) */}
            {user?.role === 'financial_manager' && (
              <>
                {/* Keep routes that are NOT part of the main FM dashboard tabs */}
                <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                <Route path="/budget-allocation" element={<BudgetAllocationPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/payment-processing" element={<div className="dashboard-content"><h2>Payment Processing</h2></div>} />
                <Route path="/financial-reports" element={<FinancialReportsPage />} />
                <Route path="/payroll" element={<AdminPayrollPage />} />
                {/* Add other FM-specific routes here */}
              </>
            )}

            {/* Admin specific routes (if any remain outside the dashboard) */}
            {user?.role === 'admin' && (
              <>
                {/* Keep routes that are NOT part of the main Admin dashboard tabs */}
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/settings" element={<SystemSettingsPage />} />
                <Route path="/complaints" element={<AllComplaintsPage />} />
                <Route path="/payroll" element={<AdminPayrollPage />} />
                <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                <Route path="/budget-allocation" element={<BudgetAllocationPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/financial-reports" element={<FinancialReportsPage />} />
                <Route path="/attendance-reports" element={<AttendanceReportsPage />} />
                <Route path="/performance-reports" element={<PerformanceReportsPage />} />
                {/* Add other Admin-specific routes here */}
              </>
            )}

            {/* Staff specific routes (if any remain outside the dashboard) */}
            {user?.role === 'staff' && (
              <>
                {/* Keep routes that are NOT part of the main Staff dashboard tabs */}
                <Route path="/my-payslips" element={<StaffPayslipViewPage />} />
                <Route path="/my-performance" element={<div className="dashboard-content"><h2>My Performance</h2></div>} />
                <Route path="/complaints" element={<AllComplaintsPage />} />
                {/* Add other Staff-specific routes here */}
              </>
            )}

            {/* Add a catch-all or Not Found route within the dashboard if needed */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;