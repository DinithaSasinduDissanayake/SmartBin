import React, { useState } from 'react';
import complaintApi from '../../services/complaintApi';
// Import MUI components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme that matches SmartBin's color scheme
const smartBinTheme = createTheme({
  palette: {
    primary: {
      main: '#3e4b2e', // SmartBin primary green
      contrastText: '#fff',
    },
    secondary: {
      main: '#5e6472', // SmartBin secondary color
    },
    error: {
      main: '#dc3545', // Bootstrap danger red for consistency
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h6: {
      fontWeight: 500,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Avoid ALL CAPS buttons
          borderRadius: 4,
        },
      },
    },
  },
});

/**
 * Complaint Form Component using Material UI
 * This serves as an example of converting existing components to MUI
 */
const ComplaintFormMUI = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setLoading(true);
    try {
      await complaintApi.submitComplaint(formData);
      setFormData({ subject: '', description: '' });
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
      console.error('Complaint submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={smartBinTheme}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Submit a New Complaint
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="subject"
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={loading}
            inputProps={{ maxLength: 150 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            inputProps={{ maxLength: 2000 }}
            sx={{ mb: 2 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 1, py: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
          </Button>
        </Box>
      </Paper>
    </ThemeProvider>
  );
};

export default ComplaintFormMUI;