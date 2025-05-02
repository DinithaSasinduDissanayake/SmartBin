import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import './ManagerDashboardWidgets.css';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

/**
 * Daily Snapshot Widget for Financial Manager Dashboard
 * Displays key daily metrics: revenue, expenses, new customers, and staff attendance
 */
const DailySnapshotWidget = ({ data }) => {
  // Extract data with fallbacks
  const { revenue = 0, expenses = 0, newCustomers = 0, staffAttendance = {} } = data || {};
  const { present = 0, absent = 0, late = 0, leave = 0 } = staffAttendance;
  const totalStaff = present + absent + late + leave;
  
  return (
    <Card className="dashboard-widget daily-snapshot-widget">
      <CardContent>
        <Typography variant="h6" component="h3" className="widget-title">
          Today's Snapshot
        </Typography>
        
        <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12, lg: 12 }} className="snapshot-grid">
          <Grid xs={12} sm={6} md={3}>
            <Box className="snapshot-item">
              <Box className="snapshot-icon revenue">
                <TrendingUpIcon />
              </Box>
              <Box className="snapshot-content">
                <Typography variant="body2" color="textSecondary" component="span">
                  Today's Revenue
                </Typography>
                <Typography variant="h6" component="p">
                  {formatCurrency(revenue)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Box className="snapshot-item">
              <Box className="snapshot-icon expenses">
                <TrendingDownIcon />
              </Box>
              <Box className="snapshot-content">
                <Typography variant="body2" color="textSecondary" component="span">
                  Today's Expenses
                </Typography>
                <Typography variant="h6" component="p">
                  {formatCurrency(expenses)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Box className="snapshot-item">
              <Box className="snapshot-icon customers">
                <PeopleIcon />
              </Box>
              <Box className="snapshot-content">
                <Typography variant="body2" color="textSecondary" component="span">
                  New Customers
                </Typography>
                <Typography variant="h6" component="p">
                  {newCustomers}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Box className="snapshot-item">
              <Box className="snapshot-icon attendance">
                <AssignmentTurnedInIcon />
              </Box>
              <Box className="snapshot-content">
                <Typography variant="body2" color="textSecondary" component="span">
                  Staff Attendance
                </Typography>
                <Typography variant="h6" component="p">
                  {present}/{totalStaff}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 1.5 }} />
        <Box className="attendance-breakdown">
          <Typography variant="caption" color="textSecondary" component="span">
            Attendance Breakdown: 
          </Typography>
          <Box className="attendance-stats">
            <span className="attendance-stat present">{present} Present</span>
            <span className="attendance-stat absent">{absent} Absent</span>
            <span className="attendance-stat late">{late} Late</span>
            <span className="attendance-stat leave">{leave} Leave</span>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DailySnapshotWidget;