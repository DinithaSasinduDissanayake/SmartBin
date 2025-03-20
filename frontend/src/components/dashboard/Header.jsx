// frontend/src/components/dashboard/Header.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h2>SmartBin Dashboard</h2>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <span>{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button onClick={logout} className="logout-button">Logout</button>
      </div>
    </header>
  );
}

export default Header;