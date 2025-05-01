import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-section">
                <h4>SmartBin</h4>
                <p>Responsible waste disposal and recycling solutions for a cleaner future.</p>
                <div className="social-icons">
                    <a href="#"><i className="fab fa-twitter"></i></a>
                    <a href="#"><i className="fab fa-linkedin"></i></a>
                    <a href="#"><i className="fab fa-facebook"></i></a>
                </div>
            </div>
            <div className="footer-section">
                <h4>Get In Touch</h4>
                <p><i className="fas fa-phone"></i> +94 715485554</p>
                <p><i className="fas fa-envelope"></i> SmartBin@Gmail.com</p>
                <p><i className="fas fa-map-marker-alt"></i> 39/C, Janara Lane, Kottawa</p>
            </div>
            <div className="footer-section">
                <h4>Mission</h4>
                <h4>Team</h4>
                <h4>Partners</h4>
                <h4>Careers</h4>
                <h4>Terms Of Service</h4>
            </div>
        </footer>
    );
};

export default Footer;