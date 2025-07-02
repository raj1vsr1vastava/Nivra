import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Button
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
        city: '',  // These fields might be extracted from the address in a real app
        state: '',
        zipcode: '',
        country: '',
        total_units: societyData.units || 0
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

        <CardDetails 
          data={society}
          title={society.name}
          fields={[
            {
              icon: <LocationOnIcon />,
              label: "Address",
              value: `${society.address}, ${society.city}, ${society.state} ${society.zipcode}, ${society.country}`,
              iconColor: 'var(--primary-color)'
            },
            ...(society.contact_email ? [{
              icon: <EmailIcon />,
              label: "Email",
              value: society.contact_email,
              iconColor: 'var(--secondary-color)'
            }] : []),
            ...(society.contact_phone ? [{
              icon: <PhoneIcon />,
              label: "Phone",
              value: society.contact_phone,
              iconColor: 'var(--secondary-color)'
            }] : []),
            {
              icon: <HomeIcon />,
              label: "Total Units",
              value: society.total_units,
              iconColor: 'var(--info)',
              gridColumn: 6
            },
            {
              icon: <CalendarMonthIcon />,
              label: "Registration Date",
              value: formattedDate,
              iconColor: 'var(--info)',
              gridColumn: 6
            },
            ...(society.registration_number ? [{
              icon: <AssignmentIcon />,
              label: "Registration Number",
              value: society.registration_number,
              iconColor: 'var(--accent-color)',
              gridColumn: 6,
              fontWeight: 500
            }] : [])
          ]}
          borderColor="var(--primary-color)"
          hoverBorderColor="var(--accent-color)"
        />

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
            className="modern-button"
            variant="contained"
            sx={{ 
              background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, var(--secondary-color), var(--primary-color))',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate(`/societies/${society.id}/residents`)}
          >
            View Residents
          </Button>
          
          <Button 
            className="modern-button"
            variant="outlined"
            sx={{ 
              borderColor: 'var(--secondary-color)',
              color: 'var(--secondary-color)',
              fontWeight: 600,
              '&:hover': {
                borderColor: 'var(--primary-color)',
                color: 'var(--primary-color)',
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
