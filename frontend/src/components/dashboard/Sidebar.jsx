// frontend/src/components/dashboard/Sidebar.jsx
import React, { useState } from 'react';
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
  faBell
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
  faBell
);

import './Sidebar.css';

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // Get first letter of name for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
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
          { path: '/dashboard/pickup-requests', label: 'Pickup Requests', icon: faTruck },
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
          { path: '/dashboard/attendance-reports', label: 'Attendance Reports', icon: faClipboardList },
          { path: '/dashboard/performance-reports', label: 'Performance Reports', icon: faTrophy },
          { path: '/dashboard/settings', label: 'System Settings', icon: faCog },
        ]},
        { section: 'FINANCE', items: [
          { path: '/dashboard/financial-overview', label: 'Financial Dashboard', icon: faChartLine },
          { path: '/dashboard/subscription-plans', label: 'Subscription Plans', icon: faFileLines },
          { path: '/dashboard/payroll', label: 'Payroll Management', icon: faMoneyBill },
          { path: '/dashboard/financial-reports', label: 'Financial Reports', icon: faScroll },
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

  const navItems = getNavItems();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="brand">
            <FontAwesomeIcon icon={faRecycle} className="brand-icon" />
            <span className="brand-name">SmartBin</span>
          </div>
        )}
        <button 
          className="toggle-button" 
          onClick={() => setCollapsed(!collapsed)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
      
      {user && (
        <div className="user-profile">
          <div className="avatar">
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div className="user-info">
              <h3 className="name">{user?.name || 'Financial Manager'}</h3>
              <p className="role">{(user?.role || 'financial_manager').replace('_', ' ')}</p>
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
                    className={location.pathname === item.path ? 'active' : ''}
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
        {/* Notification icon moved to header, so remove from sidebar */}
        {!collapsed && (
          <div className="social-links">
            <a href="#"><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="#"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;


