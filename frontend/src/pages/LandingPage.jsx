import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo/Logo';
import { 
  EcoFriendlyIcon, 
  CostIcon, 
  RealTimeIcon, 
  DataAnalyticsIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedInIcon,
  InstagramIcon,
  RecycleIcon,
  BinIcon,
  CloudIcon,
  LocationIcon,
  CheckIcon,
  SmartBinIcon
} from '../components/ui/Icons/Icons';
import './LandingPage.css';

function LandingPage() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo-container">
            <Logo />
          </div>
          <div className="nav-container">
            <nav className="main-nav">
              <ul>
                <li><Link to="/" className="active">Home</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
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

      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Easy Waste Management at Your Fingertips</h1>
          <p>Schedule your garbage pickups on demand or choose a subscription plan for hassle-free waste management</p>
          <div className="hero-buttons">
            <Link to="/register" className="get-started-button">Get Started</Link>
            <a href="#features" className="learn-more-button">Learn More</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="/assets/images/team/hero-recycling.jpg" alt="SmartBin Waste Management" />
        </div>
      </section>

      <section id="features" className="features">
        <div className="section-header">
          <h2>Why Choose SmartBin?</h2>
          <p>Our convenient waste management solutions offer numerous benefits</p>
        </div>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon eco-friendly">
              <EcoFriendlyIcon />
            </div>
            <h3>Eco-Friendly</h3>
            <p>Reduce your carbon footprint with our environmentally conscious waste management services</p>
            <ul className="feature-benefits">
              <li><CheckIcon /> Proper waste segregation</li>
              <li><CheckIcon /> Responsible disposal methods</li>
              <li><CheckIcon /> Recycling options</li>
            </ul>
          </div>
          <div className="feature-card">
            <div className="feature-icon cost-effective">
              <CostIcon />
            </div>
            <h3>Flexible Subscription Plans</h3>
            <p>Choose the subscription plan that perfectly fits your waste management needs</p>
            <ul className="feature-benefits">
              <li><CheckIcon /> Multiple plan options</li>
              <li><CheckIcon /> Cost-effective pricing</li>
              <li><CheckIcon /> Premium service tiers</li>
            </ul>
          </div>
          <div className="feature-card">
            <div className="feature-icon real-time">
              <RealTimeIcon />
            </div>
            <h3>On-Demand Service</h3>
            <p>Request pickup exactly when you need it with our simple scheduling system</p>
            <ul className="feature-benefits">
              <li><CheckIcon /> Easy request submission</li>
              <li><CheckIcon /> Flexible scheduling</li>
              <li><CheckIcon /> Real-time status updates</li>
            </ul>
          </div>
          <div className="feature-card">
            <div className="feature-icon data-analytics">
              <DataAnalyticsIcon />
            </div>
            <h3>Convenient Dashboard</h3>
            <p>Track your pickups, manage subscriptions, and access your service history</p>
            <ul className="feature-benefits">
              <li><CheckIcon /> Request history</li>
              <li><CheckIcon /> Subscription management</li>
              <li><CheckIcon /> Digital receipts</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <h2>How SmartBin Works</h2>
          <p>A simple three-step process to revolutionize waste management</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-icon">
              <BinIcon />
            </div>
            <div className="step-number">1</div>
            <h3>Request Pickup</h3>
            <p>Submit your garbage pickup request through our easy-to-use platform</p>
            <div className="step-details">
              <p>Use our mobile app or website to schedule a pickup at your convenience. Specify the waste type, volume, and preferred collection time.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-icon">
              <CloudIcon />
            </div>
            <div className="step-number">2</div>
            <h3>Admin Scheduling</h3>
            <p>Our team promptly processes your request and arranges the pickup</p>
            <div className="step-details">
              <p>Our admin team reviews your request, assigns appropriate resources, and confirms your pickup schedule through notification.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-icon">
              <LocationIcon />
            </div>
            <div className="step-number">3</div>
            <h3>Efficient Collection</h3>
            <p>Experience hassle-free waste collection on your scheduled date</p>
            <div className="step-details">
              <p>Choose from our flexible subscription plans to automate regular pickups and enjoy premium services with priority scheduling.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <div className="section-header">
          <h2>What Our Clients Say</h2>
          <p>Success stories from customers using SmartBin</p>
        </div>
        <div className="testimonial-container">
          <div className="testimonial">
            <div className="quote">"SmartBin's on-demand pickup service has been a game-changer for our business. The subscription plan saves us time and ensures our waste is always collected on schedule."</div>
            <div className="client-info">
              <div className="client-image">
                <RecycleIcon />
              </div>
              <div className="client-details">
                <h4>Chamath Bandara</h4>
                <p>Restaurant Owner, Colombo</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="quote">"The scheduling system is incredibly easy to use. I can request a pickup with just a few clicks, and I'm always notified when my request has been processed."</div>
            <div className="client-info">
              <div className="client-image">
                <RecycleIcon />
              </div>
              <div className="client-details">
                <h4>Dilhani Perera</h4>
                <p>Residential Customer, Kandy</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="quote">"The premium subscription plan has been perfect for our apartment complex. Regular scheduled pickups and priority service have made waste management hassle-free for all our residents."</div>
            <div className="client-info">
              <div className="client-image">
                <RecycleIcon />
              </div>
              <div className="client-details">
                <h4>Roshan Fernando</h4>
                <p>Property Manager, Galle</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="cta-section">
        <div className="cta-content">
          <h2>Ready to transform your waste management?</h2>
          <p>Join hundreds of organizations already benefiting from SmartBin's innovative solutions</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-primary">Get Started Today</Link>
            <Link to="/pricing" className="cta-secondary">View Pricing</Link>
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
                <li><a href="#features">Features</a></li>
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

export default LandingPage;