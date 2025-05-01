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
    divider: '#dee2e6',
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
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.1)',
    '0 2px 4px rgba(0, 0, 0, 0.1)',
    '0 4px 8px rgba(0, 0, 0, 0.12)',
    '0 8px 16px rgba(0, 0, 0, 0.14)',
    // Keep the rest of default shadows
    ...Array(20).fill(''),
  ],
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '8px 16px',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#304021',
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
        startIcon: {
          marginRight: '8px',
        },
        endIcon: {
          marginLeft: '8px',
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
          color: '#495057',
        },
        root: {
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
        },
        title: {
          fontSize: '1.25rem',
          fontWeight: 500,
        },
        subheader: {
          fontSize: '0.875rem',
          color: '#6c757d',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: '20px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
        },
        elevation4: {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.14)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.875rem',
        },
        standardSuccess: {
          backgroundColor: '#d1e7dd',
          color: '#0f5132',
        },
        standardError: {
          backgroundColor: '#f8d7da',
          color: '#842029',
        },
        standardWarning: {
          backgroundColor: '#fff3cd',
          color: '#664d03',
        },
        standardInfo: {
          backgroundColor: '#cff4fc',
          color: '#055160',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        margin: 'normal',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3e4b2e80',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3e4b2e',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6c757d',
            '&.Mui-focused': {
              color: '#3e4b2e',
            },
          },
          '& .MuiFilledInput-root': {
            borderRadius: '4px 4px 0 0',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 4,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          height: 32,
          fontSize: '0.875rem',
        },
        colorPrimary: {
          backgroundColor: '#3e4b2e',
        },
        deleteIcon: {
          color: 'inherit',
          opacity: 0.7,
          '&:hover': {
            opacity: 1,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          minHeight: 48,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#3e4b2e',
          height: 3,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          marginTop: 4,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.14)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          fontSize: '1.25rem',
          fontWeight: 500,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 500,
          fontSize: '0.75rem',
          minWidth: 20,
          height: 20,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
  },
});

export default smartBinTheme;