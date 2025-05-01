import React from 'react';
import { 
  Alert, 
  Snackbar, 
  Slide, 
  CircularProgress, 
  Box, 
  Typography 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * A reusable component for displaying feedback messages to users.
 * This component can display error messages, success messages, and loading states
 * with a consistent design throughout the application.
 * 
 * @param {Object} props - The component props
 * @param {string} props.message - The message to display
 * @param {string} props.type - The type of message: 'error', 'success', 'info', or 'warning'
 * @param {boolean} props.loading - Whether to show a loading indicator
 * @param {string} props.loadingMessage - Message to display during loading state
 * @param {boolean} props.inline - Whether to display the message inline (Alert) or as a Snackbar
 * @param {Function} props.onClose - Function to call when the message is closed
 * @param {number} props.duration - How long to display the message in milliseconds (for Snackbar only)
 */
const FeedbackMessage = ({
  message,
  type = 'info',
  loading = false,
  loadingMessage = 'Processing...',
  inline = true,
  onClose,
  duration = 5000
}) => {
  const theme = useTheme();
  
  // If loading is true, show a loading indicator
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: inline ? 'flex-start' : 'center',
        p: 2,
        mb: 2,
        backgroundColor: theme.palette.grey[50],
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.grey[200]}`
      }}>
        <CircularProgress size={24} color="primary" />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {loadingMessage}
        </Typography>
      </Box>
    );
  }

  // If no message, return null
  if (!message) return null;

  // For inline messages (Alert component)
  if (inline) {
    return (
      <Alert 
        severity={type}
        onClose={onClose}
        sx={{
          mb: 2,
          animation: 'fadeIn 0.3s ease',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        {message}
      </Alert>
    );
  }

  // For non-inline messages (Snackbar component)
  return (
    <Snackbar
      open={!!message}
      autoHideDuration={duration}
      onClose={onClose}
      TransitionComponent={(props) => <Slide {...props} direction="up" />}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        severity={type} 
        variant="filled" 
        onClose={onClose}
        sx={{
          width: '100%',
          boxShadow: theme.shadows[3]
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default FeedbackMessage;