import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/admin/AdminSidebar';
import RecycleForm from './components/RecycleForm';
import RequestList from './components/RequestList';
import MyOrderDetails from './pages/MyOrderDetails';
import UpdateOrder from './pages/UpdateOrder';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRecyclingRequests from './components/admin/AdminRecyclingRequests';
import AdminRequestDetails from './components/admin/AdminRequestDetails'; // Import the new component
// import WasteMaterials from './components/admin/WasteMaterials'; // Import new admin page
//import SeeWasteMaterials from './pages/SeeWasteMaterials'; // Import new user page

import './App.css';

const App: React.FC = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {isAdminRoute ? <AdminSidebar /> : <Sidebar />}
      
      <div className="main-content">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<RecycleForm />} />
          <Route path="/my-orders" element={<RequestList />} />
          <Route path="/order-details/:id" element={<MyOrderDetails />} />
          <Route path="/update-order/:id" element={<UpdateOrder />} />
          {/* <Route path="/see-waste-materials" element={<SeeWasteMaterials />} /> New user route */}

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/requests" element={<AdminRecyclingRequests />} />
          <Route path="/admin/request/:id" element={<AdminRequestDetails />} /> {/* Updated route */}
          {/* <Route path="/admin/waste-materials" element={<WasteMaterials />} /> New admin route */}
        </Routes>
      </div>
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;