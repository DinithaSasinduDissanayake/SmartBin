// BinStatusCard.jsx - A reusable component for displaying bin status information
import React from 'react';
import PropTypes from 'prop-types';
import { 
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Styled components for better visual consistency
const StyledCard = styled(Card)(({ theme, fillLevel }) => ({
  position: 'relative',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
  borderLeft: `4px solid ${
    fillLevel >= 90 ? theme.palette.error.main :
    fillLevel >= 70 ? theme.palette.warning.main :
    theme.palette.success.main
  }`
}));

const StyledChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status?.toLowerCase()) {
    case 'active':
      color = theme.palette.success.main;
      break;
    case 'pending':
      color = theme.palette.warning.main;
      break;
    case 'scheduled':
      color = theme.palette.info.main;
      break;
    case 'completed':
      color = theme.palette.success.dark;
      break;
    case 'cancelled':
      color = theme.palette.error.light;
      break;
    case 'maintenance':
      color = theme.palette.warning.dark;
      break;
    default:
      color = theme.palette.grey[500];
  }
  
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 'bold'
  };
});

/**
 * BinStatusCard Component
 * 
 * A reusable card component for displaying bin status information
 * throughout the SmartBin application. This component follows the
 * project's design guidelines and uses MUI components.
 * 
 * @param {Object} props - Component props
 * @returns {React.ReactElement} The BinStatusCard component
 */
const BinStatusCard = ({
  binId,
  location,
  fillLevel,
  lastEmptied,
  nextScheduledPickup,
  status,
  temperature,
  binType,
  onViewDetails,
  onRequestPickup,
  onScheduleMaintenance,
  onCancelRequest,
  variant = 'standard'
}) => {
  // Format date strings consistently
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Helper to determine progress color
  const getProgressColor = (level) => {
    if (level >= 90) return 'error';
    if (level >= 70) return 'warning';
    return 'success';
  };
  
  // Determine fill level text
  const getFillLevelText = (level) => {
    if (level >= 90) return 'Critical - Pickup Required';
    if (level >= 70) return 'Warning - Plan Pickup Soon';
    return 'Good - Capacity Available';
  };

  // Determine which actions to show based on variant and status
  const showActions = variant !== 'compact';
  const canRequestPickup = status?.toLowerCase() !== 'scheduled' && 
                          status?.toLowerCase() !== 'pending' && 
                          fillLevel > 50;
  const canCancelRequest = status?.toLowerCase() === 'scheduled' || 
                          status?.toLowerCase() === 'pending';

  return (
    <StyledCard fillLevel={fillLevel} variant="outlined">
      <CardContent>
        {/* Header with ID and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div">
            Bin {binId}
          </Typography>
          <StyledChip 
            label={status} 
            status={status} 
            size="small" 
            data-testid="bin-status-chip"
          />
        </Box>

        {/* Location */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Location:</strong> {location}
        </Typography>

        {/* Bin Type - Only show in standard variant */}
        {variant === 'standard' && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Type:</strong> {binType}
          </Typography>
        )}

        {/* Fill Level */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" component="div">
              Fill Level
            </Typography>
            <Typography variant="body2" component="div">
              {fillLevel}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={fillLevel} 
            color={getProgressColor(fillLevel)} 
            sx={{ mt: 0.5, height: 8, borderRadius: 4 }} 
            data-testid="fill-level-progress"
          />
          <Typography variant="caption" color={getProgressColor(fillLevel)} sx={{ mt: 0.5, display: 'block' }}>
            {getFillLevelText(fillLevel)}
          </Typography>
        </Box>

        {/* Temperature - Only show in standard variant */}
        {variant === 'standard' && temperature !== undefined && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Temperature:</strong>
            </Typography>
            <Chip 
              label={`${temperature}°C`}
              size="small"
              color={temperature > 35 ? 'warning' : 'default'}
              data-testid="temperature-chip"
            />
          </Box>
        )}

        {/* Dates - Conditionally show based on variant */}
        {variant === 'standard' && (
          <>
            <Typography variant="body2" color="text.secondary">
              <strong>Last Emptied:</strong> {formatDate(lastEmptied)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Next Pickup:</strong> {formatDate(nextScheduledPickup)}
            </Typography>
          </>
        )}
        {variant === 'compact' && nextScheduledPickup && (
          <Typography variant="body2" color="text.secondary">
            <strong>Next:</strong> {formatDate(nextScheduledPickup)}
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardActions sx={{ padding: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                onClick={() => onViewDetails?.(binId)}
                aria-label="View bin details"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            {canRequestPickup && (
              <Tooltip title="Request Pickup">
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={() => onRequestPickup?.(binId)}
                  aria-label="Request pickup"
                  data-testid="request-pickup-button"
                >
                  <LocalShippingIcon />
                </IconButton>
              </Tooltip>
            )}
            {status?.toLowerCase() === 'active' && (
              <Tooltip title="Schedule Maintenance">
                <IconButton 
                  size="small" 
                  onClick={() => onScheduleMaintenance?.(binId)}
                  aria-label="Schedule maintenance"
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
            {canCancelRequest && (
              <Tooltip title="Cancel Request">
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => onCancelRequest?.(binId)}
                  aria-label="Cancel request"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          {/* Main action button */}
          {variant === 'standard' && (
            <Button 
              size="small" 
              variant="contained" 
              onClick={() => onViewDetails?.(binId)}
              aria-label="View all details"
              endIcon={<InfoIcon />}
            >
              Details
            </Button>
          )}
        </CardActions>
      )}
    </StyledCard>
  );
};

// PropTypes for documentation and validation
BinStatusCard.propTypes = {
  binId: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  fillLevel: PropTypes.number.isRequired,
  lastEmptied: PropTypes.string,
  nextScheduledPickup: PropTypes.string,
  status: PropTypes.oneOf(['Active', 'Pending', 'Scheduled', 'Completed', 'Cancelled', 'Maintenance']),
  temperature: PropTypes.number,
  binType: PropTypes.string,
  onViewDetails: PropTypes.func,
  onRequestPickup: PropTypes.func,
  onScheduleMaintenance: PropTypes.func,
  onCancelRequest: PropTypes.func,
  variant: PropTypes.oneOf(['standard', 'compact', 'detailed'])
};

export default BinStatusCard;
