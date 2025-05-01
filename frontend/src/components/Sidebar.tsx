import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <i className="fas fa-user-circle"></i>
                <h3>User</h3>
            </div>
            <nav className="sidebar-nav">
                <Link to="/pickup-form" className="sidebar-link">
                    Create Bin
                </Link>
                <Link to="/my-bin-details" className="sidebar-link">
                    My Bin Details
                </Link>
                <Link to="/pickup-requests" className="sidebar-link">
                Pickup Requests
                </Link>
            </nav>
        </div>
    );
};

export default Sidebar;