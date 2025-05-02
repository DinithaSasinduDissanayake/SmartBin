import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ size = 'medium', linkTo = '/' }) => {
  return (
    <Link to={linkTo} className={`logo-container logo-${size}`}>
      <svg 
        className="logo-icon"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {/* Recycling bin icon */}
        <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
      </svg>
      <div className="logo-text">Smart<span>Bin</span></div>
    </Link>
  );
};

export default Logo;