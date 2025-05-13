import React from 'react';
import '../styles/Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="logo">SmartBin</div>
            <nav className="nav">
                <a href="#">Home</a>
                <a href="#">Pricing</a>
                <a href="#">About</a>
                <a href="#">FAQ</a>
                <a href="#" className="login">Login</a>
            </nav>
        </header>
    );
};

export default Header;