import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Grid,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import '../styles/theme.css';

const SocietyCard = ({ society }) => {
  const navigate = useNavigate();
  const formattedDate = society.registration_date ? new Date(society.registration_date).toLocaleDateString() : 'Not Available';

  return (
    <Card className="modern-card" sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderLeft: '4px solid var(--primary-color)',
      '&:hover': {
        borderColor: 'var(--accent-color)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            mb: 2
          }}
        >
          {society.name}
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
          <LocationOnIcon 
            fontSize="small" 
            sx={{ 
              mr: 1.5, 
              color: 'var(--primary-color)',
              mt: 0.3
            }} 
          />
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {society.address}, {society.city}, {society.state} {society.zipcode}, {society.country}
          </Typography>
        </Box>
        
        {society.contact_email && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'flex-start' }}>
            <EmailIcon 
              fontSize="small" 
              sx={{ 
                mr: 1.5, 
                color: 'var(--secondary-color)',
                mt: 0.3
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ color: 'var(--text-secondary)' }}
            >
              {society.contact_email}
            </Typography>
          </Box>
        )}
        
        {society.contact_phone && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'flex-start' }}>
            <PhoneIcon 
              fontSize="small" 
              sx={{ 
                mr: 1.5, 
                color: 'var(--secondary-color)',
                mt: 0.3
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ color: 'var(--text-secondary)' }}
            >
              {society.contact_phone}
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <HomeIcon 
                fontSize="small" 
                sx={{ 
                  mr: 1.5, 
                  color: 'var(--info)',
                  mt: 0.3
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: 'var(--text-secondary)'
                }}
              >
                {society.total_units} Units
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CalendarMonthIcon 
                fontSize="small" 
                sx={{ 
                  mr: 1.5, 
                  color: 'var(--info)',
                  mt: 0.3
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: 'var(--text-secondary)'
                }}
              >
                Reg: {formattedDate}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {society.registration_number && (
          <Box sx={{ mt: 2.5 }}>
            <Chip 
              label={`Reg #: ${society.registration_number}`} 
              variant="outlined" 
              size="small" 
              sx={{ 
                borderColor: 'var(--accent-color)', 
                color: 'var(--accent-color)',
                fontWeight: 500
              }}
            />
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          className="modern-button"
          size="small" 
          variant="contained"
          sx={{ 
            background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(45deg, var(--secondary-color), var(--primary-color))',
              transform: 'translateY(-2px)'
            }
          }}
          onClick={() => navigate(`/societies/${society.id}`)}
        >
          View Details
        </Button>
        <Button 
          className="modern-button"
          size="small" 
          sx={{ 
            color: 'var(--text-secondary)',
            fontWeight: 500,
            '&:hover': {
              color: 'var(--accent-color)',
            }
          }}
          onClick={() => navigate(`/societies/${society.id}/residents`)}
        >
          View Residents
        </Button>
        <Button 
          className="modern-button"
          size="small"
          sx={{ 
            color: 'var(--text-secondary)',
            fontWeight: 500,
            '&:hover': {
              color: 'var(--accent-color)',
            }
          }} 
          onClick={() => navigate(`/societies/${society.id}/finances`)}
        >
          Finances
        </Button>
      </CardActions>
    </Card>
  );
};

export default SocietyCard;
