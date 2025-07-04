import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Button,
  IconButton
} from '@mui/material';
import CardDetails from '../../components/CardDetails';
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
import { SocietyData } from '../../types';
import Grid from '../../components/shared/Grid';

// Define extended Society interface that includes all the properties we'll use
interface Society extends SocietyData {
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  contact_email?: string;
  contact_phone?: string;
  total_units: number;
  registration_date?: string;
  registration_number?: string;
}

interface FinancesSummary {
  income: number;
  expenses: number;
  balance: number;
  recentTransactions: {
    id: string | number;
    title: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
  }[];
}

// Use type for React Router v6
type RouteParams = {
  societyId?: string;
};

const SocietyDetails: React.FC = () => {
  const params = useParams<RouteParams>();
  const societyId = params.societyId;
  const navigate = useNavigate();
  const [society, setSociety] = useState<Society | null>(null);
  const [financesSummary, setFinancesSummary] = useState<FinancesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (societyId) {
      fetchSocietyDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [societyId]);

  const fetchSocietyDetails = async (): Promise<void> => {
    if (!societyId) return;
    
    try {
      setLoading(true);
      const societyData = await societyService.getSocietyById(societyId);
      
      // Transform data to match our Society interface
      const transformedData: Society = {
        ...societyData,
        address: societyData.address || '',
        city: societyData.city || '',  // Use actual data from the API
        state: societyData.state || '',
        zipcode: societyData.zipcode || '',
        country: societyData.country || '',
        total_units: societyData.total_units || 0  // Use correct field name from API
      };
      
      setSociety(transformedData);
      
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
        <Container maxWidth="xl" sx={{ px: 0 /* Removed horizontal padding to fix left margin issue */ }}>
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
          <IconButton 
            onClick={() => navigate('/societies')}
            sx={{ 
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--primary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Container>
      </div>
    );
  }

  if (!society) {
    return (
      <div className="society-details-container">
        <Container maxWidth="xl" sx={{ px: 0 /* Removed horizontal padding to fix left margin issue */ }}>
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
          <IconButton 
            onClick={() => navigate('/societies')}
            sx={{ 
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--primary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Container>
      </div>
    );
  }

  const formattedDate = society.registration_date 
    ? new Date(society.registration_date).toLocaleDateString() 
    : 'Not Available';

  return (
    <div className="society-details-container">
      <Container maxWidth="xl" sx={{ px: 0 /* Removed horizontal padding to fix left margin issue */ }}>
        <div className="society-header">
          <IconButton 
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
            <ArrowBackIcon />
          </IconButton>
          <h1 className="society-header-title">
            {society.name}
          </h1>
        </div>

        {/* Society Details Cards Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Address Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ 
              p: 3, 
              height: '180px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              bgcolor: 'var(--color-card)', 
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-lg)',
                borderColor: 'var(--primary-color)'
              }
            }}>
              {/* Edit Icon */}
              <Box sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'rgba(var(--primary-rgb), 0.1)'
                }
              }}
              onClick={() => navigate(`/societies/${society.id}/edit?field=address`)}
              >
                <EditIcon sx={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }} />
              </Box>
              
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
                Address
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: 'var(--primary-color)', mr: 1.5, fontSize: '1.25rem' }} />
                  <Typography variant="body2" sx={{ 
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem'
                  }}>
                    {society.address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: 'var(--primary-color)', mr: 1.5, fontSize: '1.25rem', opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {society.city}, {society.state}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: 'var(--primary-color)', mr: 1.5, fontSize: '1.25rem', opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {society.zipcode}, {society.country}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Contact Information Card */}
          {(society.contact_email || society.contact_phone) && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ 
                p: 3, 
                height: '180px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                bgcolor: 'var(--color-card)', 
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-border-light)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-normal)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadow-lg)',
                  borderColor: 'var(--secondary-color)'
                }
              }}>
                {/* Edit Icon */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12,
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: 'rgba(var(--primary-rgb), 0.1)'
                  }
                }}
                onClick={() => navigate(`/societies/${society.id}/edit?field=contact`)}
                >
                  <EditIcon sx={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
                  Contact
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {society.contact_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ color: 'var(--secondary-color)', mr: 1.5, fontSize: '1.25rem' }} />
                      <Typography variant="body2" sx={{ 
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem'
                      }}>
                        {society.contact_email}
                      </Typography>
                    </Box>
                  )}
                  {society.contact_phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ color: 'var(--secondary-color)', mr: 1.5, fontSize: '1.25rem' }} />
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {society.contact_phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Total Units Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ 
              p: 3, 
              height: '180px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              bgcolor: 'var(--color-card)', 
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              textAlign: 'center',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-lg)',
                borderColor: 'var(--info)'
              }
            }}>
              {/* Edit Icon */}
              <Box sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'rgba(var(--primary-rgb), 0.1)'
                }
              }}
              onClick={() => navigate(`/societies/${society.id}/edit?field=total_units`)}
              >
                <EditIcon sx={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }} />
              </Box>

              <HomeIcon sx={{ color: 'var(--info)', fontSize: '2.5rem', mb: 1.5 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--info)', mb: 0.5 }}>
                {society.total_units}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                Total Units
              </Typography>
            </Box>
          </Grid>

          {/* Registration Date Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ 
              p: 3, 
              height: '180px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              bgcolor: 'var(--color-card)', 
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              textAlign: 'center',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-lg)',
                borderColor: 'var(--accent-color)'
              }
            }}>
              {/* Edit Icon */}
              <Box sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'rgba(var(--primary-rgb), 0.1)'
                }
              }}
              onClick={() => navigate(`/societies/${society.id}/edit?field=registration_date`)}
              >
                <EditIcon sx={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }} />
              </Box>

              <CalendarMonthIcon sx={{ color: 'var(--accent-color)', fontSize: '2.5rem', mb: 1.5 }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: 'var(--text-primary)', 
                mb: 0.5,
                fontSize: '1rem',
                textAlign: 'center'
              }}>
                {formattedDate}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                Registration Date
              </Typography>
            </Box>
          </Grid>

          {/* Registration Number Card */}
          {society.registration_number && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ 
                p: 3, 
                height: '180px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                bgcolor: 'var(--color-card)', 
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-border-light)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-normal)',
                textAlign: 'center',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadow-lg)',
                  borderColor: 'var(--warning)'
                }
              }}>
                {/* Edit Icon */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12,
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: 'rgba(var(--primary-rgb), 0.1)'
                  }
                }}
                onClick={() => navigate(`/societies/${society.id}/edit?field=registration_number`)}
                >
                  <EditIcon sx={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }} />
                </Box>

                <AssignmentIcon sx={{ color: 'var(--warning)', fontSize: '2.5rem', mb: 1.5 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'var(--text-primary)', 
                  mb: 0.5,
                  fontSize: '1rem',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '80%'
                }}>
                  {society.registration_number}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Registration Number
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Finances summary section if available */}
        {financesSummary && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
              Financial Summary
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'rgba(var(--success-rgb), 0.1)', borderRadius: 'var(--border-radius)' }}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>Total Income</Typography>
                  <Typography variant="h5" sx={{ color: 'var(--success)', fontWeight: 600 }}>
                    ₹{financesSummary.income?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'rgba(var(--warning-rgb), 0.1)', borderRadius: 'var(--border-radius)' }}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>Total Expenses</Typography>
                  <Typography variant="h5" sx={{ color: 'var(--warning)', fontWeight: 600 }}>
                    ₹{financesSummary.expenses?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'rgba(var(--info-rgb), 0.1)', borderRadius: 'var(--border-radius)' }}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>Balance</Typography>
                  <Typography variant="h5" sx={{ color: 'var(--info)', fontWeight: 600 }}>
                    ₹{financesSummary.balance?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <CardDetails 
              title="Recent Transactions"
              data={financesSummary}
              fields={
                financesSummary.recentTransactions?.length > 0 
                  ? financesSummary.recentTransactions.map(transaction => ({
                      label: `${transaction.title} (${new Date(transaction.date).toLocaleDateString()})`,
                      value: <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          color: transaction.type === 'income' ? 'var(--success)' : 'var(--warning)'
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount?.toLocaleString() || '0'}
                      </Typography>
                    }))
                  : [{ value: "No recent transactions" }]
              }
              borderColor="var(--primary-color)"
              hoverBorderColor="var(--accent-color)"
            />
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained"
            color="primary"
            sx={{ 
              height: '40px',
              width: { xs: '100%', md: 'auto' },
              borderRadius: 'var(--border-radius)',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              '&:hover': {
                boxShadow: 'var(--shadow-md)'
              }
            }}
            onClick={() => navigate(`/societies/${society.id}/residents`)}
          >
            View Residents
          </Button>
          
          <Button 
            variant="outlined"
            sx={{ 
              height: '40px',
              width: { xs: '100%', md: 'auto' },
              borderRadius: 'var(--border-radius)',
              textTransform: 'none',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              borderColor: 'var(--color-border-light)',
              '&:hover': {
                color: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
            onClick={() => navigate(`/societies/${society.id}/finances`)}
          >
            View Finances
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default SocietyDetails;
