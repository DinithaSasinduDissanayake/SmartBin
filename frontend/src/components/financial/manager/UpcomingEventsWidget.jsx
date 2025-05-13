import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import './ManagerDashboardWidgets.css';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to calculate days difference
const getDaysUntil = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
};

/**
 * Upcoming Events Widget for Financial Manager Dashboard
 * Shows calendar of upcoming financial events like payment dues and subscription endings
 */
const UpcomingEventsWidget = ({ data }) => {
  // Extract data with fallbacks
  const { upcomingEvents = [] } = data || {};
  
  // Group events by date
  const groupedEvents = upcomingEvents.reduce((groups, event) => {
    const date = formatDate(event.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});
  
  // Get unique dates and sort them
  const dates = Object.keys(groupedEvents);
  
  return (
    <Card className="dashboard-widget upcoming-events-widget">
      <CardContent>
        <Box className="widget-header">
          <Typography variant="h6" component="h3" className="widget-title">
            <EventIcon fontSize="small" sx={{ mr: 1 }} />
            Upcoming Financial Events
          </Typography>
        </Box>
        
        {upcomingEvents.length === 0 ? (
          <Box className="no-events-message">
            <Typography variant="body1" color="textSecondary" align="center">
              No upcoming events scheduled
            </Typography>
          </Box>
        ) : (
          <List disablePadding className="events-list">
            {dates.map((date, index) => {
              const eventsOnDate = groupedEvents[date];
              
              return (
                <React.Fragment key={date}>
                  {index > 0 && <Divider component="li" />}
                  
                  <ListItem className="date-header">
                    <Typography variant="subtitle2" component="div">
                      {date}
                    </Typography>
                  </ListItem>
                  
                  {eventsOnDate.map((event, eventIdx) => (
                    <ListItem 
                      key={`${date}-${eventIdx}`} 
                      className={`event-item event-type-${event.type}`}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" component="span" className="event-description">
                            {event.description}
                            {event.amount && 
                              <span className="event-amount"> ({formatCurrency(event.amount)})</span>
                            }
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" component="span" className="event-timing">
                            {getDaysUntil(event.date)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsWidget;