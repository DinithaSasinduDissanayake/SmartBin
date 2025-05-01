import React, { useState, useEffect } from 'react';
import complaintApi from '../../services/complaintApi';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper, 
  FormControl,
  CircularProgress,
  Snackbar,
  Fade
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Component for submitting new complaints
 * Uses Material UI components for styling consistency with improved feedback
 */
const ComplaintForm = ({ onSubmitSuccess }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      setShowSnackbar(true);
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Form validation with more descriptive messages
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Subject and description are required fields.');
      return;
    }
    
    if (formData.subject.trim().length < 5) {
      setError('Subject must be at least 5 characters long for clarity.');
      return;
    }
    
    if (formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long to provide enough detail for our team to address your concern.');
      return;
    }
    
    setLoading(true);
    try {
      await complaintApi.submitComplaint(formData);
      setFormData({ subject: '', description: '' }); // Clear form
      setSuccessMessage('Complaint submitted successfully! Our team will review it shortly.'); // More informative success message
      if (onSubmitSuccess) onSubmitSuccess(); // Notify parent component
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again later.');
      console.error('Complaint submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSnackbar(false);
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mt: 2, 
        p: 3, 
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: theme.shadows[3],
          transform: 'translateY(-2px)'
        }
      }}
      className="complaint-form"
    >
      <Typography 
        variant="h5" 
        component="h3" 
        sx={{ 
          mb: 2,
          color: theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
          paddingBottom: 1
        }}
      >
        Submit a New Complaint
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            animation: 'fadeIn 0.3s ease'
          }}
          onClose={() => setError('')}
          variant="outlined"
        >
          {error}
        </Alert>
      )}
      
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{
          '& .MuiTextField-root': { mb: 2 },
          position: 'relative'
        }}
      >
        <FormControl fullWidth margin="normal">
          <TextField
            id="subject"
            name="subject"
            label="Subject"
            value={formData.subject}
            onChange={handleChange}
            inputProps={{ maxLength: 150 }}
            required
            disabled={loading}
            placeholder="Brief title of your complaint"
            helperText={`${formData.subject.length}/150 characters`}
            FormHelperTextProps={{ sx: { textAlign: 'right' } }}
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!error && error.includes('Subject')}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              },
            }}
          />
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <TextField
            id="description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={5}
            inputProps={{ maxLength: 2000 }}
            required
            disabled={loading}
            placeholder="Please provide details about your complaint"
            helperText={`${formData.description.length}/2000 characters`}
            FormHelperTextProps={{ sx: { textAlign: 'right' } }}
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!error && error.includes('Description')}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              },
            }}
          />
        </FormControl>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={loading}
          sx={{ 
            mt: 2,
            position: 'relative',
            minWidth: '150px',
            fontWeight: theme.typography.fontWeightMedium,
            transition: 'all 0.2s ease',
            '&:not(:disabled):hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4]
            }
          }}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </Button>
      </Box>

      {/* Success message as a snackbar for non-intrusive feedback */}
      <Snackbar
        open={showSnackbar && !!successMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        TransitionComponent={Fade}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: theme.palette.success.main,
            color: '#fff'
          }
        }}
      />
    </Paper>
  );
};

export default ComplaintForm;