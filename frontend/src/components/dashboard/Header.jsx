// frontend/src/components/dashboard/Header.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { NotificationBadge } from '../ui/AnimatedComponents';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Notification count (should come from backend in production)
  const notificationCount = 3; // Updated to match the image
  
  // Format role name for display (e.g., "financial_manager" -> "Financial Manager")
  const formatRoleName = (role) => {
    if (!role) return 'Guest';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get page title based on current path
  const getPageTitle = () => {
    // Remove leading and trailing slashes, then split path into segments
    const pathSegments = location.pathname.replace(/^\/|\/$/g, '').split('/');
    
    // If we're at the dashboard root
    if (pathSegments.length <= 1 || (pathSegments.length === 2 && pathSegments[1] === '')) {
      return 'Dashboard';
    }
    
    // Get the last segment of the path and format it
    const lastSegment = pathSegments[pathSegments.length - 1];
    // Convert kebab-case to Title Case (e.g., "financial-reports" -> "Financial Reports")
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h2>{getPageTitle()}</h2>
      </div>
      <div className="user-actions">
        <div className="user-info-modern">
          <span className="user-name">{user?.name || 'User'}</span>
          <span className="user-role-modern">{formatRoleName(user?.role)}</span>
        </div>
        <div className="header-divider" />
        {/* Help icon */}
        <Link to="/dashboard/help" className="header-icon-link" title="Help & Support">
          <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
        </Link>
        {/* Notification icon with fixed positioning */}
        <Link to="/dashboard/notifications" className="header-icon-link notification-container" title="Notifications">
          <FontAwesomeIcon icon={faBell} size="lg" />
          <NotificationBadge count={notificationCount} />
        </Link>
        <div className="header-divider" />
        <button 
          onClick={handleLogout} 
          className="logout-button-modern"
          aria-label="Logout from SmartBin"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;