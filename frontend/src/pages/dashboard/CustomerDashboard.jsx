import React from 'react';
import { Box, Grid, Typography, Paper, Card, CardContent, Button } from '@mui/material';
import CustomerScheduleDisplay from '../../components/CustomerScheduleDisplay';
import '../../styles/themeStyles.css';

const CustomerDashboard = () => {
  // Sample customer data - would come from context or API in real app
  const customerData = {
    name: 'John Doe',
    subscriptionType: 'Premium',
    nextPickupDate: '2025-05-05',
    accountBalance: '$35.80',
    openComplaints: 0,
    lastPayment: {
      amount: '$45.00',
      date: '2025-04-15'
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Customer Dashboard
      </Typography>
      
      {/* Customer Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              My Subscription
            </Typography>
            <Typography variant="body1">
              <strong>Plan:</strong> {customerData.subscriptionType}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> <span style={{ color: '#4caf50' }}>Active</span>
            </Typography>
            <Typography variant="body1">
              <strong>Next Payment:</strong> 2025-05-15
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" size="small" color="primary">
                Manage Subscription
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Next Pickup
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong> {customerData.nextPickupDate}
            </Typography>
            <Typography variant="body1">
              <strong>Time:</strong> 08:00 - 12:00
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> <span style={{ color: '#2196f3' }}>Scheduled</span>
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" size="small" color="primary">
                Request Reschedule
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Billing Summary
            </Typography>
            <Typography variant="body1">
              <strong>Account Balance:</strong> {customerData.accountBalance}
            </Typography>
            <Typography variant="body1">
              <strong>Last Payment:</strong> {customerData.lastPayment.amount} on {customerData.lastPayment.date}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" size="small" color="primary">
                Make a Payment
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Schedule Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Waste Collection Schedule
        </Typography>
        <CustomerScheduleDisplay />
      </Paper>
      
      {/* Quick Actions Section */}
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {['Submit Complaint', 'Request Special Pickup', 'Update Contact Info', 'View Past Invoices'].map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {action}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CustomerDashboard;