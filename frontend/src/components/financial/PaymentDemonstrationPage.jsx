import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Paper, Step, Stepper, StepLabel, Alert, Divider, Grid, CircularProgress } from '@mui/material';
import StripeContainer from './StripeContainer';

/**
 * A demonstration page that showcases the full payment flow
 * using Stripe integration in the SmartBin application
 */
const PaymentDemonstrationPage = () => {
  // User and plan data (in a real app, this would come from authentication and API)
  const [currentUser] = useState({
    _id: "demo-user-123",
    name: "Demo User",
    email: "demo@example.com"
  });

  // Sample subscription plan
  const [selectedPlan] = useState({
    _id: "plan-standard-123",
    name: "Standard Plan",
    price: "79.99",
    description: "Standard waste collection service with weekly pickup and app access.",
    duration: "Monthly",
    features: [
      "Weekly Waste Collection",
      "Recycling Services",
      "Standard Support",
      "Online Account Management"
    ]
  });

  // Payment flow states
  const [activeStep, setActiveStep] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Steps in the payment process
  const steps = [
    'Select Plan',
    'Enter Payment Details',
    'Confirm Payment',
    'Payment Complete'
  ];

  // Add log entries to track the payment flow
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, timestamp, type }]);
  };

  // Handle plan selection
  const handlePlanSelect = () => {
    addLog(`Selected plan: ${selectedPlan.name} (${selectedPlan.price})`);
    setActiveStep(1);
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentResult) => {
    addLog('✓ Payment completed successfully!', 'success');
    addLog(`Payment ID: ${paymentResult.id || 'N/A'}`, 'success');
    addLog('Subscription activated', 'success');
    
    setPaymentStatus('success');
    setIsLoading(false);
    setActiveStep(3);
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    addLog(`✗ Payment failed: ${error.message || 'Unknown error'}`, 'error');
    setPaymentStatus('error');
    setIsLoading(false);
  };

  // Simulate backend webhook processing
  const simulateWebhook = () => {
    addLog('⟳ Stripe webhook received on backend', 'info');
    addLog('⟳ Updating payment status in database...', 'info');
    addLog('⟳ Creating subscription record...', 'info');
    
    setTimeout(() => {
      addLog('✓ Webhook processing complete', 'success');
    }, 1500);
  };

  // When a successful payment occurs, simulate the webhook after a delay
  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        simulateWebhook();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        SmartBin Payment System Demonstration
      </Typography>
      
      <Typography variant="subtitle1" paragraph align="center" color="text.secondary">
        This demonstration shows how the payment system works using Stripe integration
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {selectedPlan.name}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${selectedPlan.price}/month
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedPlan.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Features:
                </Typography>
                <ul>
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index}>
                      <Typography variant="body2">{feature}</Typography>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  onClick={handlePlanSelect}
                  sx={{ mt: 2 }}
                >
                  Select Plan & Continue to Payment
                </Button>
              </CardContent>
            </Card>
          )}
          
          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Enter Payment Details
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You will be charged ${selectedPlan.price} for your {selectedPlan.name.toLowerCase()} subscription.
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <StripeContainer
                    plan={selectedPlan}
                    userId={currentUser._id}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </Box>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Test Card:</strong> Use card number 4242 4242 4242 4242 with any future expiration date,
                  any 3-digit CVC, and any postal code.
                </Alert>
              </CardContent>
            </Card>
          )}
          
          {activeStep === 3 && paymentStatus === 'success' && (
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom color="primary">
                  Payment Successful!
                </Typography>
                <Typography variant="body1" paragraph>
                  Your subscription to the {selectedPlan.name} has been activated.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setActiveStep(0);
                    setPaymentStatus(null);
                    setLogs([]);
                  }}
                >
                  Start New Demo
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom>
              Payment Process Logs
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {logs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No activity yet. Start the payment process to see logs here.
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {logs.map((log, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 1, 
                      p: 1, 
                      borderRadius: 1,
                      backgroundColor: log.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 
                                      log.type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 
                                      'rgba(33, 150, 243, 0.1)'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block">
                      {log.timestamp}
                    </Typography>
                    <Typography variant="body2">
                      {log.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          How the SmartBin Payment System Works
        </Typography>
        <ol>
          <li>
            <Typography variant="body2" paragraph>
              <strong>Frontend Payment Initiation:</strong> User selects a subscription plan and enters their payment details through the Stripe Elements interface.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" paragraph>
              <strong>Backend Payment Intent Creation:</strong> When the user submits their card details, the frontend calls the <code>/financials/payments/initiate</code> API endpoint, which creates a Stripe Payment Intent using your Stripe secret key.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" paragraph>
              <strong>Client-side Payment Confirmation:</strong> The frontend receives a client secret and uses it to confirm the payment with Stripe directly from the browser (keeping card details secure).
            </Typography>
          </li>
          <li>
            <Typography variant="body2" paragraph>
              <strong>Webhook Processing:</strong> After payment is processed, Stripe sends a webhook to your backend <code>/financials/payments/webhook</code> endpoint, which validates the signature and updates the payment status.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Subscription Activation:</strong> If payment is successful, the backend automatically activates the user's subscription and records are updated in the database.
            </Typography>
          </li>
        </ol>
      </Box>
    </Box>
  );
};

export default PaymentDemonstrationPage;