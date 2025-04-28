import { createTheme } from '@mui/material/styles';

/**
 * SmartBin Material UI Theme
 * 
 * This theme is designed to match the SmartBin brand colors and design specifications.
 * It provides consistent styling for all Material UI components throughout the application.
 */
const smartBinTheme = createTheme({
  palette: {
    primary: {
      main: '#3e4b2e', // SmartBin primary green
      light: '#5e7245',
      dark: '#2c3720',
      contrastText: '#fff',
    },
    secondary: {
      main: '#5e6472', // SmartBin secondary color
      light: '#7d8490',
      dark: '#424854',
      contrastText: '#fff',
    },
    error: {
      main: '#dc3545', // Bootstrap danger red for consistency
    },
    warning: {
      main: '#ffc107', // Bootstrap warning yellow
    },
    info: {
      main: '#0dcaf0', // Bootstrap info blue
    },
    success: {
      main: '#198754', // Bootstrap success green
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none', // Avoid ALL CAPS buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '8px 16px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#304021',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#3e4b2e',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8f9fa',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default smartBinTheme;