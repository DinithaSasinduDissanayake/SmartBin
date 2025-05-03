import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo/Logo';
import subscriptionPlansApi from '../services/subscriptionPlansApi';
import './LandingPage.css';
import './Pricing.css';

function Pricing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoading(true);
        const response = await subscriptionPlansApi.getAll();
        // Filter only active plans and sort them by price
        const activePlans = response.data
          .filter(plan => plan.status === 'active')
          .sort((a, b) => a.price - b.price);
        
        setPlans(activePlans);
        setError(null);
      } catch (err) {
        console.error('Error fetching subscription plans:', err);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionPlans();
  }, []);
  
  // Format price with currency symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <Logo />
          </div>
          <div className="nav-container">
            <nav className="main-nav">
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/pricing" className="active">Pricing</Link></li>
                <li><Link to="/team">Our Team</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </nav>
            <div className="auth-nav">
              {user ? (
                <Link to="/dashboard" className="dashboard-button">Dashboard</Link>
              ) : (
                <Link to="/login" className="login-button">Login</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="page-hero">
        <div className="hero-content">
          <h1>Simple, Transparent Pricing</h1>
          <p>Choose the plan that fits your waste management needs</p>
        </div>
      </section>

      <section className="pricing">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading subscription plans...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="no-plans-container">
            <p>No subscription plans are currently available.</p>
            <p>Please contact our support team for more information.</p>
          </div>
        ) : (
          <div className="pricing-cards">
            {plans.map((plan, index) => {
              // Determine if this plan should be featured (middle plan in a 3-plan setup)
              const isMiddlePlan = plans.length >= 3 && index === 1;
              
              return (
                <div 
                  key={plan._id} 
                  className={`pricing-card ${isMiddlePlan ? 'featured' : ''}`}
                >
                  {isMiddlePlan && <div className="recommended">Most Popular</div>}
                  <div className="pricing-header">
                    <h3>{plan.name}</h3>
                    <div className="price">
                      {formatPrice(plan.price)}
                      <span>/{plan.duration?.toLowerCase() || 'month'}</span>
                    </div>
                  </div>
                  <div className="plan-description">
                    {plan.description}
                  </div>
                  <ul className="pricing-features">
                    {plan.features?.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                  <Link 
                    to={user ? "/dashboard/subscriptions" : "/register"} 
                    className="pricing-button"
                  >
                    {user ? 'Subscribe Now' : 'Get Started'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="pricing-faq">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our pricing and services</p>
        </div>
        <div className="faq-container">
          <div className="faq-item">
            <h3>How are the smart bins installed?</h3>
            <p>Our team of professionals will install the smart bins at strategic locations that you choose. The installation process is quick and non-disruptive, typically taking less than an hour per bin.</p>
          </div>
          <div className="faq-item">
            <h3>Can I upgrade my plan later?</h3>
            <p>Yes, you can upgrade your plan at any time. Your billing will be prorated based on the time remaining in your current billing cycle.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a contract period?</h3>
            <p>Our Basic and Professional plans are available on month-to-month terms or with annual contracts (which include a 10% discount). Enterprise plans typically involve custom contract terms.</p>
          </div>
          <div className="faq-item">
            <h3>What kind of support is included?</h3>
            <p>All plans include technical support. Basic plans offer email support with 24-hour response times. Professional plans include priority email and phone support with 4-hour response times. Enterprise plans include dedicated 24/7 support.</p>
          </div>
          <div className="faq-item">
            <h3>Do you offer discounts for municipalities or non-profits?</h3>
            <p>Yes, we offer special pricing for municipalities, educational institutions, and registered non-profit organizations. Please contact our sales team for details.</p>
          </div>
          <div className="faq-item">
            <h3>What happens if a smart bin needs maintenance?</h3>
            <p>Our bins are designed for minimal maintenance. However, if a bin requires attention, our team will address the issue promptly at no additional cost as part of your subscription.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to revolutionize your waste management?</h2>
          <p>Get started with SmartBin today and see the difference in efficiency and sustainability.</p>
          <Link to="/register" className="cta-button">Get Started</Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Logo />
            <p>Smart waste management for a sustainable future</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/team">Our Team</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Case Studies</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Help Center</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-social">
            <h4>Connect With Us</h4>
            <div className="social-icons">
              <a href="#" className="social-icon facebook"></a>
              <a href="#" className="social-icon twitter"></a>
              <a href="#" className="social-icon linkedin"></a>
              <a href="#" className="social-icon instagram"></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmartBin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Pricing;