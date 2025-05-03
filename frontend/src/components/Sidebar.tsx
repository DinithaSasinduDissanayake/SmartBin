import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <i className="fas fa-recycle"></i>
                <h3>SmartBin</h3>
            </div>
            <nav className="sidebar-nav">
                <Link to="/" className="sidebar-link">Home</Link>
                <Link to="/pickup-form" className="sidebar-link">Request Pickup</Link>
                <Link to="/my-bin-details" className="sidebar-link">My Bin Details</Link>
                <Link to="/pickup-requests" className="sidebar-link">Manage Pickups</Link>
                <Link to="/contact" className="sidebar-link">Contact Us</Link>
            </nav>
        </div>
    );
};

export default Sidebar;