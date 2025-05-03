import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Tab, Tabs } from '@mui/material';
import ResourcesDisplay from '../../components/ResourcesDisplay';
import ScheduleDisplay from '../../components/ScheduleDisplay';
import '../../styles/themeStyles.css';

const FinancialManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Sample financial metrics
  const financialMetrics = [
    { title: 'Daily Revenue', value: '$1,250', color: '#4caf50' },
    { title: 'Monthly Expenses', value: '$8,400', color: '#f44336' },
    { title: 'New Subscriptions (Today)', value: '15', color: '#2196f3' },
    { title: 'Profit Margin', value: '32%', color: '#ff9800' }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Financial Manager Dashboard
      </Typography>

      {/* Financial Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {financialMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                borderTop: `4px solid ${metric.color}`,
                height: '100%'
              }}
            >
              <Typography variant="h6" color="textSecondary">
                {metric.title}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {metric.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Resource Overview" />
          <Tab label="Schedule Overview" />
          {/* Add more financial-specific tabs here */}
        </Tabs>
      </Paper>

      {/* Tab content panels */}
      <Paper sx={{ p: 3 }}>
        {activeTab === 0 && <ResourcesDisplay />}
        {activeTab === 1 && <ScheduleDisplay />}
        {/* Render other financial components based on activeTab */}
      </Paper>
    </Box>
  );
};

export default FinancialManagerDashboard;