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
  CircularProgress
} from '@mui/material';

/**
 * Component for submitting new complaints
 * Uses Material UI components for styling consistency
 */
const ComplaintForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
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
    
    // Form validation
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    
    if (formData.subject.trim().length < 5) {
      setError('Subject must be at least 5 characters long.');
      return;
    }
    
    if (formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long.');
      return;
    }
    
    setLoading(true);
    try {
      await complaintApi.submitComplaint(formData);
      setFormData({ subject: '', description: '' }); // Clear form
      setSuccessMessage('Complaint submitted successfully!'); // Set success message
      if (onSubmitSuccess) onSubmitSuccess(); // Notify parent component
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
      console.error('Complaint submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mt: 2, 
        p: 3, 
        borderRadius: 1 
      }}
      className="complaint-form"
    >
      <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
        Submit a New Complaint
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
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
          />
        </FormControl>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={loading}
          sx={{ mt: 2 }}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ComplaintForm;