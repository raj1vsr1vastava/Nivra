import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Button,
  TextField
} from '@mui/material';
import Grid from '../../components/shared/Grid';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { societyService } from '../../services';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import '../../styles/shared-headers.css';
import './ManageSociety.css';
import { SocietyData } from '../../types';

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

// Field errors interface
interface FieldErrors {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  contact_email?: string;
  contact_phone?: string;
  total_units?: string;
  registration_number?: string;
  registration_date?: string;
}

// Use type for React Router v6
type RouteParams = {
  societyId?: string;
};

// Reusable TextField component to eliminate repeated code
interface SocietyTextFieldProps {
  name: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  type?: string;
  InputProps?: any;
  InputLabelProps?: any;
  fieldRef: (ref: HTMLElement | null) => void;
  highlightedFields: string[];
}

const SocietyTextField: React.FC<SocietyTextFieldProps> = React.memo(({ 
  name, 
  label, 
  value, 
  onChange, 
  error, 
  helperText, 
  required = false, 
  type = "text",
  InputProps,
  InputLabelProps,
  fieldRef,
  highlightedFields 
}) => {
  const isHighlighted = highlightedFields.includes(name);
  
  return (
    <div className={isHighlighted ? 'manage-society-field-highlighted' : ''}>
      <TextField
        required={required}
        fullWidth
        id={name}
        name={name}
        label={label}
        type={type}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        InputProps={InputProps}
        InputLabelProps={InputLabelProps}
        ref={fieldRef}
        className="manage-society-text-field"
      />
    </div>
  );
});

const ManageSociety: React.FC = () => {
  const params = useParams<RouteParams>();
  const societyId = params.societyId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightField = searchParams.get('field');
  const [society, setSociety] = useState<Society | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  
  // Refs for field highlighting
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // Function to get the appropriate field name for different card types
  const getFieldMappings = () => {
    return {
      'address': ['address', 'city', 'state', 'zipcode', 'country'],
      'contact': ['contact_email', 'contact_phone'],
      'total_units': ['total_units'],
      'registration_date': ['registration_date'],
      'registration_number': ['registration_number']
    };
  };

  // Get the fields to highlight based on the field parameter
  const getFieldsToHighlight = () => {
    if (!highlightField) return [];
    const mappings = getFieldMappings();
    return mappings[highlightField as keyof typeof mappings] || [highlightField];
  };

  const fieldsToHighlight = getFieldsToHighlight();

  const setFieldRef = (fieldName: string) => (ref: HTMLElement | null) => {
    fieldRefs.current[fieldName] = ref;
  };

  useEffect(() => {
    if (societyId) {
      fetchSocietyDetails();
    } else {
      // Initialize empty society for new society creation
      const emptySociety: Society = {
        id: 0,
        name: '',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        contact_email: '',
        contact_phone: '',
        total_units: 0,
        registration_date: '',
        registration_number: ''
      };
      setSociety(emptySociety);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [societyId]);

  // Effect to handle field highlighting after society data is loaded
  useEffect(() => {
    if (society && highlightField && fieldsToHighlight.length > 0) {
      // Use requestAnimationFrame for smoother rendering
      const rafId = requestAnimationFrame(() => {
        // Set the fields to highlight
        setHighlightedFields(fieldsToHighlight);
        
        // Scroll to the first field in the group
        const firstField = fieldsToHighlight[0];
        const firstElement = fieldRefs.current[firstField];
        if (firstElement) {
          firstElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus on the first field after scroll completes
          setTimeout(() => {
            firstElement.focus();
          }, 500);
        }
      });
      
      // Remove highlight after 3.5 seconds
      const timeoutId = setTimeout(() => {
        setHighlightedFields([]);
      }, 3500);
      
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeoutId);
      };
    }
  }, [society, highlightField, fieldsToHighlight]);

  const fetchSocietyDetails = async (): Promise<void> => {
    if (!societyId) return;
    
    try {
      setLoading(true);
      const societyData = await societyService.getSocietyById(societyId);
      
      // Transform data to match our Society interface
      const transformedData: Society = {
        ...societyData,
        address: societyData.address || '',
        city: societyData.city || '',
        state: societyData.state || '',
        zipcode: societyData.zipcode || '',
        country: societyData.country || '',
        total_units: societyData.total_units || 0,
      };
      
      setSociety(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching society details:', err);
      setError('Failed to load society details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (society) {
      setSociety({
        ...society,
        [name]: name === 'total_units' ? Number(value) : value
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

  // Helper function to validate required fields
  const validateRequiredField = (value: string | undefined, fieldName: string, displayName: string, errors: FieldErrors) => {
    if (!value?.trim()) {
      errors[fieldName as keyof FieldErrors] = `${displayName} is required`;
      return false;
    }
    return true;
  };

  // Helper function to validate email
  const validateEmail = (email: string | undefined, errors: FieldErrors) => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      errors.contact_email = 'Invalid email format';
      return false;
    }
    return true;
  };

  // Helper function to validate phone
  const validatePhone = (phone: string | undefined, errors: FieldErrors) => {
    if (phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone)) {
      errors.contact_phone = 'Invalid phone number format';
      return false;
    }
    return true;
  };

  const validateFields = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;
    
    // Required fields validation using helper function
    const requiredFields = [
      { value: society?.name, field: 'name', display: 'Society name' },
      { value: society?.address, field: 'address', display: 'Address' },
      { value: society?.city, field: 'city', display: 'City' },
      { value: society?.state, field: 'state', display: 'State' },
      { value: society?.zipcode, field: 'zipcode', display: 'Zipcode' },
      { value: society?.country, field: 'country', display: 'Country' }
    ];

    requiredFields.forEach(({ value, field, display }) => {
      if (!validateRequiredField(value, field, display, newErrors)) {
        isValid = false;
      }
    });
    
    // Total units validation
    if (society?.total_units === undefined || society.total_units < 1) {
      newErrors.total_units = 'Total units must be at least 1';
      isValid = false;
    }
    
    // Email and phone validation
    if (!validateEmail(society?.contact_email, newErrors)) {
      isValid = false;
    }
    
    if (!validatePhone(society?.contact_phone, newErrors)) {
      isValid = false;
    }
    
    setFieldErrors(newErrors);
    return isValid;
  };

  // Helper function to prepare society data for submission
  const prepareSocietyData = () => {
    if (!society) return {};
    
    // For creating new societies, ensure all required fields are present
    if (!societyId) {
      return {
        name: society.name || '',
        address: society.address || '',
        city: society.city || '',
        state: society.state || '',
        zipcode: society.zipcode || '',
        country: society.country || '',
        total_units: society.total_units || 0,
        contact_email: society.contact_email,
        contact_phone: society.contact_phone,
        registration_date: society.registration_date ? society.registration_date.substring(0, 10) : undefined,
        registration_number: society.registration_number
      };
    }
    
    // For updating existing societies, return partial data
    return {
      name: society.name,
      address: society.address,
      city: society.city,
      state: society.state,
      zipcode: society.zipcode,
      country: society.country,
      total_units: society.total_units,
      contact_email: society.contact_email,
      contact_phone: society.contact_phone,
      // Ensure date is properly formatted YYYY-MM-DD
      registration_date: society.registration_date ? society.registration_date.substring(0, 10) : undefined,
      registration_number: society.registration_number
    };
  };

  // Helper function to handle backend errors
  const handleBackendErrors = (err: any) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    
    if (!society || !validateFields()) {
      return;
    }
    
    try {
      // Prepare society data for submission
      const societyData = prepareSocietyData();
      
      if (societyId) {
        // Update existing society
        console.log('Submitting society update with payload:', societyData);
        console.log('Society ID for update:', societyId);
        
        const updatedSociety = await societyService.updateSociety(societyId, societyData);
        console.log('Society update successful, response:', updatedSociety);
        
        // Navigate back to details immediately on successful save
        navigate(`/societies/${societyId}`);
      } else {
        // Create new society
        console.log('Submitting new society with payload:', societyData);
        
        // Type assertion is safe here because validation ensures required fields are present
        const createData = societyData as Partial<SocietyData> & { 
          city: string;
          state: string;
          zipcode: string;
          country: string;
          contact_email?: string;
          contact_phone?: string; 
          total_units: number;
          registration_number?: string;
        };
        
        const newSociety = await societyService.createSociety(createData);
        console.log('Society creation successful, response:', newSociety);
        
        // Navigate to the new society's details page
        navigate(`/societies/${newSociety.id}`);
      }
    } catch (err: any) {
      console.error('Error saving society:', err);
      
      // Handle validation errors from backend
      handleBackendErrors(err);
      
      const operation = societyId ? 'update' : 'create';
      setError(err.message || `Failed to ${operation} society. Please verify all required fields are filled correctly.`);
    }
  };

  // Helper function to render form sections
  const renderFormSection = (title: string, children: React.ReactNode) => (
    <Box className="manage-society-section">
      <Typography variant="h6" className="manage-society-section-title">
        {title}
      </Typography>
      {children}
    </Box>
  );

  if (loading) {
    return (
      <div className="manage-society-container">
        <Container maxWidth="xl" className="manage-society-container-max-width">
          <Box className="manage-society-loading-container">
            <CircularProgress size={40} className="manage-society-loading-spinner" />
          </Box>
        </Container>
      </div>
    );
  }

  if (error && !society) {
    return (
      <div className="manage-society-container">
        <Container maxWidth="xl" className="manage-society-container-max-width">
          <Alert 
            severity="error" 
            className="manage-society-error-alert"
          >
            {error}
          </Alert>
          <Button 
            variant="outlined"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(societyId ? `/societies/${societyId}` : '/societies')}
            className="manage-society-back-button"
          >
            {societyId ? 'Back to Society Details' : 'Back to Societies'}
          </Button>
        </Container>
      </div>
    );
  }

  if (!society) {
    return (
      <div className="manage-society-container">
        <Container maxWidth="xl" className="manage-society-container-max-width">
          <Alert 
            severity="warning" 
            className="manage-society-error-alert"
          >
            Society not found
          </Alert>
          <Button 
            variant="outlined"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/societies')}
            className="manage-society-back-button"
          >
            Back to Societies
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="manage-society-container">
      <Container maxWidth="xl" className="manage-society-container-max-width">
        <div className="page-header">
          <h1 className="page-header-title">
            {societyId ? society.name : 'Add New Society'}
          </h1>
        </div>

        {error && (
          <Alert 
            severity="error" 
            className="manage-society-inline-error-alert"
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="manage-society-form">
          {renderFormSection("Basic Information", (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SocietyTextField
                  name="name"
                  label="Society Name"
                  value={society.name || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  required
                  fieldRef={setFieldRef('name')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
              
              <Grid item xs={12}>
                <SocietyTextField
                  name="address"
                  label="Address"
                  value={society.address || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                  required
                  fieldRef={setFieldRef('address')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <SocietyTextField
                  name="city"
                  label="City"
                  value={society.city || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city}
                  required
                  fieldRef={setFieldRef('city')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <SocietyTextField
                  name="state"
                  label="State/Province"
                  value={society.state || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.state}
                  helperText={fieldErrors.state}
                  required
                  fieldRef={setFieldRef('state')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <SocietyTextField
                  name="zipcode"
                  label="Zipcode/Postal Code"
                  value={society.zipcode || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.zipcode}
                  helperText={fieldErrors.zipcode}
                  required
                  fieldRef={setFieldRef('zipcode')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
              
              <Grid item xs={12}>
                <SocietyTextField
                  name="country"
                  label="Country"
                  value={society.country || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.country}
                  helperText={fieldErrors.country}
                  required
                  fieldRef={setFieldRef('country')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <SocietyTextField
                  name="total_units"
                  label="Total Units"
                  type="number"
                  value={society.total_units || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.total_units}
                  helperText={fieldErrors.total_units}
                  required
                  InputProps={{ inputProps: { min: 1 } }}
                  fieldRef={setFieldRef('total_units')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
            </Grid>
          ))}
          
          {renderFormSection("Contact", (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SocietyTextField
                  name="contact_email"
                  label="Contact Email"
                  value={society.contact_email || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.contact_email}
                  helperText={fieldErrors.contact_email}
                  fieldRef={setFieldRef('contact_email')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <SocietyTextField
                  name="contact_phone"
                  label="Contact Phone"
                  value={society.contact_phone || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.contact_phone}
                  helperText={fieldErrors.contact_phone}
                  fieldRef={setFieldRef('contact_phone')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
            </Grid>
          ))}
          
          {renderFormSection("Registration Information", (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SocietyTextField
                  name="registration_number"
                  label="Registration Number"
                  value={society.registration_number || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.registration_number}
                  helperText={fieldErrors.registration_number}
                  fieldRef={setFieldRef('registration_number')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <SocietyTextField
                  name="registration_date"
                  label="Registration Date"
                  type="date"
                  value={society.registration_date ? society.registration_date.substring(0, 10) : ''}
                  onChange={handleChange}
                  error={!!fieldErrors.registration_date}
                  helperText={fieldErrors.registration_date}
                  InputLabelProps={{ shrink: true }}
                  fieldRef={setFieldRef('registration_date')}
                  highlightedFields={highlightedFields}
                />
              </Grid>
            </Grid>
          ))}
          
          <Box className="manage-society-form-actions">
            <Button
              variant="outlined"
              onClick={() => navigate(societyId ? `/societies/${societyId}` : '/societies')}
              className="manage-society-button manage-society-button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              className="manage-society-button"
            >
              {societyId ? 'Save Changes' : 'Create Society'}
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default ManageSociety;
