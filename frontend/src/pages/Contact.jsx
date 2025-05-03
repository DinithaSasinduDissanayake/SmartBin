import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo/Logo';
import './LandingPage.css';
import './Contact.css';

function Contact() {
  const { user } = useAuth();
  
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
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/team">Our Team</Link></li>
                <li><Link to="/contact" className="active">Contact</Link></li>
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

      <section className="page-hero contact-hero">
        <div className="hero-content">
          <h1>Get in Touch With Us</h1>
          <p>We'd love to hear from you and help with your waste management needs</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-grid">
          <div className="contact-info-card">
            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon email"></div>
                <h3>Email Us</h3>
                <p>info@smartbin.com</p>
                <p>support@smartbin.com</p>
              </div>
              <div className="contact-method">
                <div className="contact-icon phone"></div>
                <h3>Call Us</h3>
                <p>+1 (555) 123-4567</p>
                <p>Mon-Fri, 9am-5pm EST</p>
              </div>
              <div className="contact-method">
                <div className="contact-icon address"></div>
                <h3>Visit Us</h3>
                <p>123 Green Street</p>
                <p>EcoCity, EC 12345</p>
              </div>
            </div>
            <div className="social-contact">
              <h3>Connect With Us</h3>
              <div className="social-icons large">
                <a href="#" className="social-icon facebook" title="Facebook"></a>
                <a href="#" className="social-icon twitter" title="Twitter"></a>
                <a href="#" className="social-icon linkedin" title="LinkedIn"></a>
                <a href="#" className="social-icon instagram" title="Instagram"></a>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" placeholder="Your Phone Number (optional)" />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject">
                  <option value="" disabled selected>Select an Option</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" className="submit-button">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <section className="map-section">
        <h2>Our Location</h2>
        <div className="map-container">
          {/* Map will be added here - for now showing placeholder */}
          <div className="map-placeholder">
            <p>Map Loading...</p>
            <p>123 Green Street, EcoCity, EC 12345</p>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common questions</p>
        </div>
        <div className="faq-container">
          <div className="faq-item">
            <h3>What areas do you service?</h3>
            <p>We currently operate in major metropolitan areas across North America and Europe, with plans to expand to more regions soon. Contact us to check availability in your area.</p>
          </div>
          <div className="faq-item">
            <h3>How quickly can you implement a solution?</h3>
            <p>After the initial consultation, most small to medium implementations can be completed within 2-4 weeks. Larger, enterprise-level solutions may take 6-8 weeks for full deployment.</p>
          </div>
          <div className="faq-item">
            <h3>Do you offer emergency support?</h3>
            <p>Yes, all of our service plans include emergency support options. Professional and Enterprise plans include 24/7 emergency support.</p>
          </div>
          <div className="faq-item">
            <h3>Can I schedule a demonstration?</h3>
            <p>Absolutely! We offer both virtual and in-person demonstrations of our smart bin technology and management platform. Contact our sales team to schedule.</p>
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

export default Contact;