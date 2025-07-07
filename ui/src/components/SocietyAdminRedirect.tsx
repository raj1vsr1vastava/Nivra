import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { societyService } from '../services';
import { CircularProgress, Box } from '@mui/material';

interface SocietyAdminRedirectProps {
  children: React.ReactNode;
}

const SocietyAdminRedirect: React.FC<SocietyAdminRedirectProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (user?.role === 'society_admin' && user.id) {
        try {
          // Fetch the societies administered by this user
          const administeredSocieties = await societyService.getAdministeredSocieties(user.id);
          
          if (administeredSocieties.length > 0) {
            // Redirect to the first (and likely only) society they administer
            navigate(`/societies/${administeredSocieties[0].id}`, { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error fetching administered societies:', error);
        }
      }
      setLoading(false);
    };

    handleRedirect();
  }, [user, navigate]);

  if (loading && user?.role === 'society_admin') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default SocietyAdminRedirect;
