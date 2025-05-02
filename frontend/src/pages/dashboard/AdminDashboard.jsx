import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Tab, Tabs } from '@mui/material';
import ScheduleManagement from '../../components/ScheduleManagement';
import EquipmentManagement from '../../components/EquipmentManagement';
import ResourceManagement from '../../components/ResourceManagement';
import ToolManagement from '../../components/ToolManagement';
import '../../styles/themeStyles.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Dashboard summary metrics
  const dashboardMetrics = [
    { title: 'Total Users', value: '2,547', color: '#4caf50' },
    { title: 'Active Subscriptions', value: '1,842', color: '#2196f3' },
    { title: 'Open Complaints', value: '24', color: '#ff9800' },
    { title: 'System Health', value: '98%', color: '#9c27b0' }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Admin Dashboard
      </Typography>
      
      {/* Dashboard Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardMetrics.map((metric, index) => (
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

      {/* Tabs for different management features */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Schedule Management" />
          <Tab label="Resource Management" />
          <Tab label="Equipment Management" />
          <Tab label="Tool Management" />
        </Tabs>
      </Paper>

      {/* Tab content panels */}
      <Paper sx={{ p: 3 }}>
        {activeTab === 0 && <ScheduleManagement />}
        {activeTab === 1 && <ResourceManagement />}
        {activeTab === 2 && <EquipmentManagement />}
        {activeTab === 3 && <ToolManagement />}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;