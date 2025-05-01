import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AdminSidebar.css';

const AdminSidebar: React.FC = () => {
  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h3>Admin</h3>
      </div>
      <ul className="admin-sidebar-menu">
        <li>
          <Link to="/admin/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/requests">Recycling Requests</Link>
        </li>
        <li>
          <Link to="/admin/waste-materials">Waste Materials</Link> {/* New tab */}
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;