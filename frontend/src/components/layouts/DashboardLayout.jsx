// frontend/src/components/layouts/DashboardLayout.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../dashboard/Header';
import Sidebar from '../dashboard/Sidebar';
import './DashboardLayout.css';

// Placeholder dashboard components
const DashboardHome = () => <div className="dashboard-content"><h2>Dashboard Home</h2><p>Welcome to your dashboard!</p></div>;
const Profile = () => <div className="dashboard-content"><h2>My Profile</h2><p>View and edit your profile information.</p></div>;
const NotFound = () => <div className="dashboard-content"><h2>404</h2><p>Page not found</p></div>;

function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <main className="dashboard-content-area">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Add role-specific routes here */}
            {user?.role === 'Resident/Garbage_Buyer' && (
              <>
                <Route path="/collection-history" element={<div className="dashboard-content"><h2>Collection History</h2></div>} />
                <Route path="/financial-history" element={<div className="dashboard-content"><h2>Financial History</h2></div>} />
                <Route path="/complaints" element={<div className="dashboard-content"><h2>Complaints</h2></div>} />
                <Route path="/pickup-requests" element={<div className="dashboard-content"><h2>Pickup Requests</h2></div>} />
                <Route path="/available-garbage" element={<div className="dashboard-content"><h2>Available Garbage</h2></div>} />
                <Route path="/purchase-history" element={<div className="dashboard-content"><h2>Purchase History</h2></div>} />
              </>
            )}
            
            {/* Financial manager routes */}
            {user?.role === 'financial_manager' && (
              <>
                <Route path="/revenue" element={<div className="dashboard-content"><h2>Revenue Management</h2></div>} />
                <Route path="/expenses" element={<div className="dashboard-content"><h2>Expense Management</h2></div>} />
                <Route path="/reports" element={<div className="dashboard-content"><h2>Financial Reports</h2></div>} />
                <Route path="/add-plans" element={<div className="dashboard-content"><h2>Add Plans</h2></div>} />
              </>
            )}
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;