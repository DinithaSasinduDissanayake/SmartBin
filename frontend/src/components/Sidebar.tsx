import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>User</h3>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/">Waste Recycle</Link>
        </li>
        <li>
          <Link to="/see-waste-materials">Profile</Link> {/* Updated to navigate to See Waste Materials */}
        </li>
        <li>
          <Link to="/my-orders">My Orders</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;