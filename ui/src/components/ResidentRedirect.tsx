import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import residentService from '../services/residents/residentService';
import { CircularProgress, Box } from '@mui/material';

interface ResidentRedirectProps {
  children: React.ReactNode;
}

const ResidentRedirect: React.FC<ResidentRedirectProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (user?.role === 'Resident' && user.id) {
        try {
          // Fetch the resident data for this user
          const residentData = await residentService.getResidentByUserId(user.id);
          
          if (residentData) {
            // Redirect to the resident's own details page
            navigate(`/residents/${residentData.id}`, { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error fetching resident data:', error);
          // If there's an error (like 404), the user might not be associated with a resident
          // Redirect them to society selection or let them continue to see available options
        }
      }
      setLoading(false);
    };

    handleRedirect();
  }, [user, navigate]);

  if (loading && user?.role === 'Resident') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default ResidentRedirect;
