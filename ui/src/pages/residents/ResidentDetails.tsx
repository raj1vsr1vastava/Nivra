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
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import residentService from '../../services/residents/residentService';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WorkIcon from '@mui/icons-material/Work';
import ApartmentIcon from '@mui/icons-material/Apartment';
import Grid from '../../components/shared/Grid';
import '../../styles/shared-headers.css';
import './ResidentDetails.css';
import { ResidentData } from '../../types';

// Extend the Resident interface with additional details
interface Resident extends ResidentData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  unit_number?: string;
  society_id: string | number;
  society?: {
    id: string | number;
    name: string;
    city: string;
    state: string;
  };
  is_owner: boolean;
  is_committee_member: boolean;
  is_active: boolean;  // Added missing property
  committee_role?: string;
  move_in_date?: string;
  move_out_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
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

const ResidentDetails: React.FC = () => {
  const params = useParams<RouteParams>();
  const residentId = params.residentId;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const forceUpdate = location.state && (location.state as {updated?: boolean}).updated;
  const [resident, setResident] = useState<Resident | null>(null);
  const [financesSummary, setFinancesSummary] = useState<ResidentFinancesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user can edit this resident
  const canEdit = (): boolean => {
    if (!user) return false;
    
    // Super User and Society Admin can edit any resident
    if (user.role === 'Super User' || user.role === 'Society Admin') {
      return true;
    }
    
    // Committee Members can edit residents in their society (if implemented)
    if (user.role === 'Committee Member') {
      return true; // For now, allow committee members to edit
    }
    
    // Residents cannot edit any resident details (including their own)
    return false;
  };

  // Check if current user can view financial details
  const canViewFinances = (): boolean => {
    if (!user) return false;
    
    // All roles can view finances (read-only for residents)
    return true;
  };

  const handleBackNavigation = () => {
    // Residents should go to residents list of their society, others go to general residents list
    if (user?.role === 'Resident') {
      if (resident?.society_id) {
        navigate(`/societies/${resident.society_id}/residents`);
      } else if (user.societyId) {
        navigate(`/societies/${user.societyId}/residents`);
      } else {
        // Fallback to general residents list
        navigate('/residents');
      }
    } else {
      navigate('/residents');
    }
  };

  useEffect(() => {
    if (residentId) {
      fetchResidentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId]);
  
  // This will ensure the data is refreshed when navigating back from edit page
  useEffect(() => {
    if (residentId && forceUpdate) {
      fetchResidentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdate]);

  const fetchResidentDetails = async (): Promise<void> => {
    if (!residentId) return;
    
    try {
      setLoading(true);
      const residentData = await residentService.getResidentById(residentId);
      
      // Ensure residentData has the correct type
      const transformedData: Resident = {
        ...residentData,
        first_name: residentData.first_name || '',
        last_name: residentData.last_name || '',
        name: `${residentData.first_name || ''} ${residentData.last_name || ''}`.trim(),
        society_id: residentData.society_id || '',
        is_owner: residentData.is_owner ?? false,
        is_committee_member: residentData.is_committee_member ?? false,
        is_active: residentData.is_active ?? true
      };
      
      setResident(transformedData);
      
      // Fetch financial summary - the service will provide mock data if the API fails
      const financesData = await residentService.getResidentFinancesSummary(residentId);
      setFinancesSummary(financesData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching resident details:', err);
      setError('Failed to load resident details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="resident-details-container">
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
      <div className="resident-details-container">
        <Container maxWidth="xl" sx={{ px: 0 }}>
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
            onClick={handleBackNavigation}
            className="back-button-header"
          >
            <ArrowBackIcon />
          </IconButton>
        </Container>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="resident-details-container">
        <Container maxWidth="xl" sx={{ px: 0 }}>
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 3, 
              mb: 3,
              borderRadius: 'var(--border-radius)',
              fontWeight: 500
            }}
          >
            Resident not found
          </Alert>
          <IconButton 
            onClick={handleBackNavigation}
            className="back-button-header"
          >
            <ArrowBackIcon />
          </IconButton>
        </Container>
      </div>
    );
  }

  const joinedDate = resident.move_in_date 
    ? new Date(resident.move_in_date).toLocaleDateString() 
    : 'Not Available';

  const leaveEndDate = resident.move_out_date
    ? new Date(resident.move_out_date).toLocaleDateString()
    : 'Not Available';

  return (
    <div className="resident-details-container">
      <Container maxWidth="xl" sx={{ px: 0 }}>
        <div className="page-header">
          <div className="page-title-section">
            <IconButton 
              onClick={handleBackNavigation}
              className="page-back-button"
            >
              <ArrowBackIcon />
            </IconButton>
            <h1 className="page-header-title">
              {resident.name}
            </h1>
          </div>
          {canEdit() && (
            <Button 
              variant="contained"
              color="primary" 
              startIcon={<EditIcon />}
              sx={{ 
                height: '40px',
                width: { xs: '100%', md: 'auto' },
                ml: { xs: 0, md: 1 }
              }}
              onClick={() => navigate(`/residents/${resident.id}/edit`)}
            >
              Edit
            </Button>
          )}
        </div>

        {/* Resident Information Card - Row 1 */}
        <CardDetails 
          data={resident}
          title="Personal & Residence Information"
          fields={[
            {
              icon: <PersonIcon />,
              label: "Full Name",
              value: resident.name,
              iconColor: 'var(--primary-color)'
            },
            {
              icon: <WorkIcon />,
              label: "Status",
              value: resident.is_committee_member 
                ? `Committee Member${resident.committee_role ? ` (${resident.committee_role})` : ''}` 
                : resident.is_owner 
                  ? 'Owner' 
                  : 'Tenant',
              iconColor: 'var(--accent-color)',
              fontWeight: 500
            },
            ...(resident.email ? [{
              icon: <EmailIcon />,
              label: "Email",
              value: resident.email,
              iconColor: 'var(--secondary-color)'
            }] : []),
            ...(resident.phone ? [{
              icon: <PhoneIcon />,
              label: "Phone",
              value: resident.phone,
              iconColor: 'var(--secondary-color)'
            }] : []),
            {
              icon: <HomeIcon />,
              label: "Unit Number",
              value: resident.unit_number || 'Not assigned',
              iconColor: 'var(--info)'
            },
            {
              icon: <ApartmentIcon />,
              label: "Society",
              value: resident.society?.name || 'Unknown',
              iconColor: 'var(--info)'
            },
            {
              icon: <CalendarMonthIcon />,
              label: resident.is_owner ? "Joined Date" : "Move-in Date",
              value: joinedDate,
              iconColor: 'var(--info)'
            },
            ...(resident.move_out_date && !resident.is_owner ? [{
              icon: <CalendarMonthIcon />,
              label: "Lease End Date",
              value: leaveEndDate,
              iconColor: 'var(--warning)'
            }] : [])
          ]}
          borderColor="var(--primary-color)"
          hoverBorderColor="var(--accent-color)"
        />

        {/* Financial Summary - Row 2 */}
        {financesSummary && canViewFinances() && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
              Financial Summary
              {user?.role === 'Resident' && (
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: 400 }}>
                  (Read-only)
                </Typography>
              )}
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
          </Box>
        )}

        {/* Recent Transactions - Row 3 */}
        {financesSummary && financesSummary.recentTransactions && (
          <Box sx={{ mt: 3 }}>
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
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          {user?.role !== 'Resident' && (
            <Button 
              variant="contained"
              color="primary"
              sx={{ 
                height: '40px',
                width: { xs: '100%', md: 'auto' }
              }}
              onClick={() => navigate(`/residents/${resident.id}/transactions`)}
            >
              View All Transactions
            </Button>
          )}
          
          <Button 
            variant="outlined"
            sx={{ 
              height: '40px',
              width: { xs: '100%', md: 'auto' },
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
            onClick={() => navigate(`/societies/${resident.society_id}`)}
          >
            View Society
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default ResidentDetails;
