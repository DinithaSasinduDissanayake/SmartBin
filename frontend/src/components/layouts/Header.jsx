// frontend/src/components/layouts/Header.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { NotificationBadge } from '../ui/AnimatedComponents';

/**
 * Header component for the dashboard layout
 * Displays user avatar, name, role, and notifications
 */
const Header = () => {
  const { user } = useAuth();

  // Format role for display (e.g., financial_manager -> Financial Manager)
  const formatRole = (role) => {
    if (!role) return 'Guest';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-right">
          <div className="header-user-section">
            <div className="profile-pic">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{formatRole(user?.role)}</span>
            </div>
          </div>
          <div className="notification-bell" style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faBell} size="lg" />
            <NotificationBadge count={3} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;