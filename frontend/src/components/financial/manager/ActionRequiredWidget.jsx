import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import './ManagerDashboardWidgets.css';

/**
 * Action Required Widget for Financial Manager Dashboard
 * Shows urgent items requiring attention such as pending approvals, expiring subscriptions, etc.
 */
const ActionRequiredWidget = ({ data }) => {
  // Extract data with fallbacks, using names matching the backend API response
  const { 
    pendingExpenses = [],       // Changed from pendingApprovals
    subscriptionsEndingSoon = [], // Changed from expiringSubscriptions
    pendingPayments = []
  } = data || {};
  
  // Count total actions needed using the correct variable names
  const totalActions = pendingExpenses.length + subscriptionsEndingSoon.length + pendingPayments.length;
  
  return (
    <Card className="dashboard-widget action-required-widget">
      <CardContent>
        <Box className="widget-header">
          <Typography variant="h6" component="h3" className="widget-title">
            <WarningAmberIcon fontSize="small" sx={{ mr: 1 }} />
            Action Required
            <Chip 
              label={totalActions} 
              color={totalActions > 0 ? "error" : "default"}
              size="small"
              className="action-count-chip"
            />
          </Typography>
        </Box>
        
        {totalActions === 0 ? (
          <Box className="no-actions-message">
            <Typography variant="body1" color="textSecondary" align="center">
              No pending actions require your attention
            </Typography>
          </Box>
        ) : (
          <Box className="action-lists-container">
            {/* Pending Expenses (formerly Approvals) */}
            {pendingExpenses.length > 0 && (
              <Box className="action-list">
                <Box className="action-list-header">
                  <Typography variant="subtitle2">
                    Pending Expenses
                  </Typography>
                  <Chip 
                    label={pendingExpenses.length}
                    size="small"
                    color="primary"
                  />
                </Box>
                <List dense disablePadding>
                  {pendingExpenses.slice(0, 3).map((item, index) => (
                    <ListItem key={`expense-${index}`}> {/* Changed key prefix */}
                      <ListItemText 
                        primary={item.description || 'Expense requires review'} // Updated text
                        secondary={`Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount || 0)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Subscriptions Ending Soon (formerly Expiring) */}
            {subscriptionsEndingSoon.length > 0 && (
              <Box className="action-list">
                <Box className="action-list-header">
                  <Typography variant="subtitle2">
                    Subscriptions Ending Soon
                  </Typography>
                  <Chip 
                    label={subscriptionsEndingSoon.length}
                    size="small"
                    color="warning"
                  />
                </Box>
                <List dense disablePadding>
                  {subscriptionsEndingSoon.slice(0, 3).map((item, index) => (
                    <ListItem key={`subscription-${index}`}>
                      <ListItemText 
                        primary={`${item.user?.name || 'Customer'}'s ${item.subscriptionPlan?.name || 'subscription'}`}
                        secondary={`Ends: ${new Date(item.endDate).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Pending Payments (remains the same) */}
            {pendingPayments.length > 0 && (
              <Box className="action-list">
                <Box className="action-list-header">
                  <Typography variant="subtitle2">
                    Pending Payments
                  </Typography>
                  <Chip 
                    label={pendingPayments.length}
                    size="small"
                    color="error"
                  />
                </Box>
                <List dense disablePadding>
                  {pendingPayments.slice(0, 3).map((item, index) => (
                    <ListItem key={`payment-${index}`}>
                      <ListItemText 
                        primary={`${item.description || 'Payment'} - ${new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(item.amount || 0)}`}
                        secondary={`Due: ${new Date(item.dueDate).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {totalActions > 9 && (
              <Box className="view-all-actions">
                <Typography variant="button" color="primary">
                  View All ({totalActions})
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionRequiredWidget;