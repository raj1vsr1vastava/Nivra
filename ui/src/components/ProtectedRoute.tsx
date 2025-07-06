import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #F2E5D5 0%, #F8F2E8 50%, #E8DCC6 100%)' }}
      >
        <CircularProgress 
          size={60} 
          sx={{ color: '#2C5F5D' }} 
        />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle user status-based redirects
  if (user) {
    const currentPath = location.pathname;
    
    // If user is pending society approval
    if (user.userStatus === 'pending_society') {
      // Allow access to society selection and pending approval pages
      if (!currentPath.startsWith('/society-selection') && 
          !currentPath.startsWith('/pending-approval') &&
          currentPath !== '/login') {
        return <Navigate to="/society-selection" replace />;
      }
    }
    
    // If user is active but trying to access onboarding pages
    if (user.userStatus === 'active') {
      if (currentPath.startsWith('/society-selection') || 
          currentPath.startsWith('/pending-approval')) {
        return <Navigate to="/societies" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
