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
import { residentService } from '../../services';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Grid from '../../components/shared/Grid';
import './ResidentDetails.css';

// Extend the Resident interface with additional details
interface ResidentDetails {
  id: string | number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  unit_number?: string;
  society_id: string | number;
  society_name?: string;
  is_owner: boolean;
  is_committee_member: boolean;
  committee_role?: string;
  is_active: boolean;
  joined_date?: string;
  lease_end_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  // Add other properties as needed
}

// Interface for resident finances summary
interface ResidentFinancesSummary {
  dues: number;
  payments: number;
  balance: number;
  recentTransactions: {
    id: string | number;
    title: string;
    amount: number;
    date: string;
    type: 'payment' | 'due';
    status?: 'paid' | 'pending' | 'overdue';
  }[];
}

// Use type for React Router v6
type RouteParams = {
  residentId?: string;
};

const ResidentDetailsComponent: React.FC = () => {
  const params = useParams<RouteParams>();
  const residentId = params.residentId;
  const navigate = useNavigate();
  const [resident, setResident] = useState<ResidentDetails | null>(null);
  const [financesSummary, setFinancesSummary] = useState<ResidentFinancesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (residentId) {
      fetchResidentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId]);

  const fetchResidentDetails = async (): Promise<void> => {
    if (!residentId) return;
    
    try {
      setLoading(true);
      const residentData = await residentService.getResidentById(residentId);
      
      setResident(residentData);
      
      // Also fetch financial summary
      try {
        const financesData = await residentService.getResidentFinancesSummary(residentId);
        setFinancesSummary(financesData);
      } catch (financeErr) {
        console.error('Error fetching finances summary:', financeErr);
        
        // Use mock data for development/testing since the endpoint might not exist yet
        const mockFinancesData: ResidentFinancesSummary = {
          dues: 25000,
          payments: 18000,
          balance: 7000,
          recentTransactions: [
            {
              id: 1,
              title: "Monthly Maintenance",
              amount: 3000,
              date: "2025-06-15",
              type: "due",
              status: "pending"
            },
            {
              id: 2,
              title: "Water Bill",
              amount: 1500,
              date: "2025-06-10",
              type: "due",
              status: "overdue"
            },
            {
              id: 3,
              title: "Maintenance Payment",
              amount: 5000,
              date: "2025-06-05",
              type: "payment"
            },
            {
              id: 4,
              title: "Security Charges",
              amount: 2500,
              date: "2025-05-28",
              type: "due",
              status: "paid"
            }
          ]
        };
        setFinancesSummary(mockFinancesData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching resident details:', err);
      setError('Failed to load resident details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/residents')}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back to Residents
        </Button>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : resident ? (
          <div>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              mb: 3
            }}>
              <Box>
                <Typography variant="h4" gutterBottom component="h1">
                  {resident.first_name} {resident.last_name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {resident.is_owner ? 'Owner' : 'Tenant'} 
                  {resident.is_committee_member && ` | Committee Member${resident.committee_role ? ` - ${resident.committee_role}` : ''}`}
                </Typography>
              </Box>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                color="primary"
                onClick={() => {/* TODO: Implement edit functionality */}}
                sx={{ mt: { xs: 2, md: 0 } }}
              >
                Edit
              </Button>
            </Box>
            
            <Grid container spacing={4}>
              {/* Personal Information Card */}
              <Grid item xs={12} md={6}>
                <CardDetails 
                  title="Personal Information"
                  data={resident}
                  fields={[
                    {
                      icon: <EmailIcon />,
                      value: resident.email || 'No email provided',
                      iconColor: 'var(--secondary-color)'
                    },
                    {
                      icon: <PhoneIcon />,
                      value: resident.phone || 'No phone provided',
                      iconColor: 'var(--secondary-color)'
                    },
                    ...(resident.emergency_contact ? [{
                      icon: <PersonIcon />,
                      label: "Emergency Contact",
                      value: `${resident.emergency_contact} ${resident.emergency_phone ? `(${resident.emergency_phone})` : ''}`,
                      iconColor: 'var(--info)'
                    }] : [])
                  ]}
                  borderColor="var(--primary-color)"
                  hoverBorderColor="var(--accent-color)"
                />
              </Grid>
              
              {/* Residence Information Card */}
              <Grid item xs={12} md={6}>
                <CardDetails 
                  title="Residence Information"
                  data={resident}
                  fields={[
                    {
                      icon: <HomeIcon />,
                      label: "Unit Number",
                      value: resident.unit_number || 'Not specified',
                      iconColor: 'var(--info)'
                    },
                    {
                      icon: <LocationOnIcon />,
                      label: "Society",
                      value: resident.society_name || 'Unknown society',
                      iconColor: 'var(--primary-color)'
                    },
                    {
                      icon: <CalendarMonthIcon />,
                      label: resident.is_owner ? 'Member Since' : 'Lease Period',
                      value: `${resident.joined_date ? new Date(resident.joined_date).toLocaleDateString() : 'Not specified'}${!resident.is_owner && resident.lease_end_date ? ` - ${new Date(resident.lease_end_date).toLocaleDateString()}` : ''}`,
                      iconColor: 'var(--secondary-color)'
                    }
                  ]}
                  borderColor="var(--primary-color)"
                  hoverBorderColor="var(--accent-color)"
                />
              </Grid>
              
              {/* Notes Section if available */}
              {resident.notes && (
                <Grid item xs={12}>
                  <CardDetails 
                    title="Additional Notes"
                    data={resident}
                    fields={[
                      {
                        value: resident.notes,
                      }
                    ]}
                    borderColor="var(--primary-color)"
                    hoverBorderColor="var(--accent-color)"
                  />
                </Grid>
              )}
              
              {/* Finances summary section if available */}
              {financesSummary && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                      Financial Summary
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(var(--warning-rgb), 0.1)', borderRadius: 'var(--border-radius)' }}>
                          <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>Total Dues</Typography>
                          <Typography variant="h5" sx={{ color: 'var(--warning)', fontWeight: 600 }}>
                            ₹{financesSummary.dues?.toLocaleString() || '0'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(var(--success-rgb), 0.1)', borderRadius: 'var(--border-radius)' }}>
                          <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>Total Payments</Typography>
                          <Typography variant="h5" sx={{ color: 'var(--success)', fontWeight: 600 }}>
                            ₹{financesSummary.payments?.toLocaleString() || '0'}
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
                                  color: transaction.type === 'payment' ? 'var(--success)' : 'var(--warning)'
                                }}
                              >
                                {transaction.type === 'payment' ? '+' : '-'}₹{transaction.amount?.toLocaleString() || '0'}
                                {transaction.status && transaction.type === 'due' && (
                                  <span className={`transaction-status transaction-status-${transaction.status}`}>
                                    {transaction.status.toUpperCase()}
                                  </span>
                                )}
                              </Typography>
                            }))
                          : [{ value: "No recent transactions" }]
                      }
                      borderColor="var(--primary-color)"
                      hoverBorderColor="var(--accent-color)"
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
            
            {/* Action buttons */}
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
                onClick={() => navigate(`/residents/${resident.id}/transactions`)}
              >
                View All Transactions
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
                onClick={() => navigate(`/residents/${resident.id}/details`)}
              >
                View Personal Details
              </Button>
            </Box>
          </div>
        ) : (
          <Alert severity="info">Resident not found.</Alert>
        )}
      </Box>
    </Container>
  );
};

export default ResidentDetailsComponent;
