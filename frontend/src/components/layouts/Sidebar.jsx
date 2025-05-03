// frontend/src/components/dashboard/Sidebar.jsx
import React from 'react';
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
  faFileLines,
  faMoneyBillTransfer,
  faUser,
  faCreditCard,
  faChartLine,
  faCalendarDays,
  faMoneyBill,
  faFileSignature,
  faTruck,
  faRecycle,
  faScroll,
  faUsers,
  faCog,
  faClipboardList,
  faListCheck,
  faTrophy,
  faTachometerAlt,
  faTrash, // Added for bin details
  faMapMarkerAlt // Added for pickup request form
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faFacebook, 
  faInstagram, 
  faTwitter,
  faGaugeHigh,
  faFileLines,
  faMoneyBillTransfer,
  faUser,
  faCreditCard,
  faChartLine,
  faCalendarDays,
  faMoneyBill,
  faFileSignature,
  faTruck,
  faRecycle,
  faScroll,
  faUsers,
  faCog,
  faClipboardList,
  faListCheck,
  faTrophy,
  faTachometerAlt,
  faTrash, // Add the new icon to the library
  faMapMarkerAlt // Add the new icon to the library
);

import './Sidebar.css';

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  // Define navigation items with FontAwesome icons
  const getNavItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: faGaugeHigh },
      { path: '/dashboard/profile', label: 'My Profile', icon: faUser },
    ];

    const roleSpecificItems = {
      customer: [ // Updated role name
        { path: '/dashboard/collection-history', label: 'Collection History', icon: faCalendarDays },
        { path: '/dashboard/financial-history', label: 'Financial History', icon: faMoneyBill },
        { path: '/dashboard/complaints', label: 'Complaints', icon: faFileSignature },
        { path: '/my-bin-details', label: 'My Bin Details', icon: faTrash }, // Updated to link to new component
        { path: '/request-pickup', label: 'Request Pickup', icon: faMapMarkerAlt }, // New entry for pickup request form
        { path: '/dashboard/available-garbage', label: 'Available Garbage', icon: faRecycle },
        { path: '/dashboard/purchase-history', label: 'Purchase History', icon: faScroll },
      ],
      admin: [
        { path: '/dashboard/financial-overview', label: 'Financial Overview', icon: faTachometerAlt },
        { path: '/dashboard/users', label: 'User Management', icon: faUsers },
        { path: '/pickup-requests', label: 'Pickup Requests', icon: faTruck }, // Added link to pickup requests admin panel
        { path: '/dashboard/statistics', label: 'Statistics', icon: faChartLine },
        { path: '/dashboard/settings', label: 'System Settings', icon: faCog },
      ],
      // Maintaining the database role name format (with underscore)
      financial_manager: [
        { path: '/dashboard/financial-overview', label: 'Financial Overview', icon: faTachometerAlt },
        { path: '/dashboard/subscription-plans', label: 'Subscription Plans', icon: faFileLines },
        { path: '/dashboard/budget-allocation', label: 'Budget Allocation', icon: faMoneyBillTransfer },
        { path: '/dashboard/salary', label: 'Salary', icon: faUser },
        { path: '/dashboard/payments', label: 'Payments', icon: faCreditCard },
      ],
      staff: [
        { path: '/dashboard/attendance', label: 'Attendance', icon: faClipboardList },
        { path: '/dashboard/tasks', label: 'Tasks', icon: faListCheck },
        { path: '/dashboard/performance', label: 'Performance', icon: faTrophy },
        { path: '/pickup-requests', label: 'Manage Pickups', icon: faTruck }, // Staff can also manage pickup requests
      ],
    };

    return [
      ...commonItems,
      ...(roleSpecificItems[user?.role] || []),
    ];
  };

  const navItems = getNavItems();

  return (
    <nav>
      <div className="sidebar">
        <Link to="/" className="logo-link"> {/* Changed Link destination to / */}
          <div className="logo">
            <img src="#" alt="logo" className="logo-img" />
            <span className="logo-name">SmartBin</span>
          </div>
        </Link>
        
        <div className="sidebar-content">
          <ul className="list">
            {navItems.map((item) => (
              <li key={item.path} className="list-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                  <span className="link">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="bottom-content">
            <div className="social-icons">
              <a href="#" className="icon"><FontAwesomeIcon icon={faFacebook} /></a>
              <a href="#" className="icon"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="#" className="icon"><FontAwesomeIcon icon={faTwitter} /></a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;