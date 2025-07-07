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
import { useAuth } from '../../contexts/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import '../../styles/shared-headers.css';
import './SocietyDetails.css';
import { SocietyData, ResidentData } from '../../types';
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
  const { user } = useAuth();
  const [society, setSociety] = useState<Society | null>(null);
  const [financesSummary, setFinancesSummary] = useState<FinancesSummary | null>(null);
  const [committeeMembers, setCommitteeMembers] = useState<ResidentData[]>([]);
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

      // Fetch committee members
      try {
        const committeeData = await societyService.getSocietyCommitteeMembers(societyId);
        setCommitteeMembers(committeeData);
      } catch (committeeErr) {
        console.error('Error fetching committee members:', committeeErr);
        // Don't set main error, just leave committee members empty
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
          <Box className="loading-state">
            <CircularProgress size={40} className="loading-spinner" />
          </Box>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="society-details-container">
        <Container maxWidth="xl" className="no-padding">
          <Alert 
            severity="error" 
            className="alert-custom"
          >
            {error}
          </Alert>
          {user?.role !== 'society_admin' && (
            <IconButton 
              onClick={() => navigate('/societies')}
              className="back-button-header"
            >
              <ArrowBackIcon />
            </IconButton>
          )}
        </Container>
      </div>
    );
  }

  if (!society) {
    return (
      <div className="society-details-container">
        <Container maxWidth="xl" className="no-padding">
          <Alert 
            severity="warning" 
            className="alert-custom"
          >
            Society not found
          </Alert>
          {user?.role !== 'society_admin' && (
            <IconButton 
              onClick={() => navigate('/societies')}
              className="back-button-header"
            >
              <ArrowBackIcon />
            </IconButton>
          )}
        </Container>
      </div>
    );
  }

  const formattedDate = society.registration_date 
    ? new Date(society.registration_date).toLocaleDateString() 
    : 'Not Available';

  return (
    <div className="society-details-container">
      <Container maxWidth="xl" className="no-padding">
        <div className="page-header">
          <div className="page-title-section">
            {user?.role !== 'society_admin' && (
              <IconButton 
                onClick={() => navigate('/societies')}
                className="page-back-button"
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <h1 className="page-header-title">
              {society.name}
            </h1>
          </div>
        </div>

        {/* Society Details Cards Grid */}
        <Grid container spacing={3} className="society-details-grid">
          {/* Address Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Box className="society-detail-card address-card">
              <Box className="detail-card-edit-icon"
                onClick={() => navigate(`/societies/${society.id}/edit?field=address`)}
              >
                <EditIcon className="icon-edit-small" />
              </Box>
              
              <Typography variant="h6" className="detail-card-title">
                Address
              </Typography>
              <Box className="detail-card-content">
                <Box className="detail-card-item">
                  <LocationOnIcon className="detail-card-icon icon-location-primary" />
                  <Typography className="detail-card-text">
                    {society.address}
                  </Typography>
                </Box>
                <Box className="detail-card-item">
                  <LocationOnIcon className="detail-card-icon icon-location-faded" />
                  <Typography className="detail-card-text">
                    {society.city}, {society.state}
                  </Typography>
                </Box>
                <Box className="detail-card-item">
                  <LocationOnIcon className="detail-card-icon icon-location-faded" />
                  <Typography className="detail-card-text">
                    {society.zipcode}, {society.country}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Contact Information Card */}
          {(society.contact_email || society.contact_phone) && (
            <Grid item xs={12} sm={6} md={4}>
              <Box className="contact-card">
                {/* Edit Icon */}
                <Box className="edit-icon"
                  onClick={() => navigate(`/societies/${society.id}/edit?field=contact`)}
                >
                  <EditIcon className="icon-edit-small" />
                </Box>

                <Typography variant="h6" className="contact-card-title">
                  Contact
                </Typography>
                <Box className="contact-card-content">
                  {society.contact_email && (
                    <Box className="contact-card-item">
                      <EmailIcon className="contact-card-icon" />
                      <Typography className="contact-card-text">
                        {society.contact_email}
                      </Typography>
                    </Box>
                  )}
                  {society.contact_phone && (
                    <Box className="contact-card-item">
                      <PhoneIcon className="contact-card-icon" />
                      <Typography className="contact-card-text">
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
            <Box className="centered-card units-card">
              {/* Edit Icon */}
              <Box className="edit-icon"
                onClick={() => navigate(`/societies/${society.id}/edit?field=total_units`)}
              >
                <EditIcon className="icon-edit-small" />
              </Box>

              <HomeIcon className="centered-card-icon units-icon" />
              <Typography variant="h3" className="centered-card-value units-value">
                {society.total_units}
              </Typography>
              <Typography variant="subtitle2" className="centered-card-label">
                Total Units
              </Typography>
            </Box>
          </Grid>

          {/* Committee Members Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Box className="society-detail-card committee-card">
            <Box className="detail-card-edit-icon">
              <EditIcon className="icon-edit-small" />
            </Box>
            
            <Typography variant="h6" className="detail-card-title">
              Committee Members
            </Typography>
            <Box className="detail-card-content">
              {committeeMembers.length > 0 ? (
                committeeMembers.slice(0, 3).map((member) => (
                  <Box key={member.id} className="detail-card-item">
                    <PersonIcon className="detail-card-icon icon-location-primary" />
                    <Box className="committee-member-details">
                      <Typography className="detail-card-text committee-member-name">
                        {member.first_name} {member.last_name}
                      </Typography>
                      <Typography className="committee-member-role">
                        {member.committee_role || 'Member'}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box className="detail-card-item">
                  <GroupIcon className="detail-card-icon icon-group-faded" />
                  <Typography className="detail-card-text">
                    No committee members assigned
                  </Typography>
                </Box>
              )}
              
              {committeeMembers.length > 3 && (
                <Box className="detail-card-item">
                  <GroupIcon className="detail-card-icon icon-group-light" />
                  <Typography className="detail-card-text">
                    +{committeeMembers.length - 3} more members
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

          {/* Registration Date Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Box className="centered-card date-card">
              {/* Edit Icon */}
              <Box className="edit-icon"
                onClick={() => navigate(`/societies/${society.id}/edit?field=registration_date`)}
              >
                <EditIcon className="icon-edit-small" />
              </Box>

              <CalendarMonthIcon className="centered-card-icon date-icon" />
              <Typography variant="h6" className="centered-card-text">
                {formattedDate}
              </Typography>
              <Typography variant="subtitle2" className="centered-card-label">
                Registration Date
              </Typography>
            </Box>
          </Grid>

          {/* Registration Number Card */}
          {society.registration_number && (
            <Grid item xs={12} sm={6} md={4}>
              <Box className="centered-card registration-card">
                {/* Edit Icon */}
                <Box className="edit-icon"
                  onClick={() => navigate(`/societies/${society.id}/edit?field=registration_number`)}
                >
                  <EditIcon className="icon-edit-small" />
                </Box>

                <AssignmentIcon className="centered-card-icon registration-icon" />
                <Typography variant="h6" className="centered-card-text">
                  {society.registration_number}
                </Typography>
                <Typography variant="subtitle2" className="centered-card-label">
                  Registration Number
                </Typography>
              </Box>
            </Grid>        )}

        
        </Grid>        {/* Finances summary section if available */}
        {financesSummary && (
          <Box className="financial-summary-section">
            <Typography variant="h5" className="financial-summary-title">
              Financial Summary
            </Typography>
            <Grid container spacing={2} className="financial-summary-grid">
              <Grid item xs={12} sm={4}>
                <Box className="financial-summary-card income">
                  <Typography variant="subtitle2" className="financial-summary-card-label">Total Income</Typography>
                  <Typography variant="h5" className="financial-summary-card-value income">
                    ₹{financesSummary.income?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className="financial-summary-card expense">
                  <Typography variant="subtitle2" className="financial-summary-card-label">Total Expenses</Typography>
                  <Typography variant="h5" className="financial-summary-card-value expense">
                    ₹{financesSummary.expenses?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className="financial-summary-card balance">
                  <Typography variant="subtitle2" className="financial-summary-card-label">Balance</Typography>
                  <Typography variant="h5" className="financial-summary-card-value balance">
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
                        className={`transaction-value ${transaction.type === 'income' ? 'income' : 'expense'}`}
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

        <Box className="action-buttons">
          <Button 
            variant="contained"
            color="primary"
            className="action-button primary"
            onClick={() => navigate(`/societies/${society.id}/residents`)}
          >
            View Residents
          </Button>
          

        </Box>
    </Container>
  </div>
  );
};

export default SocietyDetails;