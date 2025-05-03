import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo/Logo';
import './LandingPage.css';
import './Team.css';

function Team() {
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
                <li><Link to="/team" className="active">Our Team</Link></li>
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
          <h1>Meet Our Expert Team</h1>
          <p>The passionate professionals behind SmartBin's innovative waste management solutions</p>
        </div>
      </section>

      <section className="team-section">
        <div className="section-header">
          <h2>Leadership Team</h2>
          <p>Guiding our vision of a cleaner, more sustainable future</p>
        </div>
        <div className="team-members leadership">
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/sithumi.jpg')" }}></div>
            <h3>Sithumi Nethara</h3>
            <p className="member-role">CEO & Founder</p>
            <p className="member-description">Environmental engineer with 15+ years in waste management innovation, Sithumi founded SmartBin with a vision to revolutionize how cities handle waste.</p>
            <div className="member-social">
              <a href="#" className="social-icon linkedin"></a>
              <a href="#" className="social-icon twitter"></a>
            </div>
          </div>
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/dinuka.jpg')" }}></div>
            <h3>Dinuka Perera</h3>
            <p className="member-role">CTO</p>
            <p className="member-description">IoT specialist with expertise in sensor technology and data analytics, Dinuka leads our technical development and infrastructure.</p>
            <div className="member-social">
              <a href="#" className="social-icon linkedin"></a>
              <a href="#" className="social-icon github"></a>
            </div>
          </div>
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/amandi.jpg')" }}></div>
            <h3>Amandi Jayawardana</h3>
            <p className="member-role">Head of Operations</p>
            <p className="member-description">Operations expert focused on optimizing waste collection efficiency, Amandi ensures our systems deliver real-world results.</p>
            <div className="member-social">
              <a href="#" className="social-icon linkedin"></a>
              <a href="#" className="social-icon twitter"></a>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="section-header">
          <h2>Technical Team</h2>
          <p>Building the technologies that power our smart waste solutions</p>
        </div>
        <div className="team-members">
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/dulaj.jpg')" }}></div>
            <h3>Dulaj Rajapaksa</h3>
            <p className="member-role">Lead Developer</p>
            <p className="member-description">Full-stack developer specializing in IoT applications and real-time data processing.</p>
          </div>
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/sachini.jpg')" }}></div>
            <h3>Sachini Weerasinghe</h3>
            <p className="member-role">Data Scientist</p>
            <p className="member-description">AI specialist focused on route optimization algorithms and predictive analytics.</p>
          </div>
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/lasith.jpg')" }}></div>
            <h3>Lasith Malinga</h3>
            <p className="member-role">Hardware Engineer</p>
            <p className="member-description">Designs and improves our smart bin sensors and hardware components.</p>
          </div>
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/sathya.jpg')" }}></div>
            <h3>Sathya Gamage</h3>
            <p className="member-role">UX Designer</p>
            <p className="member-description">Creates intuitive user interfaces for our mobile and web applications.</p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="section-header">
          <h2>Operations Team</h2>
          <p>Ensuring smooth implementation and customer success</p>
        </div>
        <div className="team-members">
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/dhanushka.jpg')" }}></div>
            <h3>Dhanushka Silva</h3>
            <p className="member-role">Sustainability Director</p>
            <p className="member-description">Environmental scientist dedicated to reducing waste's environmental impact.</p>
          </div>
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/kavindi.jpg')" }}></div>
            <h3>Kavindi Gunawardana</h3>
            <p className="member-role">Customer Success Manager</p>
            <p className="member-description">Ensures clients achieve maximum value from SmartBin implementations.</p>
          </div>
          <div className="team-member">
            <div className="member-image" style={{ backgroundImage: "url('/assets/images/team/pramod.jpg')" }}></div>
            <h3>Pramod Madushan</h3>
            <p className="member-role">Field Operations Lead</p>
            <p className="member-description">Manages bin installations and maintenance across all client locations.</p>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="section-header">
          <h2>Our Values</h2>
          <p>The principles that guide everything we do at SmartBin</p>
        </div>
        <div className="values-container">
          <div className="value-item">
            <div className="value-icon sustainability"></div>
            <h3>Sustainability</h3>
            <p>We are committed to creating solutions that reduce environmental impact and promote a circular economy.</p>
          </div>
          <div className="value-item">
            <div className="value-icon innovation"></div>
            <h3>Innovation</h3>
            <p>We constantly explore new technologies and approaches to solve waste management challenges.</p>
          </div>
          <div className="value-item">
            <div className="value-icon collaboration"></div>
            <h3>Collaboration</h3>
            <p>We work closely with municipalities, businesses, and communities to create tailored solutions.</p>
          </div>
          <div className="value-item">
            <div className="value-icon integrity"></div>
            <h3>Integrity</h3>
            <p>We operate with transparency and honesty in all our relationships and business practices.</p>
          </div>
        </div>
      </section>

      <section className="join-team-section">
        <div className="join-content">
          <h2>Join Our Team</h2>
          <p>We're always looking for passionate individuals who want to make a difference in waste management and sustainability.</p>
          <Link to="/careers" className="join-button">View Open Positions</Link>
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

export default Team;