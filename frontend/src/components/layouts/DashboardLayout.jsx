// frontend/src/components/layouts/DashboardLayout.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from '../dashboard/Sidebar';
import DashboardHome from '../../pages/dashboard/DashboardHome';
import ProfilePage from '../../pages/profile/ProfilePage';

// Import payroll components
import AdminPayrollPage from '../../pages/payroll/AdminPayrollPage';
import StaffPayslipViewPage from '../../pages/payroll/StaffPayslipViewPage';

// Import complaint components
import MyComplaintsPage from '../../pages/complaints/MyComplaintsPage';
import AllComplaintsPage from '../../pages/complaints/AllComplaintsPage';

// Import subscription and document components
import UserSubscriptionsPage from '../../pages/subscriptions/UserSubscriptionsPage';
import UserDocumentsPage from '../../pages/documents/UserDocumentsPage';

// Import financial components
import FinancialDashboard from '../../components/financial/FinancialDashboard';
import SubscriptionPlans from '../../components/financial/SubscriptionPlans';
import FinancialReportsPage from '../../pages/reports/FinancialReportsPage';
import AttendanceReportsPage from '../../pages/reports/AttendanceReportsPage';
import PerformanceReportsPage from '../../pages/reports/PerformanceReportsPage';
import BudgetAllocationPage from '../../pages/budget/BudgetAllocationPage';
import PaymentsPage from '../../pages/payments/PaymentsPage';

// Import Admin specific pages
import UserManagementPage from '../../pages/admin/UserManagementPage';
import StatisticsPage from '../../pages/statistics/StatisticsPage';
import SystemSettingsPage from '../../pages/admin/SystemSettingsPage'; // Import the System Settings page

import './DashboardLayout.css';

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
                <Route path="/complaints" element={<MyComplaintsPage />} /> 
                <Route path="/subscriptions" element={<UserSubscriptionsPage />} />
                <Route path="/documents" element={<UserDocumentsPage />} />
              </>
            )}

            {/* Financial Manager routes */}
            {user?.role === 'financial_manager' && (
              <>
                <Route path="/financial-overview" element={<FinancialDashboard />} />
                <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                <Route path="/budget-allocation" element={<BudgetAllocationPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/payment-processing" element={<div className="dashboard-content"><h2>Payment Processing</h2></div>} />
                <Route path="/financial-reports" element={<FinancialReportsPage />} />
                <Route path="/payroll" element={<AdminPayrollPage />} />
              </>
            )}

            {/* Admin routes */}
            {user?.role === 'admin' && (
              <>
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/settings" element={<SystemSettingsPage />} />
                <Route path="/complaints" element={<AllComplaintsPage />} />
                <Route path="/payroll" element={<AdminPayrollPage />} />
                <Route path="/financial-overview" element={<FinancialDashboard />} />
                <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                <Route path="/budget-allocation" element={<BudgetAllocationPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/financial-reports" element={<FinancialReportsPage />} />
                <Route path="/attendance-reports" element={<AttendanceReportsPage />} />
                <Route path="/performance-reports" element={<PerformanceReportsPage />} />
              </>
            )}

            {/* Staff routes */}
            {user?.role === 'staff' && (
              <>
                <Route path="/my-payslips" element={<StaffPayslipViewPage />} />
                <Route path="/my-performance" element={<div className="dashboard-content"><h2>My Performance</h2></div>} />
                <Route path="/complaints" element={<AllComplaintsPage />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;