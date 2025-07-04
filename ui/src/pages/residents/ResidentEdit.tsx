import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import Grid from '../../components/shared/Grid';
import { useParams, useNavigate } from 'react-router-dom';
import residentService from '../../services/residents/residentService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import './ResidentDetails.css'; // Reuse the same styles
import { ResidentData } from '../../types';

// Extend the Resident interface with additional details
interface Resident extends ResidentData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  unit_number?: string;
  society_id: string | number;
  society_name?: string;
  is_owner: boolean;
  is_committee_member: boolean;
  is_active: boolean;
  committee_role?: string;
  joined_date?: string;
  lease_end_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
}

// Field errors interface
interface FieldErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  unit_number?: string;
  society_id?: string;
  is_owner?: string;
  is_committee_member?: string;
  committee_role?: string;
  joined_date?: string;
  lease_end_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
}

// Use type for React Router v6
type RouteParams = {
  residentId?: string;
};

const ResidentEdit: React.FC = () => {
  const params = useParams<RouteParams>();
  const residentId = params.residentId;
  const navigate = useNavigate();
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
      
      // Transform data to match our Resident interface
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
      setError(null);
    } catch (err) {
      console.error('Error fetching resident details:', err);
      setError('Failed to load resident details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (resident) {
      setResident({
        ...resident,
        [name]: value
      });
    }
    
    // Clear the field error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: undefined
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (resident) {
      setResident({
        ...resident,
        [name]: checked
      });
    }
  };

  const validateFields = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;
    
    // Required fields validation
    if (!resident?.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
      isValid = false;
    }
    
    if (!resident?.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
      isValid = false;
    }
    
    if (!resident?.society_id) {
      newErrors.society_id = 'Society ID is required';
      isValid = false;
    }
    
    // Email validation if provided
    if (resident?.email && !/^\S+@\S+\.\S+$/.test(resident.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    
    // Phone validation if provided (basic validation)
    if (resident?.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(resident.phone)) {
      newErrors.phone = 'Invalid phone number format';
      isValid = false;
    }
    
    // Committee role validation
    if (resident?.is_committee_member && !resident?.committee_role?.trim()) {
      newErrors.committee_role = 'Committee role is required when the resident is a committee member';
      isValid = false;
    }
    
    // Date validations
    if (resident?.joined_date) {
      const joinedDate = new Date(resident.joined_date);
      if (isNaN(joinedDate.getTime())) {
        newErrors.joined_date = 'Invalid date format';
        isValid = false;
      }
    }
    
    if (resident?.lease_end_date) {
      const leaseEndDate = new Date(resident.lease_end_date);
      if (isNaN(leaseEndDate.getTime())) {
        newErrors.lease_end_date = 'Invalid date format';
        isValid = false;
      } else if (resident.joined_date) {
        const joinedDate = new Date(resident.joined_date);
        if (leaseEndDate < joinedDate) {
          newErrors.lease_end_date = 'Lease end date cannot be earlier than joined date';
          isValid = false;
        }
      }
    }
    
    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    
    if (!resident || !validateFields()) {
      return;
    }
    
    try {
      // Prepare resident data for submission
      const residentData: Partial<ResidentData> = {
        first_name: resident.first_name,
        last_name: resident.last_name,
        email: resident.email,
        phone: resident.phone,
        unit_number: resident.unit_number,
        society_id: resident.society_id,
        is_owner: resident.is_owner,
        is_committee_member: resident.is_committee_member,
        committee_role: resident.committee_role,
        is_active: resident.is_active,
        // Ensure dates are properly formatted YYYY-MM-DD
        joined_date: resident.joined_date ? resident.joined_date.substring(0, 10) : undefined,
        lease_end_date: resident.lease_end_date ? resident.lease_end_date.substring(0, 10) : undefined,
        emergency_contact: resident.emergency_contact,
        emergency_phone: resident.emergency_phone,
        notes: resident.notes
      };
      
      // Submit to API
      console.log('Submitting resident update with payload:', residentData);
      console.log('Resident ID for update:', residentId);
      try {
        const updatedResident = await residentService.updateResident(residentId!, residentData);
        console.log('Resident update successful, response:', updatedResident);
        
        // Navigate back to details immediately on successful save with a state param to force refresh
        navigate(`/residents/${residentId}`, { 
          state: { 
            updated: true, 
            timestamp: new Date().getTime() 
          }
        });
      } catch (updateErr) {
        console.error('Specific update error:', updateErr);
        throw updateErr;
      }
      
    } catch (err: any) {
      console.error('Error updating resident:', err);
      
      // Handle validation errors from backend
      if (err.errors && typeof err.errors === 'object') {
        const fieldErrorsObj: FieldErrors = {};
        
        // Map backend errors to form fields
        Object.entries(err.errors).forEach(([key, value]) => {
          fieldErrorsObj[key as keyof FieldErrors] = value as string;
        });
        
        setFieldErrors(fieldErrorsObj);
      } else if (err.field) {
        // Single field error
        setFieldErrors({
          [err.field]: err.message
        });
      }
      
      setError(err.message || 'Failed to update resident. Please verify all required fields are filled correctly.');
    }
  };

  if (loading) {
    return (
      <div className="resident-details-container">
        <Container maxWidth="xl" sx={{ px: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress size={40} sx={{ color: 'var(--primary-color)' }} />
          </Box>
        </Container>
      </div>
    );
  }

  if (error && !resident) {
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
          <Button 
            variant="outlined"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(`/residents/${residentId}`)}
            sx={{ 
              height: '40px',
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
          >
            Back to Resident Details
          </Button>
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
          <Button 
            variant="outlined"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/residents')}
            sx={{ 
              height: '40px',
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
          >
            Back to Residents
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="resident-details-container">
      <Container maxWidth="xl" sx={{ px: 0 }}>
        <div className="resident-header">
          <Button 
            variant="outlined"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(`/residents/${residentId}`)}
            sx={{ 
              mr: 2,
              height: '40px',
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                background: 'rgba(var(--primary-rgb), 0.05)'
              }
            }}
          >
            Back
          </Button>
          <h1 className="resident-header-title">
            Edit Resident: {resident.first_name} {resident.last_name}
          </h1>
        </div>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 'var(--border-radius)' }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Box sx={{ 
            backgroundColor: 'white', 
            padding: 3, 
            borderRadius: 'var(--border-radius)', 
            boxShadow: 'var(--shadow-sm)',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--text-primary)' }}>
              Basic Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="first_name"
                  name="first_name"
                  label="First Name"
                  value={resident.first_name || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.first_name}
                  helperText={fieldErrors.first_name}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="last_name"
                  name="last_name"
                  label="Last Name"
                  value={resident.last_name || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.last_name}
                  helperText={fieldErrors.last_name}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={resident.email || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={resident.phone || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={resident.is_active}
                      onChange={handleCheckboxChange}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ 
            backgroundColor: 'white', 
            padding: 3, 
            borderRadius: 'var(--border-radius)', 
            boxShadow: 'var(--shadow-sm)',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--text-primary)' }}>
              Residence Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="unit_number"
                  name="unit_number"
                  label="Unit Number"
                  value={resident.unit_number || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.unit_number}
                  helperText={fieldErrors.unit_number}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  disabled
                  id="society_id"
                  name="society_id"
                  label="Society ID"
                  value={resident.society_id || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.society_id}
                  helperText={fieldErrors.society_id || 'Society ID cannot be changed'}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={resident.is_owner}
                      onChange={handleCheckboxChange}
                      name="is_owner"
                      color="primary"
                    />
                  }
                  label="Owner"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="joined_date"
                  name="joined_date"
                  label={resident.is_owner ? "Joined Date" : "Move-in Date"}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={resident.joined_date ? resident.joined_date.substring(0, 10) : ''}
                  onChange={handleChange}
                  error={!!fieldErrors.joined_date}
                  helperText={fieldErrors.joined_date}
                />
              </Grid>
              
              {!resident.is_owner && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="lease_end_date"
                    name="lease_end_date"
                    label="Lease End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={resident.lease_end_date ? resident.lease_end_date.substring(0, 10) : ''}
                    onChange={handleChange}
                    error={!!fieldErrors.lease_end_date}
                    helperText={fieldErrors.lease_end_date}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
          
          <Box sx={{ 
            backgroundColor: 'white', 
            padding: 3, 
            borderRadius: 'var(--border-radius)', 
            boxShadow: 'var(--shadow-sm)',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--text-primary)' }}>
              Committee Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={resident.is_committee_member}
                      onChange={handleCheckboxChange}
                      name="is_committee_member"
                      color="primary"
                    />
                  }
                  label="Committee Member"
                />
              </Grid>
              
              {resident.is_committee_member && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!fieldErrors.committee_role}>
                    <InputLabel id="committee-role-label">Committee Role</InputLabel>
                    <Select
                      labelId="committee-role-label"
                      id="committee_role"
                      name="committee_role"
                      value={resident.committee_role || ''}
                      label="Committee Role"
                      onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                    >
                      <MenuItem value="President">President</MenuItem>
                      <MenuItem value="Secretary">Secretary</MenuItem>
                      <MenuItem value="Treasurer">Treasurer</MenuItem>
                      <MenuItem value="Member">Member</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {fieldErrors.committee_role && (
                      <Typography variant="caption" color="error">
                        {fieldErrors.committee_role}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
          
          <Box sx={{ 
            backgroundColor: 'white', 
            padding: 3, 
            borderRadius: 'var(--border-radius)', 
            boxShadow: 'var(--shadow-sm)',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--text-primary)' }}>
              Emergency Contact Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="emergency_contact"
                  name="emergency_contact"
                  label="Emergency Contact Name"
                  value={resident.emergency_contact || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.emergency_contact}
                  helperText={fieldErrors.emergency_contact}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="emergency_phone"
                  name="emergency_phone"
                  label="Emergency Contact Phone"
                  value={resident.emergency_phone || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.emergency_phone}
                  helperText={fieldErrors.emergency_phone}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ 
            backgroundColor: 'white', 
            padding: 3, 
            borderRadius: 'var(--border-radius)', 
            boxShadow: 'var(--shadow-sm)',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--text-primary)' }}>
              Additional Notes
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  multiline
                  rows={4}
                  value={resident.notes || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.notes}
                  helperText={fieldErrors.notes}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/residents/${residentId}`)}
              sx={{ 
                height: '40px',
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              sx={{ 
                height: '40px'
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default ResidentEdit;
