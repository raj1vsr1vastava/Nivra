import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import SocietiesList from './pages/societies/SocietiesList';
import SocietyDetails from './pages/societies/SocietyDetails';
import ResidentsList from './pages/residents/ResidentsList';
import ResidentFinancesList from './pages/finances/ResidentFinancesList';
import SocietyFinancesList from './pages/expenses/SocietyFinancesList';
import SettingsIndex from './pages/settings/SettingsIndex';
import UsersManagement from './pages/settings/UsersManagement';
import RolesManagement from './pages/settings/RolesManagement';
import PermissionsManagement from './pages/settings/PermissionsManagement';
import SocietyAdminsManagement from './pages/settings/SocietyAdminsManagement';
import './App.css';

// Create theme aligned with our CSS variables
const theme = createTheme({
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
    // Keep the remaining default MUI shadows
    ...Array(18).fill('none'),
  ],
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      shortest: 150,
      standard: 300,
      complex: 500,
    },
  },
});

// Settings pages are imported at the top

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Main routes */}
            <Route path="/societies" element={<SocietiesList />} />
            <Route path="/societies/:societyId" element={<SocietyDetails />} />
            <Route path="/residents" element={<ResidentsList />} />
            <Route path="/finances" element={<ResidentFinancesList />} />
            <Route path="/society-finances" element={<SocietyFinancesList />} />
            
            {/* Settings routes */}
            <Route path="/settings" element={<SettingsIndex />} />
            <Route path="/settings/users" element={<UsersManagement />} />
            <Route path="/settings/roles" element={<RolesManagement />} />
            <Route path="/settings/permissions" element={<PermissionsManagement />} />
            <Route path="/settings/society-admins" element={<SocietyAdminsManagement />} />
            
            {/* Fallback routes */}
            <Route path="/" element={<Navigate to="/societies" />} />
            <Route path="*" element={<Navigate to="/societies" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
