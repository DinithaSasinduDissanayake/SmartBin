// frontend/src/components/dashboard/Header.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { NotificationBadge } from '../ui/AnimatedComponents';

function Header() {
  const { user, logout } = useAuth();
  // Notification count (should come from backend in production)
  const notificationCount = 2;

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h2>SmartBin Dashboard</h2>
      </div>
      <div className="user-actions">
        <div className="user-info-modern">
          <span className="user-name">{user?.name || 'User'}</span>
          <span className="user-role-modern">{user?.role || 'Guest'}</span>
        </div>
        <div className="header-divider" />
        {/* Notification icon between user info and logout */}
        <Link to="/dashboard/notifications" className="header-notifications-link-modern">
          <FontAwesomeIcon icon={faBell} size="lg" />
          <NotificationBadge count={notificationCount} />
        </Link>
        <div className="header-divider" />
        <button onClick={logout} className="logout-button-modern">Logout</button>
      </div>
    </header>
  );
}

export default Header;