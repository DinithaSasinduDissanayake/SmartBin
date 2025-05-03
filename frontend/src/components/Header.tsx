import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="logo">SmartBin</div>
            <div className="nav">
                <Link to="/">Home</Link>
                <Link to="/my-bin-details">My Bins</Link>
                <Link to="/pickup-form">Schedule Pickup</Link>
                <Link to="/pickup-requests">Admin</Link>
                <Link to="/login" className="login">Login</Link>
            </div>
        </header>
    );
};

export default Header;