// frontend/src/pages/experimental/ShadcnExperimentPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Button as MuiButton, 
  TextField, 
  Card, 
  CardContent, 
  Typography, 
  Switch,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';

// CSS for shadcn-like styling
import './ShadcnExperimentPage.css';

/**
 * This is an experimental page for testing shadcn/ui components
 * alongside our existing Material UI components
 */
const ShadcnExperimentPage = () => {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleShowSnackbar = () => {
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Shadcn/UI Experiment Page
        </Typography>
        <Typography variant="body1" paragraph>
          This page demonstrates how shadcn/ui components would look alongside our existing Material UI components.
          You can use this page to experiment with the shadcn/ui design system and decide if it's right for your project.
        </Typography>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* Material UI Components */}
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Material UI Components (Current)
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Buttons</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <MuiButton variant="contained" color="primary">Primary</MuiButton>
                <MuiButton variant="outlined" color="primary">Secondary</MuiButton>
                <MuiButton variant="text">Text</MuiButton>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Input</Typography>
              <TextField 
                label="Material UI Input" 
                variant="outlined" 
                fullWidth 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Counter</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MuiButton variant="contained" onClick={handleIncrement}>
                  Count: {count}
                </MuiButton>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Switch</Typography>
              <Switch 
                checked={switchValue} 
                onChange={() => setSwitchValue(!switchValue)} 
              />
              <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                {switchValue ? 'On' : 'Off'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>Notification</Typography>
              <MuiButton variant="contained" color="secondary" onClick={handleShowSnackbar}>
                Show Notification
              </MuiButton>
            </Box>
          </CardContent>
        </Card>

        {/* Shadcn UI Styled Components */}
        <div className="shadcn-card">
          <div className="shadcn-card-content">
            <h2 className="shadcn-heading">Shadcn UI Styled Components</h2>
            
            <div className="shadcn-section">
              <h3 className="shadcn-subtitle">Buttons</h3>
              <div className="shadcn-button-group">
                <button className="shadcn-button shadcn-button-primary">Primary</button>
                <button className="shadcn-button shadcn-button-outline">Secondary</button>
                <button className="shadcn-button shadcn-button-ghost">Text</button>
              </div>
            </div>
            
            <div className="shadcn-section">
              <h3 className="shadcn-subtitle">Input</h3>
              <div className="shadcn-form-item">
                <label className="shadcn-label">Shadcn UI Input</label>
                <input 
                  type="text" 
                  className="shadcn-input" 
                  placeholder="Type here..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </div>
            
            <div className="shadcn-section">
              <h3 className="shadcn-subtitle">Counter</h3>
              <button className="shadcn-button shadcn-button-primary" onClick={handleIncrement}>
                Count: {count}
              </button>
            </div>
            
            <div className="shadcn-section">
              <h3 className="shadcn-subtitle">Switch</h3>
              <div className="shadcn-switch-container">
                <label className="shadcn-switch">
                  <input 
                    type="checkbox" 
                    checked={switchValue} 
                    onChange={() => setSwitchValue(!switchValue)} 
                  />
                  <span className="shadcn-switch-slider"></span>
                </label>
                <span className="shadcn-switch-label">{switchValue ? 'On' : 'Off'}</span>
              </div>
            </div>
            
            <div className="shadcn-section">
              <h3 className="shadcn-subtitle">Notification</h3>
              <button 
                className="shadcn-button shadcn-button-secondary"
                onClick={handleShowSnackbar}
              >
                Show Notification
              </button>
            </div>
          </div>
        </div>
      </Box>

      {/* MUI Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          This is a notification message!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShadcnExperimentPage;