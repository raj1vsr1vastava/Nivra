import { createTheme, Theme } from '@mui/material';

// Create theme aligned with our CSS variables in theme.css
const theme: Theme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9', // --color-primary
      light: '#38bdf8', // --color-primary-light
      dark: '#0284c7', // --color-primary-dark
    },
    secondary: {
      main: '#8b5cf6', // --color-secondary
      light: '#a78bfa', // --color-secondary-light
      dark: '#7c3aed', // --color-secondary-dark
    },
    text: {
      primary: '#0f172a', // --color-text-primary
      secondary: '#334155', // --color-text-secondary
    },
    background: {
      default: '#ffffff', // --color-background
      paper: '#ffffff', // --color-card
    },
    success: {
      main: '#10b981', // --color-success
      light: '#d1fae5', // --color-success-light
    },
    warning: {
      main: '#f59e0b', // --color-warning
      light: '#fef3c7', // --color-warning-light
    },
    error: {
      main: '#ef4444', // --color-error
      light: '#fee2e2', // --color-error-light
    },
    info: {
      main: '#0ea5e9', // --color-info
      light: '#dbeafe', // --color-info-light
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h4: {
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.25,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // --radius-lg
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)', // --shadow-xs
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // --shadow-sm
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // --shadow-md
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // --shadow-lg
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // --shadow-xl
    '0 25px 50px -12px rgb(0 0 0 / 0.25)', // --shadow-2xl
    'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none',
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
          borderRadius: 6,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
