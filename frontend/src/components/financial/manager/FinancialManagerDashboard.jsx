import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import dashboardService from '../../../services/dashboardService';

// Import all widget components
import DailySnapshotWidget from './DailySnapshotWidget';
import ActionRequiredWidget from './ActionRequiredWidget';
import DailyActivityWidget from './DailyActivityWidget';
import RecentMessagesWidget from './RecentMessagesWidget';
import UpcomingEventsWidget from './UpcomingEventsWidget';

import './ManagerDashboardWidgets.css';

/**
 * Financial Manager Dashboard Component
 * Serves as the main dashboard for financial managers showing key financial metrics and widgets
 */
const FinancialManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getFinancialManagerDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Show loading state
  if (loading && !dashboardData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" className="financial-manager-dashboard">
      <Box className="dashboard-header" mb={3}>
        <Typography variant="h4" component="h1">
          Financial Manager Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} columns={{ xs: 12, md: 12, lg: 12 }}>
        <Grid item xs={12} lg={8}>
          <DailySnapshotWidget data={dashboardData?.dailySnapshot} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ActionRequiredWidget data={dashboardData?.actionRequired} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <DailyActivityWidget data={dashboardData?.dailyActivity} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <RecentMessagesWidget data={dashboardData?.communications} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <UpcomingEventsWidget data={dashboardData?.calendar} />
        </Grid>
        <Grid item xs={12}>
          <Box className="dashboard-quick-links">
            <Button 
              variant="contained" 
              color="primary"
              href="/dashboard/financial-overview"
            >
              Go to Detailed Financial Dashboard
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FinancialManagerDashboard;