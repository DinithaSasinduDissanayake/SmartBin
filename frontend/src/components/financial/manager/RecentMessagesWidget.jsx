import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Avatar, ListItemAvatar, Button } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import './ManagerDashboardWidgets.css';

// Helper function to format dates relative to today
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Recent Messages Widget for Financial Manager Dashboard
 * Displays recent communications related to financial matters
 */
const RecentMessagesWidget = ({ data }) => {
  // Extract data with fallbacks
  const { recentMessages = [] } = data || {};
  
  return (
    <Card className="dashboard-widget recent-messages-widget">
      <CardContent>
        <Typography variant="h6" component="h3" className="widget-title">
          Recent Communications
        </Typography>
        
        {recentMessages.length === 0 ? (
          <Box className="no-messages-message">
            <Typography variant="body1" color="textSecondary" align="center">
              No recent financial-related communications
            </Typography>
          </Box>
        ) : (
          <>
            <List className="messages-list" disablePadding>
          {recentMessages.map((message) => (
            <ListItem 
              key={message._id || message.id} 
              divider 
              className="message-item"
            >
              <ListItemAvatar>
                <Avatar className="message-avatar">
                  <EmailIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box className="message-header">
                    <Typography component="span" variant="subtitle2" className="message-sender">
                      {message.user?.name || 'Anonymous'}
                    </Typography>
                    <Typography component="span" variant="caption" className="message-time">
                      {formatRelativeTime(message.createdAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography 
                    component="div" 
                    variant="body2" 
                    className="message-preview"
                  >
                    {truncateText(message.message || message.content, 80)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
            
            <Box mt={1} className="view-all-messages">
              <Button 
                variant="text" 
                size="small" 
                color="primary"
                href="/dashboard/complaints"
              >
                View All Messages
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMessagesWidget;