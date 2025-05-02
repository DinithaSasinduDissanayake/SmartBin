import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Tab, Tabs } from '@mui/material';
import ScheduleDisplay from '../../components/ScheduleDisplay';
import ResourcesDisplay from '../../components/ResourcesDisplay';
import '../../styles/themeStyles.css';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Sample staff metrics
  const staffMetrics = [
    { title: 'Attendance Status', value: 'Present', color: '#4caf50' },
    { title: 'Assigned Tasks', value: '5', color: '#2196f3' },
    { title: 'Performance Rating', value: '4.5/5', color: '#ff9800' },
    { title: 'Next Payroll', value: '2025-05-15', color: '#9c27b0' }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Staff Dashboard
      </Typography>

      {/* Staff Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {staffMetrics.map((metric, index) => (
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

      {/* Tabs for different operational views */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="My Schedule" />
          <Tab label="Available Resources" />
          {/* Add more staff-specific tabs here, e.g., Tasks, Attendance */}
        </Tabs>
      </Paper>

      {/* Tab content panels */}
      <Paper sx={{ p: 3 }}>
        {activeTab === 0 && <ScheduleDisplay />}
        {activeTab === 1 && <ResourcesDisplay />}
        {/* Render other staff components based on activeTab */}
      </Paper>
    </Box>
  );
};

export default StaffDashboard;