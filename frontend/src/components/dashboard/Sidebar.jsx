// frontend/src/components/dashboard/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/dashboard/profile', label: 'My Profile', icon: '👤' },
    ];

    const roleSpecificItems = {
      citizen: [
        { path: '/dashboard/collection-history', label: 'Collection History', icon: '📅' },
        { path: '/dashboard/financial-history', label: 'Financial History', icon: '💰' },
        { path: '/dashboard/complaints', label: 'Complaints', icon: '📝' },
        { path: '/dashboard/pickup-requests', label: 'Pickup Requests', icon: '🚚' },
      ],
      garbage_buyer: [
        { path: '/dashboard/available-garbage', label: 'Available Garbage', icon: '♻️' },
        { path: '/dashboard/purchase-history', label: 'Purchase History', icon: '📜' },
        { path: '/dashboard/financial', label: 'Financial', icon: '💵' },
      ],
      admin: [
        { path: '/dashboard/users', label: 'User Management', icon: '👥' },
        { path: '/dashboard/statistics', label: 'Statistics', icon: '📈' },
        { path: '/dashboard/settings', label: 'System Settings', icon: '⚙️' },
      ],
      financial_manager: [
        { path: '/dashboard/revenue', label: 'Revenue', icon: '💹' },
        { path: '/dashboard/expenses', label: 'Expenses', icon: '💸' },
        { path: '/dashboard/reports', label: 'Reports', icon: '📊' },
      ],
      staff: [
        { path: '/dashboard/attendance', label: 'Attendance', icon: '📋' },
        { path: '/dashboard/tasks', label: 'Tasks', icon: '✅' },
        { path: '/dashboard/performance', label: 'Performance', icon: '🏆' },
      ],
    };

    return [
      ...commonItems,
      ...(roleSpecificItems[user?.role] || []),
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>SmartBin</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;