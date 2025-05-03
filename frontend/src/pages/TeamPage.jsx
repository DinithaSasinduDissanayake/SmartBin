import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo/Logo';
import { 
  FacebookIcon, 
  TwitterIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  PersonIcon,
  GitHubIcon,
  DribbbleIcon
} from '../components/ui/Icons/Icons';
import './TeamPage.css';

const TeamPage = () => {
  const { user } = useAuth();

  // Team member data
  const leadershipTeam = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'With over 15 years of experience in waste management, Sarah founded SmartBin with a vision to revolutionize recycling through technology.',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'Michael leads our engineering team, bringing expertise in IoT systems and software development from his previous roles at tech giants.',
      social: {
        linkedin: '#',
        github: '#'
      }
    },
    {
      name: 'Jessica Patel',
      role: 'COO',
      image: 'https://images.unsplash.com/photo-1567532939604-b41b3f0f6053?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'Jessica oversees our daily operations, ensuring our services consistently exceed customer expectations while optimizing efficiency.',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    }
  ];

  const engineeringTeam = [
    {
      name: 'David Wilson',
      role: 'Lead Engineer',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'David leads the hardware team responsible for the physical sensors and mechanisms in our smart bins.',
      social: {
        linkedin: '#',
        github: '#'
      }
    },
    {
      name: 'Aisha Rahman',
      role: 'Software Engineer',
      image: 'https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'Aisha heads our cloud infrastructure and ensures our platform can scale to support thousands of devices.',
      social: {
        linkedin: '#',
        github: '#'
      }
    },
    {
      name: 'Carlos Rodriguez',
      role: 'UX/UI Designer',
      image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'Carlos crafts intuitive user experiences that make our technology accessible to users of all technical abilities.',
      social: {
        linkedin: '#',
        dribbble: '#'
      }
    }
  ];

  const businessTeam = [
    {
      name: 'Emma Thompson',
      role: 'Marketing Director',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'Emma develops our brand strategy and leads campaigns that highlight the environmental impact of our solutions.',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Thomas Lee',
      role: 'Sales Manager',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'Thomas builds relationships with municipalities and businesses to expand our network of smart waste solutions.',
      social: {
        linkedin: '#'
      }
    },
    {
      name: 'Olivia Gomes',
      role: 'Customer Success',
      image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      description: 'Olivia ensures clients receive maximum value from our products and services through dedicated support.',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    }
  ];

  // Render team member cards
  const renderTeamMember = (member) => {
    return (
      <div className="team-member" key={member.name}>
        <div className="member-image" style={{ backgroundImage: `url(${member.image})` }}></div>
        <h3>{member.name}</h3>
        <div className="member-role">{member.role}</div>
        <p>{member.description}</p>
        <div className="social-links">
          {member.social.linkedin && (
            <a href={member.social.linkedin} className="social-link" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
          )}
          {member.social.twitter && (
            <a href={member.social.twitter} className="social-link" aria-label="Twitter">
              <TwitterIcon />
            </a>
          )}
          {member.social.github && (
            <a href={member.social.github} className="social-link" aria-label="GitHub">
              <GitHubIcon />
            </a>
          )}
          {member.social.dribbble && (
            <a href={member.social.dribbble} className="social-link" aria-label="Dribbble">
              <DribbbleIcon />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="team-page">
      <header className="page-header">
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
                <Link to="/dashboard" className="login-button">Dashboard</Link>
              ) : (
                <Link to="/login" className="login-button">Login</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="page-hero">
        <div className="page-hero-content">
          <h1>Meet Our Team</h1>
          <p>The passionate people behind SmartBin's innovative waste management solutions</p>
        </div>
      </div>

      <section className="team-section">
        <div className="section-header">
          <h2>Our Leadership</h2>
          <p>The visionaries guiding SmartBin's mission to transform waste management through technology</p>
        </div>
        <div className="team-members">
          {leadershipTeam.map(renderTeamMember)}
        </div>
      </section>

      <section className="team-section">
        <div className="section-header">
          <h2>Engineering Team</h2>
          <p>The brilliant minds building our innovative technology platform</p>
        </div>
        <div className="team-members">
          {engineeringTeam.map(renderTeamMember)}
        </div>
      </section>

      <section className="team-section">
        <div className="section-header">
          <h2>Business Operations</h2>
          <p>The dedicated professionals growing our impact in communities worldwide</p>
        </div>
        <div className="team-members">
          {businessTeam.map(renderTeamMember)}
        </div>
      </section>

      <section className="join-team">
        <div className="section-content">
          <h2>Join Our Team</h2>
          <p>We're always looking for talented individuals passionate about sustainability and technology. Check out our current openings and become part of our mission.</p>
          <Link to="/careers" className="join-button">View Career Opportunities</Link>
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
              <a href="#" className="social-icon"><FacebookIcon /></a>
              <a href="#" className="social-icon"><TwitterIcon /></a>
              <a href="#" className="social-icon"><LinkedInIcon /></a>
              <a href="#" className="social-icon"><InstagramIcon /></a>
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

export default TeamPage;