import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  CircularProgress, 
  Box, 
  Alert, 
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Switch,
  FormControlLabel,
  SelectChangeEvent
} from '@mui/material';
import { residentService, societyService } from '../../services';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import Grid from '../../components/shared/Grid';
import { SocietyData } from '../../types';
import './ResidentsList.css';
import CardList from '../../components/CardList';

// Extend the ResidentData interface from existing types
interface Resident {
  id: string | number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  unit_number?: string;
  society_id: string | number;
  is_owner: boolean;
  is_committee_member: boolean;
  committee_role?: string;
  is_active: boolean;
}

// Field errors interface
interface FieldErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  unit_number?: string;
  society_id?: string;
  committee_role?: string;
}

const ResidentsList: React.FC = () => {
  const navigate = useNavigate();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSociety, setSelectedSociety] = useState<string | number | null>(null);
  // Dialog state
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogError, setDialogError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [newResident, setNewResident] = useState<Resident>({
    id: '', // This will be assigned by the backend
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    unit_number: '',
    society_id: '',
    is_owner: true,
    is_committee_member: false,
    committee_role: '',
    is_active: true
  });

  // Need to add the societies state and fetch
  const [societies, setSocieties] = useState<SocietyData[]>([]);

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSociety]);

  // Fetch societies for the dropdown
  useEffect(() => {
    const fetchSocieties = async (): Promise<void> => {
      try {
        const data = await societyService.getAllSocieties();
        setSocieties(data);
      } catch (err) {
        console.error('Error fetching societies:', err);
      }
    };
    
    fetchSocieties();
  }, []);

  const fetchResidents = async (): Promise<void> => {
    try {
      setLoading(true);
      let data: Resident[];
      
      if (selectedSociety) {
        // Fetch residents for specific society
        data = await residentService.getSocietyResidents(selectedSociety);
      } else {
        // Fetch all residents
        data = await residentService.getAllResidents();
      }
      
      setResidents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching residents:', err);
      setError('Failed to load residents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(resident => {
    const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
    const searchLowerCase = searchTerm.toLowerCase();
    
    return fullName.includes(searchLowerCase) ||
      resident.email?.toLowerCase().includes(searchLowerCase) ||
      resident.unit_number?.toLowerCase().includes(searchLowerCase) ||
      resident.committee_role?.toLowerCase().includes(searchLowerCase);
  });
  
  const handleOpenDialog = (): void => {
    setOpenDialog(true);
    // Default to the currently selected society if one is selected
    if (selectedSociety) {
      setNewResident(prev => ({ ...prev, society_id: selectedSociety }));
    }
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setNewResident({
      id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      unit_number: '',
      society_id: '',
      is_owner: true,
      is_committee_member: false,
      committee_role: '',
      is_active: true
    });
    setDialogError('');
    setFieldErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setNewResident(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>): void => {
    const { name, value } = e.target;
    setNewResident(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setNewResident(prev => ({ ...prev, [name]: checked }));
  };

  const handleCreateResident = async (): Promise<void> => {
    try {
      setDialogError('');
      setFieldErrors({});
      
      // Validate required fields
      if (!newResident.first_name || !newResident.last_name || !newResident.society_id) {
        const errors: FieldErrors = {};
        if (!newResident.first_name) errors.first_name = 'First name is required';
        if (!newResident.last_name) errors.last_name = 'Last name is required';
        if (!newResident.society_id) errors.society_id = 'Society is required';
        
        setFieldErrors(errors);
        return;
      }
      
      // Create resident via API
      await residentService.createResident(newResident);
      
      // Refresh residents list and close dialog
      fetchResidents();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error creating resident:', err);
      
      // Handle field-specific errors
      if (err.field) {
        setFieldErrors({
          [err.field]: err.message
        });
      }
      
      setDialogError(err.message || 'Failed to create resident. Please try again.');
    }
  };
  
  return (
    <div className="residents-container">
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } /* Increased padding for better spacing */ }}>
        <div className="residents-header">
          <h1 className="residents-header-title">
            Residents
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
                placeholder="Search residents..."
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
            <Box sx={{ 
              display: 'flex',
              flexGrow: 1, 
              maxWidth: { xs: '100%', md: '250px' },
              minWidth: { xs: '100%', md: '200px' },
              order: { xs: 3, md: 2 }
            }}>
              <FormControl fullWidth size="small" sx={{ height: '40px' }}>
                <InputLabel id="society-select-label">Filter by Society</InputLabel>
                <Select
                  labelId="society-select-label"
                  value={selectedSociety !== null ? selectedSociety.toString() : ''}
                  onChange={(e) => setSelectedSociety(e.target.value || null)}
                  label="Filter by Society"
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="">All Societies</MenuItem>
                  {societies.map((society) => (
                    <MenuItem key={society.id} value={society.id.toString()}>
                      {society.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button 
              className="modern-button"
              variant="contained"
              sx={{ 
                background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
                fontWeight: 600,
                height: '40px',
                order: { xs: 1, md: 3 },
                width: { xs: '100%', md: 'auto' },
                ml: { xs: 0, md: 1 },
                '&:hover': {
                  background: 'linear-gradient(45deg, var(--secondary-color), var(--primary-color))',
                  transform: 'translateY(-2px)'
                }
              }}
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Resident
            </Button>
          </Box>
        </div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : filteredResidents.length > 0 ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'minmax(280px, 300px)', 
            sm: 'repeat(auto-fill, minmax(280px, 300px))', 
            md: 'repeat(auto-fill, minmax(280px, 300px))' 
          }, 
          gap: 4, 
          mt: 2,
          justifyContent: 'center' 
        }}>
          {filteredResidents.map((resident) => (
            <Box key={resident.id}>
                <CardList 
                  data={resident}
                  title={`${resident.first_name} ${resident.last_name}`}
                  fields={[
                    ...(resident.email ? [{
                      icon: <EmailIcon />,
                      value: resident.email,
                      iconColor: 'var(--secondary-color)'
                    }] : []),
                    ...(resident.phone ? [{
                      icon: <PhoneIcon />,
                      value: resident.phone,
                      iconColor: 'var(--secondary-color)'
                    }] : []),
                  ]}
                  actions={[
                    {
                      label: 'View Details',
                      variant: 'contained',
                      onClick: () => navigate(`/residents/${resident.id}`)
                    }
                  ]}
                  borderColor="var(--primary-color)"
                  hoverBorderColor="var(--accent-color)"
                />            </Box>
          ))}
        </Box>
      ) : (
        <Box className="no-residents">
          <Alert severity="info">No residents found matching your search criteria.</Alert>
        </Box>
      )}

      {/* Resident Creation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Resident</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Box sx={{ mt: 1, mb: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="error" variant="body2">
                {dialogError}
              </Typography>
            </Box>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="first_name"
                label="First Name"
                fullWidth
                required
                value={newResident.first_name}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.first_name)}
                helperText={fieldErrors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="last_name"
                label="Last Name"
                fullWidth
                required
                value={newResident.last_name}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.last_name)}
                helperText={fieldErrors.last_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={newResident.email}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                fullWidth
                value={newResident.phone}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="unit_number"
                label="Unit Number"
                fullWidth
                value={newResident.unit_number}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.unit_number)}
                helperText={fieldErrors.unit_number || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={Boolean(fieldErrors.society_id)}>
                <InputLabel id="society-id-label">Society</InputLabel>
                <Select
                  labelId="society-id-label"
                  name="society_id"
                  value={newResident.society_id.toString()}
                  label="Society"
                  onChange={handleSelectChange}
                >
                  {societies.map(society => (
                    <MenuItem key={society.id} value={society.id.toString()}>
                      {society.name}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.society_id && (
                  <FormHelperText>{fieldErrors.society_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_owner"
                    checked={newResident.is_owner}
                    onChange={handleSwitchChange}
                  />
                }
                label="Owner (uncheck for tenant)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_committee_member"
                    checked={newResident.is_committee_member}
                    onChange={handleSwitchChange}
                  />
                }
                label="Committee Member"
              />
            </Grid>
            {newResident.is_committee_member && (
              <Grid item xs={12} sm={12}>
                <TextField
                  name="committee_role"
                  label="Committee Role"
                  fullWidth
                  value={newResident.committee_role}
                  onChange={handleInputChange}
                  error={Boolean(fieldErrors.committee_role)}
                  helperText={fieldErrors.committee_role || "e.g. Secretary, Treasurer, etc."}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={newResident.is_active}
                    onChange={handleSwitchChange}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateResident} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </div>
  );
};

export default ResidentsList;
