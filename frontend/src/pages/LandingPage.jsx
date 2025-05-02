import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo/Logo';
import './LandingPage.css';

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <header className="header">
        <Logo />
        <nav>
          {user ? (
            <Link to="/dashboard" className="dashboard-button">Dashboard</Link>
          ) : (
            <Link to="/login" className="login-button">Login</Link>
          )}
        </nav>
      </header>

      <section className="hero">
        {!user ? (
          <>
            <h1>Smart Waste Management Solution</h1>
            <p>Revolutionizing how we handle waste for a cleaner, greener future</p>
            <Link to="/register" className="get-started-button">Get Started With Us</Link>
          </>
        ) : (
          <>
            <h1>Welcome back, {user.name}!</h1>
            <p>Continue managing your waste efficiently with SmartBin</p>
            <Link to="/dashboard" className="dashboard-button">Go to Dashboard</Link>
          </>
        )}
      </section>
      
    </div>
  );
}

export default LandingPage;