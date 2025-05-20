import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ContactPage.css';
import { 
  EmailIcon, 
  PhoneIcon, 
  LocationIcon,
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedInIcon,
  RecycleIcon,
  CloudIcon,
  CheckIcon,
  BinIcon
} from '../components/ui/Icons/Icons';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the form data to your backend
    // Simulating successful form submission
    setFormSubmitted(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Reset form success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  return (
    <div className="contact-page">
      {/* Page Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="logo-container">
            <Link to="/">
              <img src="/assets/logo.svg" alt="SmartBin Logo" width="150" />
            </Link>
          </div>
          <div className="nav-container">
            <nav className="main-nav">
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/team">Our Team</Link></li>
                <li><Link to="/contact" className="active">Contact</Link></li>
              </ul>
            </nav>
            <div className="auth-nav">
              <Link to="/login" className="login-button">Sign In</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Hero */}
      <section className="page-hero">
        <div className="page-hero-content">
          <h1>Get In Touch</h1>
          <p>Have questions or suggestions? We'd love to hear from you!</p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact-methods">
        <div className="contact-method">
          <div className="icon-wrapper">
            <EmailIcon />
          </div>
          <h3>Email Us</h3>
          <p>Our team is here to help with any questions.</p>
          <a href="mailto:contact@smartbin.com">contact@smartbin.com</a>
        </div>
        
        <div className="contact-method">
          <div className="icon-wrapper">
            <PhoneIcon />
          </div>
          <h3>Call Us</h3>
          <p>Speak directly with our support team.</p>
          <a href="tel:+123456789">+1 (234) 567-890</a>
        </div>
        
        <div className="contact-method">
          <div className="icon-wrapper">
            <RecycleIcon />
          </div>
          <h3>Live Chat</h3>
          <p>Chat with our customer service team.</p>
          <a href="#chat">Start a conversation</a>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="form-wrapper">
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
            
            {formSubmitted && (
              <div className="form-success">
                Thank you for your message! We'll respond shortly.
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>
              
              <button type="submit" className="submit-button">Send Message</button>
            </form>
          </div>
          
          <div className="map-wrapper">
            <div className="map-placeholder">
              {/* Replace with actual Google Maps integration */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.575241295481!2d79.96711041428957!3d6.821334820911272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25a7d2a1ed223%3A0x92cfac7c6b949a86!2sUniversity%20of%20Sri%20Jayewardenepura!5e0!3m2!1sen!2sus!4v1651138434782!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="office-locations">
        <div className="section-header">
          <h2>Our Office Locations</h2>
          <p>Visit one of our offices around the world</p>
        </div>
        
        <div className="offices-grid">
          <div className="office-card">
            <h3>Headquarters</h3>
            <div className="office-detail">
              <LocationIcon />
              <p>123 Main Street, Colombo 10, Sri Lanka</p>
            </div>
            <div className="office-detail">
              <PhoneIcon />
              <p>+94 11 234 5678</p>
            </div>
            <div className="office-detail">
              <EmailIcon />
              <p>colombo@smartbin.com</p>
            </div>
            <div className="office-hours">
              <strong>Office Hours:</strong>
              <div className="office-detail">
                <CloudIcon />
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="office-card">
            <h3>Kandy Branch</h3>
            <div className="office-detail">
              <LocationIcon />
              <p>456 Hill Street, Kandy, Sri Lanka</p>
            </div>
            <div className="office-detail">
              <PhoneIcon />
              <p>+94 81 234 5678</p>
            </div>
            <div className="office-detail">
              <EmailIcon />
              <p>kandy@smartbin.com</p>
            </div>
            <div className="office-hours">
              <strong>Office Hours:</strong>
              <div className="office-detail">
                <CloudIcon />
                <p>Monday - Friday: 9:00 AM - 5:30 PM</p>
              </div>
            </div>
          </div>
          
          <div className="office-card">
            <h3>International Office</h3>
            <div className="office-detail">
              <LocationIcon />
              <p>789 Tech Avenue, Singapore 123456</p>
            </div>
            <div className="office-detail">
              <PhoneIcon />
              <p>+65 9876 5432</p>
            </div>
            <div className="office-detail">
              <EmailIcon />
              <p>singapore@smartbin.com</p>
            </div>
            <div className="office-hours">
              <strong>Office Hours:</strong>
              <div className="office-detail">
                <CloudIcon />
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find quick answers to common questions</p>
        </div>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How quickly will I receive a response?</h3>
            <p>We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call our customer service line.</p>
          </div>
          
          <div className="faq-item">
            <h3>Do you offer technical support?</h3>
            <p>Yes, we offer comprehensive technical support for all our products and services. You can reach our technical team through email or phone.</p>
          </div>
          
          <div className="faq-item">
            <h3>Can I schedule a demo?</h3>
            <p>Absolutely! You can request a product demo by filling out the contact form above or calling our sales department directly.</p>
          </div>
          
          <div className="faq-item">
            <h3>Where are your services available?</h3>
            <p>SmartBin services are currently available in major cities across Sri Lanka, with plans for expansion to other countries in South Asia.</p>
          </div>
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="join-team">
        <div className="section-content">
          <h2>Join Our Team</h2>
          <p>We're always looking for talented individuals to join our growing team. Check out our career opportunities.</p>
          <Link to="/careers" className="join-button">View Open Positions</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/assets/logo-white.svg" alt="SmartBin Logo" width="150" />
            <p>Revolutionizing waste management with smart technology solutions for a cleaner, greener future.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/team">Our Team</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/news">News & Updates</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><Link to="/services">All Services</Link></li>
                <li><Link to="/smart-bins">Smart Bins</Link></li>
                <li><Link to="/waste-analytics">Waste Analytics</Link></li>
                <li><Link to="/collection">Collection Services</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-social">
            <h4>Connect With Us</h4>
            <div className="social-icons">
              <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://twitter.com" className="social-icon" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="https://instagram.com" className="social-icon" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://linkedin.com" className="social-icon" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmartBin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;