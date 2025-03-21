// frontend/src/components/dashboard/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFacebook, 
  faInstagram, 
  faTwitter 
} from "@fortawesome/free-brands-svg-icons";
import {
  faGaugeHigh,
  faFileLines,
  faCheckSquare,
  faMoneyBillTransfer,
  faUser,
  faEye,
  faCreditCard,
  faChartLine,
  faDollarSign,
  faChartSimple,
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
  faTrophy
} from "@fortawesome/free-solid-svg-icons";
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
      'Resident/Garbage_Buyer': [
        { path: '/dashboard/collection-history', label: 'Collection History', icon: faCalendarDays },
        { path: '/dashboard/financial-history', label: 'Financial History', icon: faMoneyBill },
        { path: '/dashboard/complaints', label: 'Complaints', icon: faFileSignature },
        { path: '/dashboard/pickup-requests', label: 'Pickup Requests', icon: faTruck },
        { path: '/dashboard/available-garbage', label: 'Available Garbage', icon: faRecycle },
        { path: '/dashboard/purchase-history', label: 'Purchase History', icon: faScroll },
      ],
      admin: [
        { path: '/dashboard/users', label: 'User Management', icon: faUsers },
        { path: '/dashboard/statistics', label: 'Statistics', icon: faChartLine },
        { path: '/dashboard/settings', label: 'System Settings', icon: faCog },
      ],
      financial_manager: [
        { path: '/dashboard/revenue', label: 'Revenue', icon: faChartLine },
        { path: '/dashboard/expenses', label: 'Expenses', icon: faDollarSign },
        { path: '/dashboard/reports', label: 'Reports', icon: faChartSimple },
        { path: '/dashboard/add-plans', label: 'Add Plans', icon: faFileLines },
        { path: '/dashboard/subscribe-plans', label: 'Subscribe Plans', icon: faCheckSquare },
        { path: '/dashboard/budget-allocation', label: 'Budget Allocation', icon: faMoneyBillTransfer },
        { path: '/dashboard/add-salary', label: 'Add Salary', icon: faUser },
        { path: '/dashboard/view-salary', label: 'View Salary', icon: faEye },
        { path: '/dashboard/payments', label: 'Payments', icon: faCreditCard },
      ],
      staff: [
        { path: '/dashboard/attendance', label: 'Attendance', icon: faClipboardList },
        { path: '/dashboard/tasks', label: 'Tasks', icon: faListCheck },
        { path: '/dashboard/performance', label: 'Performance', icon: faTrophy },
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
        <div className="logo">
          <img src="#" alt="logo" className="logo-img" />
          <span className="logo-name">SmartBin</span>
        </div>
        
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