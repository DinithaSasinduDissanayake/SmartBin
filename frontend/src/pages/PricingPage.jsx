import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo/Logo';
import { 
  CheckIcon, 
  BinIcon, 
  FacebookIcon,
  TwitterIcon,
  LinkedInIcon,
  InstagramIcon,
  RecycleIcon,
  CloudIcon,
  DataAnalyticsIcon,
  RealTimeIcon
} from '../components/ui/Icons/Icons';
import './PricingPage.css';

function PricingPage() {
  const { user } = useAuth();
  
  return (
    <div className="page pricing-page">
      <header className="page-header">
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
                <Link to="/dashboard" className="login-button">Dashboard</Link>
              ) : (
                <Link to="/login" className="login-button">Login</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Simple, Transparent Pricing</h1>
          <p>Choose the plan that works best for your waste management needs</p>
        </div>
      </section>

      <section id="pricing-plans" className="pricing">
        <div className="section-header">
          <h2>Our Pricing Plans</h2>
          <p>Affordable solutions for businesses of all sizes</p>
        </div>
        <div className="pricing-cards">
          <div className="pricing-card">
            <div className="pricing-icon">
              <BinIcon />
            </div>
            <div className="pricing-header">
              <h3>Basic</h3>
              <div className="price">$99<span>/month</span></div>
            </div>
            <div className="plan-description">
              <p>Perfect for small businesses or communities starting their smart waste journey</p>
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> Up to 5 smart bins</li>
              <li><CheckIcon /> Real-time monitoring</li>
              <li><CheckIcon /> Basic analytics</li>
              <li><CheckIcon /> Weekly reports</li>
              <li><CheckIcon /> Email support</li>
            </ul>
            <Link to="/register?plan=basic" className="pricing-button">Get Started</Link>
          </div>
          <div className="pricing-card featured">
            <div className="recommended">Recommended</div>
            <div className="pricing-icon">
              <CloudIcon />
            </div>
            <div className="pricing-header">
              <h3>Professional</h3>
              <div className="price">$199<span>/month</span></div>
            </div>
            <div className="plan-description">
              <p>Designed for medium-sized businesses requiring advanced features and optimization</p>
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> Up to 15 smart bins</li>
              <li><CheckIcon /> Real-time monitoring</li>
              <li><CheckIcon /> Advanced analytics</li>
              <li><CheckIcon /> Daily reports</li>
              <li><CheckIcon /> Priority email support</li>
              <li><CheckIcon /> Route optimization</li>
              <li><CheckIcon /> Waste composition analysis</li>
            </ul>
            <Link to="/register?plan=pro" className="pricing-button">Get Started</Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-icon">
              <DataAnalyticsIcon />
            </div>
            <div className="pricing-header">
              <h3>Enterprise</h3>
              <div className="price">$399<span>/month</span></div>
            </div>
            <div className="plan-description">
              <p>Comprehensive solution for large organizations with complex waste management needs</p>
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> Unlimited smart bins</li>
              <li><CheckIcon /> Real-time monitoring</li>
              <li><CheckIcon /> Advanced analytics with AI</li>
              <li><CheckIcon /> Custom reports</li>
              <li><CheckIcon /> 24/7 phone support</li>
              <li><CheckIcon /> Route optimization</li>
              <li><CheckIcon /> Waste composition analysis</li>
              <li><CheckIcon /> Custom integrations</li>
              <li><CheckIcon /> Dedicated account manager</li>
            </ul>
            <Link to="/register?plan=enterprise" className="pricing-button">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="compare-plans">
        <div className="section-header">
          <h2>Compare Plans</h2>
          <p>Find the perfect plan for your organization's needs</p>
        </div>
        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Basic</th>
                <th>Professional</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Smart Bin Capacity</td>
                <td>Up to 5 bins</td>
                <td>Up to 15 bins</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Fill Level Monitoring</td>
                <td><CheckIcon /></td>
                <td><CheckIcon /></td>
                <td><CheckIcon /></td>
              </tr>
              <tr>
                <td>Temperature Monitoring</td>
                <td><CheckIcon /></td>
                <td><CheckIcon /></td>
                <td><CheckIcon /></td>
              </tr>
              <tr>
                <td>Waste Composition Analysis</td>
                <td></td>
                <td><CheckIcon /></td>
                <td><CheckIcon /></td>
              </tr>
              <tr>
                <td>Route Optimization</td>
                <td></td>
                <td><CheckIcon /></td>
                <td><CheckIcon /></td>
              </tr>
              <tr>
                <td>API Access</td>
                <td></td>
                <td><CheckIcon /></td>
                <td><CheckIcon /></td>
              </tr>
              <tr>
                <td>Detailed Reports</td>
                <td>Weekly</td>
                <td>Daily</td>
                <td>Real-time & Custom</td>
              </tr>
              <tr>
                <td>Customer Support</td>
                <td>Email</td>
                <td>Priority Email</td>
                <td>24/7 Phone & Email</td>
              </tr>
              <tr>
                <td>Dedicated Account Manager</td>
                <td></td>
                <td></td>
                <td><CheckIcon /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="faq">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our pricing plans</p>
        </div>
        <div className="faq-container">
          <div className="faq-item">
            <h3>Can I upgrade my plan later?</h3>
            <p>Yes, you can upgrade your plan at any time. Your billing will be prorated to account for the change in plans.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a setup fee?</h3>
            <p>No, there are no hidden fees. The monthly price includes all setup and installation costs for the smart bins.</p>
          </div>
          <div className="faq-item">
            <h3>Do you offer annual discounts?</h3>
            <p>Yes, we offer a 10% discount for annual payments on all plans.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a contract or minimum commitment?</h3>
            <p>Our monthly plans can be canceled at any time. Annual plans have a 12-month commitment with significant savings.</p>
          </div>
          <div className="faq-item">
            <h3>What happens if a smart bin needs maintenance?</h3>
            <p>Our bins are designed for minimal maintenance. However, if a bin requires attention, our team will address the issue promptly at no additional cost as part of your subscription.</p>
          </div>
          <div className="faq-item">
            <h3>Can I customize my plan?</h3>
            <p>Enterprise customers can customize their plans based on specific requirements. Contact our sales team for details.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to optimize your waste management?</h2>
          <p>Join thousands of businesses that trust SmartBin for their waste management needs</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-primary">Get Started Today</Link>
            <Link to="/contact" className="cta-secondary">Talk to Sales</Link>
          </div>
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
              <a href="#" className="social-icon facebook"><FacebookIcon /></a>
              <a href="#" className="social-icon twitter"><TwitterIcon /></a>
              <a href="#" className="social-icon linkedin"><LinkedInIcon /></a>
              <a href="#" className="social-icon instagram"><InstagramIcon /></a>
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

export default PricingPage;