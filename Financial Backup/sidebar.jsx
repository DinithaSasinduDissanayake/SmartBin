import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { 
  faDashboard, 
  faUpload, 
  faDollarSign, 
  faMessage, 
  faCreditCard 
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  return (
    <nav>
      <div className="sidebar">
        <div className="logo">
          <img src="#" alt="logo" className="logo-img" />
          <span className="logo-name">SmartBin</span>
        </div>

        <div className="sidebar-content">
          <ul className="list">
            <li className="list">
              <Link to="/dashboard" className="nav-link">
                <span className="link">Dashboard</span>
              </Link>
            </li>
            <li className="list">
              <Link to="/add-plans" className="nav-link">
                <span className="link">Add Plans</span>
              </Link>
            </li>
            <li className="list">
              <Link to="/subscribe-plans" className="nav-link">
                <span className="link">Subscribe Plans</span>
              </Link>
            </li>
            <li className="list">
              <Link to="/budget-allocation" className="nav-link">
                <span className="link">Budget Allocation</span>
              </Link>
            </li>
            <li className="list">
              <Link to="/add-salary" className="nav-link">
                <span className="link">Add Salary</span>
              </Link>
            </li>
            <li className="list">
              <Link to="/view-salary" className="nav-link">
                <span className="link">View Salary</span>
              </Link>
            </li>
            <li className="list">
              <Link to="/payments" className="nav-link">
                <span className="link">Payments</span>
              </Link>
            </li>
          </ul>

          <div className="bottom-content">
            <div className="social-icons">
              <a href="#" class="icon"><FontAwesomeIcon icon={faFacebook} /></a>
              <a href="#" class="icon"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="#" class="icon"><FontAwesomeIcon icon={faTwitter} /></a>

              
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
