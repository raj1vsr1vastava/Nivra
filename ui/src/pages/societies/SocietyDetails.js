import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  CircularProgress, 
  Alert,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { societyService } from '../../services';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import './SocietyDetails.css';

const SocietyDetails = () => {
  const { societyId } = useParams();
  const navigate = useNavigate();
  const [society, setSociety] = useState(null);
  const [financesSummary, setFinancesSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSocietyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [societyId]);

  const fetchSocietyDetails = async () => {
    try {
      setLoading(true);
      const societyData = await societyService.getSocietyById(societyId);
      setSociety(societyData);
      
      // Also fetch financial summary
      try {
        const financesData = await societyService.getSocietyFinancesSummary(societyId);
        setFinancesSummary(financesData);
      } catch (financeErr) {
        console.error('Error fetching finances summary:', financeErr);
        // Don't set main error, just leave finances summary null
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching society details:', err);
      setError('Failed to load society details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="society-details-container">
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress size={40} sx={{ color: 'var(--primary-color)' }} />
          </Box>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="society-details-container">
        <Container maxWidth="lg">
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3, 
              mb: 3,
              borderRadius: 'var(--border-radius)',
              fontWeight: 500
            }}
          >
            {error}
          </Alert>
          <Button 
            className="modern-button"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/societies')}
            sx={{ 
              color: 'var(--primary-color)',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
          >
            Back to Societies
          </Button>
        </Container>
      </div>
    );
  }

  if (!society) {
    return (
      <div className="society-details-container">
        <Container maxWidth="lg">
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 3, 
              mb: 3,
              borderRadius: 'var(--border-radius)',
              fontWeight: 500
            }}
          >
            Society not found
          </Alert>
          <Button 
            className="modern-button"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/societies')}
            sx={{ 
              color: 'var(--primary-color)',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
          >
            Back to Societies
          </Button>
        </Container>
      </div>
    );
  }

  const formattedDate = society.registration_date 
    ? new Date(society.registration_date).toLocaleDateString() 
    : 'Not Available';

  return (
    <div className="society-details-container">
      <Container maxWidth="lg">
        <div className="society-header">
          <Button 
            className="modern-button"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/societies')}
            sx={{ 
              mr: 2,
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--primary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
          >
            Back
          </Button>
          <h1 className="society-header-title">
            {society.name}
          </h1>
          <Button 
            className="modern-button"
            variant="outlined" 
            startIcon={<EditIcon />}
            sx={{ 
              borderColor: 'var(--secondary-color)',
              color: 'var(--secondary-color)',
              '&:hover': {
                borderColor: 'var(--accent-color)',
                color: 'var(--accent-color)',
                background: 'rgba(var(--accent-rgb), 0.05)'
              }
            }}
            // onClick={() => navigate(`/societies/${society.id}/edit`)}
          >
            Edit
          </Button>
        </div>

        <div className="society-info-card modern-card">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box className="society-info-item" sx={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: 2
              }}>
                <LocationOnIcon 
                  sx={{ 
                    color: 'var(--primary-color)',
                    mt: 0.5
                  }} 
                />
                <Typography 
                  variant="body1" 
                  sx={{ color: 'var(--text-secondary)' }}
                >
                  {society.address}, {society.city}, {society.state} {society.zipcode}, {society.country}
                </Typography>
              </Box>
            </Grid>
            
            {society.contact_email && (
              <Grid item xs={12} sm={6}>
              <Box className="society-info-item">
                <EmailIcon color="primary" className="society-info-icon" />
                <Typography variant="body1">{society.contact_email}</Typography>
              </Box>
            </Grid>
          )}
          
          {society.contact_phone && (
            <Grid item xs={12} sm={6}>
              <Box className="society-info-item">
                <PhoneIcon color="primary" className="society-info-icon" />
                <Typography variant="body1">{society.contact_phone}</Typography>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6}>
            <Box className="society-info-item">
              <HomeIcon color="primary" className="society-info-icon" />
              <Typography variant="body1">{society.total_units} Units</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box className="society-info-item">
              <CalendarMonthIcon color="primary" className="society-info-icon" />
              <Typography variant="body1">Registration Date: {formattedDate}</Typography>
            </Box>
          </Grid>
          
          {society.registration_number && (
            <Grid item xs={12}>
              <Box className="society-info-item">
                <AssignmentIcon color="primary" className="society-info-icon" />
                <Typography variant="body1">Registration Number: {society.registration_number}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </div>

      {financesSummary && (
        <Box className="finances-summary-section">
          <Typography variant="h5" component="h2" gutterBottom>
            Financial Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Collections
                  </Typography>
                  <Typography variant="h5" component="div">
                    ₹{Number(financesSummary.total_collections).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h5" component="div">
                    ₹{Number(financesSummary.total_expenses).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Balance
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div"
                    className={Number(financesSummary.balance) >= 0 ? 'positive-balance' : 'negative-balance'}
                  >
                    ₹{Number(financesSummary.balance).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                // onClick={() => navigate(`/societies/${society.id}/finances`)}
              >
                View Detailed Finances
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Box className="section-header" sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography 
            variant="h5" 
            component="h2" 
            className="section-title"
            sx={{ fontWeight: 600 }}
          >
            Residents
          </Typography>
          <Button 
            className="modern-button"
            variant="outlined"
            sx={{ 
              borderColor: 'var(--primary-color)',
              color: 'var(--primary-color)',
              '&:hover': {
                borderColor: 'var(--secondary-color)',
                color: 'var(--secondary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
            // onClick={() => navigate(`/societies/${society.id}/residents`)}
          >
            Manage Residents
          </Button>
        </Box>
        <Alert 
          severity="info"
          sx={{ borderRadius: 'var(--border-radius)' }}
        >
          Click on "Manage Residents" to view and manage the residents of this society.
        </Alert>
      </Box>
        </Container>
      </div>
    );
};

export default SocietyDetails;
