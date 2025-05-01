import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, Avatar, ListItemText, ListItemAvatar } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import './ManagerDashboardWidgets.css';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid time';
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Daily Activity Widget for Financial Manager Dashboard
 * Shows a feed of recent financial activities (payments received today)
 */
const DailyActivityWidget = ({ data }) => {
  // Extract data with fallbacks
  const { recentPayments = [] } = data || {};
  
  return (
    <Card className="dashboard-widget daily-activity-widget">
      <CardContent>
        <Typography variant="h6" component="h3" className="widget-title">
          Today's Activity
        </Typography>
        
        {recentPayments.length === 0 ? (
          <Box className="no-activity-message">
            <Typography variant="body1" color="textSecondary" align="center">
              No financial activity recorded today
            </Typography>
          </Box>
        ) : (
          <List className="activity-list" disablePadding>
            {recentPayments.map((payment) => (
              <ListItem 
                key={payment._id || payment.id} 
                divider 
                className="activity-item"
              >
                <ListItemAvatar>
                  <Avatar className="activity-avatar">
                    <PaymentsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box className="activity-primary">
                      <span className="activity-type">Payment Received</span>
                      <span className="activity-amount">{formatCurrency(payment.amount)}</span>
                    </Box>
                  }
                  secondary={
                    <Box component="span" className="activity-secondary">
                      <span className="activity-customer">{payment.user?.name || 'Unknown customer'}</span>
                      <span className="activity-time">{formatTime(payment.paymentDate)}</span>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyActivityWidget;