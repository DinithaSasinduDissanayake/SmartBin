// frontend/src/components/dashboard/Sidebar.jsx
import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faFacebook, 
  faInstagram, 
  faTwitter
} from "@fortawesome/free-brands-svg-icons";

import {
  faGaugeHigh,
  faUser,
  faFileLines,
  faMoneyBillTransfer,
  faCreditCard,
  faMoneyBill,
  faTruck,
  faRecycle,
  faCalendarDays,
  faScroll,
  faFileSignature,
  faUsers,
  faChartLine,
  faCog,
  faClipboardList,
  faListCheck,
  faTrophy,
  faBars,
  faBell,
  faSignOutAlt,
  faBuilding,
  faServer // Add an icon for system logs
} from "@fortawesome/free-solid-svg-icons";
import { NotificationBadge } from '../ui/AnimatedComponents';

library.add(
  faFacebook, 
  faInstagram, 
  faTwitter,
  faGaugeHigh,
  faUser,
  faFileLines,
  faMoneyBillTransfer,
  faCreditCard,
  faMoneyBill,
  faTruck,
  faRecycle,
  faCalendarDays,
  faScroll,
  faFileSignature,
  faUsers,
  faChartLine,
  faCog,
  faClipboardList,
  faListCheck,
  faTrophy,
  faBars,
  faBell,
  faSignOutAlt,
  faBuilding,
  faServer
);

import './Sidebar.css';

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // Get first letter of name for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  // Format role name for display (e.g., "financial_manager" -> "Financial Manager")
  const formatRoleName = (role) => {
    if (!role) return 'User';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Improved active path checking to handle nested routes
  const isActivePath = useCallback((path) => {
    // Exact match
    if (location.pathname === path) return true;
    
    // Special case for dashboard home
    if (path === '/dashboard' && location.pathname !== '/dashboard') {
      return false;
    }
    
    // Check if current path starts with the navigation item path (for nested routes)
    return path !== '/dashboard' && location.pathname.startsWith(path);
  }, [location.pathname]);
  
  // Define navigation items by role
  const getNavItems = () => {
    const roleSpecificItems = {
      financial_manager: [
        { section: 'MAIN', items: [
          { path: '/dashboard', label: 'Dashboard', icon: faGaugeHigh },
          { path: '/dashboard/profile', label: 'My Profile', icon: faUser },
        ]},
        { section: 'FINANCE', items: [
          { path: '/dashboard/financial-overview', label: 'Financial Dashboard', icon: faChartLine },
          { path: '/dashboard/subscription-plans', label: 'Subscription Plans', icon: faFileLines },
          { path: '/dashboard/budget-allocation', label: 'Budget Allocation', icon: faMoneyBillTransfer },
          { path: '/dashboard/payments', label: 'Payments', icon: faCreditCard },
          { path: '/dashboard/financial-reports', label: 'Financial Reports', icon: faScroll },
        ]},
        { section: 'STAFF', items: [
          { path: '/dashboard/payroll', label: 'Payroll Management', icon: faMoneyBill },
        ]},
      ],
      customer: [
        { section: 'MAIN', items: [
          { path: '/dashboard', label: 'Dashboard', icon: faGaugeHigh },
          { path: '/dashboard/profile', label: 'My Profile', icon: faUser },
        ]},
        { section: 'SERVICES', items: [
          { path: '/dashboard/pickup-form', label: 'Request Pickup', icon: faTruck },
          { path: '/dashboard/my-bin-details', label: 'My Bin Details', icon: faBuilding },
          { path: '/dashboard/pickup-requests', label: 'Pickup Requests', icon: faClipboardList },
          { path: '/dashboard/available-garbage', label: 'Available Garbage', icon: faRecycle },
        ]},
        { section: 'HISTORY', items: [
          { path: '/dashboard/collection-history', label: 'Collection History', icon: faCalendarDays },
          { path: '/dashboard/financial-history', label: 'Financial History', icon: faMoneyBill },
          { path: '/dashboard/purchase-history', label: 'Purchase History', icon: faScroll },
        ]},
        { section: 'SUPPORT', items: [
          { path: '/dashboard/complaints', label: 'Complaints', icon: faFileSignature },
        ]},
      ],
      admin: [
        { section: 'MAIN', items: [
          { path: '/dashboard', label: 'Dashboard', icon: faGaugeHigh },
          { path: '/dashboard/profile', label: 'My Profile', icon: faUser },
        ]},
        { section: 'ADMINISTRATION', items: [
          { path: '/dashboard/users', label: 'User Management', icon: faUsers },
          { path: '/dashboard/statistics', label: 'Statistics', icon: faChartLine },
          { path: '/dashboard/complaints', label: 'Manage Complaints', icon: faFileSignature },
          { path: '/dashboard/pickup-requests', label: 'Pickup Requests', icon: faTruck },
          { path: '/dashboard/attendance-reports', label: 'Attendance Reports', icon: faClipboardList },
          { path: '/dashboard/performance-reports', label: 'Performance Reports', icon: faTrophy },
          { path: '/dashboard/settings', label: 'System Settings', icon: faCog },
        ]},
      ],
      staff: [
        { section: 'MAIN', items: [
          { path: '/dashboard', label: 'Dashboard', icon: faGaugeHigh },
          { path: '/dashboard/profile', label: 'My Profile', icon: faUser },
        ]},
        { section: 'MY WORK', items: [
          { path: '/dashboard/attendance', label: 'Attendance', icon: faClipboardList },
          { path: '/dashboard/tasks', label: 'Tasks', icon: faListCheck },
          { path: '/dashboard/my-payslips', label: 'My Payslips', icon: faMoneyBill },
          { path: '/dashboard/performance', label: 'Performance', icon: faTrophy },
        ]},
        { section: 'SUPPORT', items: [
          { path: '/dashboard/complaints', label: 'Complaints', icon: faFileSignature },
        ]},
      ]
    };

    // Default to financial_manager if role not found or undefined
    return roleSpecificItems[user?.role || 'financial_manager'] || roleSpecificItems.financial_manager;
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <Link to="/" className="brand-link"> {/* Changed Link destination to / */}
            <div className="brand">
              <FontAwesomeIcon icon={faRecycle} className="brand-icon" />
              <span className="brand-name">SmartBin</span>
            </div>
          </Link>
        )}
        <button 
          className="toggle-button" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
      
      {user && (
        <div className="user-profile">
          <div className="avatar" title={user?.name || 'User'}>
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div className="user-info">
              <h3 className="name">{user?.name || 'User'}</h3>
              <p className="role">{formatRoleName(user?.role)}</p>
            </div>
          )}
        </div>
      )}

      <nav className="navigation">
        {navItems.map((section, idx) => (
          <div key={idx} className="nav-section">
            {!collapsed && <h3 className="section-title">{section.section}</h3>}
            <ul className="nav-items">
              {section.items.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link 
                    to={item.path}
                    className={isActivePath(item.path) ? 'active' : ''}
                    title={collapsed ? item.label : undefined}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout} title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
          {!collapsed && <span>Logout</span>}
        </button>
        
        {!collapsed && (
          <div className="social-links">
            <a href="#" aria-label="Facebook" title="Facebook"><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="#" aria-label="Instagram" title="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="#" aria-label="Twitter" title="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;


