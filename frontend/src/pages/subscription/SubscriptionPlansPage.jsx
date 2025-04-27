import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import CustomerSubscriptionPlans from '../../components/financial/CustomerSubscriptionPlans';
import MainLayout from '../../components/layouts/MainLayout';
import './SubscriptionPlansPage.css';

/**
 * Page component for displaying subscription plans to customers
 * Uses the CustomerSubscriptionPlans component wrapped in main layout
 */
const SubscriptionPlansPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { 
        state: { from: '/subscription-plans', message: 'Please log in to view subscription plans' } 
      });
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null; // Don't render anything during redirect
  }
  
  return (
    <MainLayout>
      <div className="subscription-plans-page">
        <div className="page-header">
          <h1>Subscription Plans</h1>
          <p className="header-description">
            Choose the perfect subscription plan for your waste management needs
          </p>
        </div>
        
        <CustomerSubscriptionPlans />
        
        <div className="subscription-info">
          <h3>Why Subscribe?</h3>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-recycle"></i>
              </div>
              <h4>Eco-Friendly Waste Management</h4>
              <p>Our smart waste management solutions help reduce environmental impact through efficient recycling.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h4>Advanced Analytics</h4>
              <p>Get insights into your waste patterns and optimize your waste management processes.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h4>Time-Saving Solutions</h4>
              <p>Automated scheduling and smart bin technology save time and streamline operations.</p>
            </div>
          </div>
        </div>
        
        <div className="subscription-faq">
          <h3>Frequently Asked Questions</h3>
          
          <div className="faq-item">
            <h4>How do I change my subscription plan?</h4>
            <p>You can upgrade or downgrade your subscription at any time from your account management page.</p>
          </div>
          
          <div className="faq-item">
            <h4>Is there a contract period?</h4>
            <p>Our subscriptions are flexible. You can cancel at any time, but we do not offer partial refunds for unused time.</p>
          </div>
          
          <div className="faq-item">
            <h4>How is billing handled?</h4>
            <p>Billing occurs at the start of each subscription period. You can view your billing history in your account dashboard.</p>
          </div>
          
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept major credit cards and bank transfers for all subscription plans.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionPlansPage;