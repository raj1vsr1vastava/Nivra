import React, { useState, useEffect } from 'react';
import { 
  Container, 
  CircularProgress, 
  Box, 
  Alert, 
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import { societyService } from '../../services';
import CardList from '../../components/CardList';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useNavigate } from 'react-router-dom';
import { SocietyData } from '../../types';
import './SocietiesList.css';

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
}

const SocietiesList: React.FC = () => {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogError, setDialogError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [newSociety, setNewSociety] = useState<Partial<Society>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    contact_email: '',
    contact_phone: '',
    total_units: 0,
    registration_number: '',
  });

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await societyService.getAllSocieties();
      // Transform the data to match the Society interface
      const transformedData = data.map(society => ({
        ...society,
        address: society.address || '',
        city: '',  // These fields might need to be extracted from the address or set as default values
        state: '',
        zipcode: '',
        country: '',
        total_units: society.units || 0
      })) as Society[];
      
      setSocieties(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching societies:', err);
      setError('Failed to load societies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSocieties = societies.filter(society => 
    society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (): void => {
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setNewSociety({
      name: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      country: '',
      contact_email: '',
      contact_phone: '',
      total_units: 0,
      registration_number: '',
    });
    setDialogError('');
    setFieldErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setNewSociety(prev => ({ ...prev, [name]: value }));
  };

  // Remove unused function

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      setNewSociety(prev => ({ ...prev, [name]: numValue }));
    }
  };

  const handleCreateSociety = async (): Promise<void> => {
    try {
      setDialogError('');
      setFieldErrors({});
      
      // Validate required fields based on NOT NULL constraints in DB
      const errors: FieldErrors = {};
      if (!newSociety.name) errors.name = 'Society name is required';
      if (!newSociety.address) errors.address = 'Address is required';
      if (!newSociety.city) errors.city = 'City is required';
      if (!newSociety.state) errors.state = 'State is required';
      if (!newSociety.zipcode) errors.zipcode = 'Zip/Postal code is required';
      if (!newSociety.country) errors.country = 'Country is required';
      if (!newSociety.total_units || newSociety.total_units <= 0) errors.total_units = 'Total units must be greater than 0';
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      
      // Create society via API with the required fields (TypeScript needs non-null assertion)
      await societyService.createSociety({
        name: newSociety.name!,
        address: newSociety.address!,
        city: newSociety.city!,
        state: newSociety.state!,
        zipcode: newSociety.zipcode!,
        country: newSociety.country!,
        total_units: newSociety.total_units!,
        contact_email: newSociety.contact_email,
        contact_phone: newSociety.contact_phone,
        registration_number: newSociety.registration_number
      });
      
      // Refresh societies list and close dialog
      fetchSocieties();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error creating society:', err);
      
      // Handle field-specific errors
      if (err.fields) {
        // If we have multiple field errors
        const fieldErrorsObj: FieldErrors = {};
        Object.entries(err.fields).forEach(([field, messages]) => {
          fieldErrorsObj[field as keyof FieldErrors] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setFieldErrors(fieldErrorsObj);
      } else if (err.field) {
        // Single field error
        setFieldErrors({
          [err.field]: err.message
        });
      }
      
      // Show error in dialog
      setDialogError(err.message || 'Failed to create society. Please verify all required fields are filled correctly.');
      
      // Log additional details for debugging
      if (err.data) {
        console.log('Error response data:', err.data);
      }
    }
  };

  return (
    <div className="societies-container">
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } /* Increased padding for better spacing */ }}>
        <div className="societies-header">
          <h1 className="societies-header-title">
            Housing Societies
          </h1>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, md: 2 },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            width: { xs: '100%', md: 'auto' }
          }}>
            <Box sx={{ 
              display: 'flex',
              flexGrow: 1, 
              maxWidth: { xs: '100%', md: '300px' },
              minWidth: { xs: '100%', md: '200px' },
              order: { xs: 2, md: 1 }
            }}>
              <TextField
                className="search-field"
                fullWidth
                placeholder="Search societies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 0.5 }} />,
                  sx: { 
                    borderRadius: 'var(--border-radius)',
                    height: '40px',
                    fontSize: '0.875rem'
                  }
                }}
                variant="outlined"
                size="small"
              />
            </Box>
            {/* Removed society count display */}
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ 
                order: { xs: 1, md: 3 },
                width: { xs: '100%', md: 'auto' },
                ml: { xs: 0, md: 1 },
                height: '40px',
              }}
            >
              Add Society
            </Button>
          </Box>
        </div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress size={40} sx={{ color: 'var(--primary-color)' }} />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 3, 
            borderRadius: 'var(--border-radius)', 
            fontWeight: 500 
          }}
        >
          {error}
        </Alert>
      ) : filteredSocieties.length > 0 ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(auto-fill, minmax(250px, 1fr))', /* Slightly smaller cards on mobile */
            sm: 'repeat(auto-fill, minmax(260px, 1fr))',
            md: 'repeat(auto-fill, minmax(280px, 1fr))' 
          }, 
          gap: { xs: 1, sm: 2, md: 2 }, /* Reduced gaps for better spacing */
          mt: 3, /* Increased margin top for better spacing */
          px: 1 /* Added horizontal padding to the grid */
        }}>
          {filteredSocieties.map((society) => (
            <Box key={society.id}>
              <CardList 
                data={society}
                title={society.name}
                fields={[
                  ...(society.contact_email ? [{
                    icon: <EmailIcon />,
                    value: society.contact_email,
                    iconColor: 'var(--secondary-color)'
                  }] : []),
                  ...(society.contact_phone ? [{
                    icon: <PhoneIcon />,
                    value: society.contact_phone,
                    iconColor: 'var(--secondary-color)'
                  }] : []),
                ]}
                actions={[
                  {
                    label: 'View Details',
                    variant: 'contained',
                    onClick: () => navigate(`/societies/${society.id}`)
                  }
                ]}
                borderColor="var(--primary-color)"
                hoverBorderColor="var(--accent-color)"
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box 
          className="no-societies" 
          sx={{ 
            mt: 4, 
            p: 4, 
            textAlign: 'center',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'white',
            boxShadow: 'var(--card-shadow)'
          }}
        >
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 'var(--border-radius)', 
              fontWeight: 500 
            }}
          >
            No societies found matching your search criteria.
          </Alert>
        </Box>
      )}

      {/* Dialog for adding new society */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--card-shadow)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          fontSize: '1.25rem',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          Add New Society
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Fields marked with * are required (Society Name, Address, City, State, Zip/Postal Code, Country, and Total Units)
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          pt: 2, 
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 1 }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                name="name"
                label="Society Name"
                fullWidth
                required
                value={newSociety.name || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name}
                margin="normal"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                required
                value={newSociety.address || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.address)}
                helperText={fieldErrors.address}
                margin="normal"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="city"
                label="City"
                fullWidth
                required
                value={newSociety.city || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.city)}
                helperText={fieldErrors.city}
                margin="normal"
              />
              <TextField
                name="state"
                label="State/Province"
                fullWidth
                required
                value={newSociety.state || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.state)}
                helperText={fieldErrors.state}
                margin="normal"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="zipcode"
                label="Postal/Zip Code"
                fullWidth
                required
                value={newSociety.zipcode || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.zipcode)}
                helperText={fieldErrors.zipcode}
                margin="normal"
              />
              <TextField
                name="country"
                label="Country"
                fullWidth
                required
                value={newSociety.country || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.country)}
                helperText={fieldErrors.country}
                margin="normal"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="contact_email"
                label="Contact Email"
                type="email"
                fullWidth
                value={newSociety.contact_email || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.contact_email)}
                helperText={fieldErrors.contact_email}
                margin="normal"
              />
              <TextField
                name="contact_phone"
                label="Contact Phone"
                fullWidth
                value={newSociety.contact_phone || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.contact_phone)}
                helperText={fieldErrors.contact_phone}
                margin="normal"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                name="total_units"
                label="Total Units"
                type="number"
                fullWidth
                required
                InputProps={{ inputProps: { min: 1 } }}
                value={newSociety.total_units || ''}
                onChange={handleNumberChange}
                error={Boolean(fieldErrors.total_units)}
                helperText={fieldErrors.total_units}
                margin="normal"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                name="registration_number"
                label="Registration Number"
                fullWidth
                value={newSociety.registration_number || ''}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.registration_number)}
                helperText={fieldErrors.registration_number}
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateSociety} 
            variant="contained" 
            color="primary"
            disabled={
              !newSociety.name || 
              !newSociety.address || 
              !newSociety.city || 
              !newSociety.state || 
              !newSociety.zipcode || 
              !newSociety.country || 
              !newSociety.total_units || 
              newSociety.total_units <= 0
            }
          >
            Create Society
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </div>
  );
};

export default SocietiesList;
