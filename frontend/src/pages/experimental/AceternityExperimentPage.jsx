// frontend/src/pages/experimental/AceternityExperimentPage.jsx
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
  Paper,
  Container
} from '@mui/material';

// CSS for Aceternity-like styling
import './AceternityExperimentPage.css';

/**
 * This is an experimental page for testing Aceternity UI components
 * alongside our existing Material UI components
 */
const AceternityExperimentPage = () => {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleShowSnackbar = () => {
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleMouseMove = (e, cardId) => {
    if (hoveredCard === cardId) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Aceternity UI Experiment Page
        </Typography>
        <Typography variant="body1" paragraph>
          This page demonstrates how Aceternity UI components would look alongside our existing Material UI components.
          Aceternity UI offers modern, animated components to enhance user experience with motion and interactivity.
        </Typography>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 6 }}>
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
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Notification</Typography>
              <MuiButton variant="contained" color="secondary" onClick={handleShowSnackbar}>
                Show Notification
              </MuiButton>
            </Box>
          </CardContent>
        </Card>

        {/* Aceternity UI Styled Components */}
        <div className="aceternity-card">
          <div className="aceternity-card-content">
            <h2 className="aceternity-heading">Aceternity UI Styled Components</h2>
            
            {/* Buttons with shine effect */}
            <div className="aceternity-section">
              <h3 className="aceternity-subtitle">Animated Buttons</h3>
              <div className="aceternity-button-group">
                <button className="aceternity-button aceternity-button-primary">
                  <span className="aceternity-button-text">Primary</span>
                  <span className="aceternity-button-shine"></span>
                </button>
                <button className="aceternity-button aceternity-button-outline">
                  <span className="aceternity-button-text">Secondary</span>
                </button>
                <button className="aceternity-button aceternity-button-ghost">
                  <span className="aceternity-button-text">Ghost</span>
                </button>
              </div>
            </div>
            
            {/* Glowing input */}
            <div className="aceternity-section">
              <h3 className="aceternity-subtitle">Glowing Input</h3>
              <div className="aceternity-form-item">
                <label className="aceternity-label">Aceternity UI Input</label>
                <div className="aceternity-input-wrapper">
                  <input 
                    type="text" 
                    className="aceternity-input" 
                    placeholder="Type here..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <div className="aceternity-input-glow"></div>
                </div>
              </div>
            </div>
            
            {/* Animated counter */}
            <div className="aceternity-section">
              <h3 className="aceternity-subtitle">Animated Counter</h3>
              <button className="aceternity-button aceternity-button-primary aceternity-effect-pulse" onClick={handleIncrement}>
                <span className="aceternity-button-text">Count: {count}</span>
              </button>
            </div>
            
            {/* Animated toggle switch */}
            <div className="aceternity-section">
              <h3 className="aceternity-subtitle">Animated Switch</h3>
              <div className="aceternity-switch-container">
                <label className="aceternity-switch">
                  <input 
                    type="checkbox" 
                    checked={switchValue} 
                    onChange={() => setSwitchValue(!switchValue)} 
                  />
                  <span className="aceternity-switch-slider"></span>
                  <span className="aceternity-switch-glow"></span>
                </label>
                <span className="aceternity-switch-label">{switchValue ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            
            {/* Spotlight cards */}
            <div className="aceternity-section">
              <h3 className="aceternity-subtitle">Spotlight Cards</h3>
              <div className="aceternity-spotlight-container">
                <div 
                  className="aceternity-spotlight-card"
                  onMouseEnter={() => setHoveredCard('card1')}
                  onMouseLeave={() => setHoveredCard(null)}
                  onMouseMove={(e) => handleMouseMove(e, 'card1')}
                >
                  <div className="aceternity-spotlight-card-content">
                    <h4>Hover Me!</h4>
                    <p>Interactive spotlight effect</p>
                  </div>
                </div>
                <div 
                  className="aceternity-spotlight-card"
                  onMouseEnter={() => setHoveredCard('card2')}
                  onMouseLeave={() => setHoveredCard(null)}
                  onMouseMove={(e) => handleMouseMove(e, 'card2')}
                >
                  <div className="aceternity-spotlight-card-content">
                    <h4>Motion Effects</h4>
                    <p>Hover to see the magic</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notification button with animation */}
            <div className="aceternity-section">
              <h3 className="aceternity-subtitle">Notification</h3>
              <button 
                className="aceternity-button aceternity-button-secondary aceternity-effect-ripple"
                onClick={handleShowSnackbar}
              >
                <span className="aceternity-button-text">Show Notification</span>
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

      {/* Additional documentation section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          About Aceternity UI
        </Typography>
        <Typography variant="body1" paragraph>
          Aceternity UI is a modern component library that focuses on animations and interactive effects.
          Unlike Shadcn UI, it does still require Tailwind CSS for implementation in a real project.
          This demo shows how the components would look and feel without using Tailwind.
        </Typography>
        <Typography variant="body1">
          Key features:
        </Typography>
        <ul>
          <Box component="li" sx={{ mt: 1 }}>Motion-based interactions and animations</Box>
          <Box component="li" sx={{ mt: 1 }}>Modern, clean aesthetic with subtle effects</Box>
          <Box component="li" sx={{ mt: 1 }}>Engaging user experience through micro-interactions</Box>
          <Box component="li" sx={{ mt: 1 }}>Spotlight effects and cursor-following elements</Box>
        </ul>
      </Paper>
    </Container>
  );
};

export default AceternityExperimentPage;