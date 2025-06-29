import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  CircularProgress, 
  Box, 
  Alert, 
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
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
  FormControlLabel
} from '@mui/material';
import { residentService, societyService } from '../../services';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import './ResidentsList.css';

// Resident Card Component
const ResidentCard = ({ resident }) => {
  const fullName = `${resident.first_name} ${resident.last_name}`;
  
  return (
    <Card className="resident-card">
      <Box className="resident-card-header">
        <Avatar className="resident-avatar">
          {resident.first_name ? resident.first_name[0].toUpperCase() : 'R'}
        </Avatar>
        <Typography variant="h6" component="div">
          {fullName}
        </Typography>
      </Box>
      
      <CardContent className="resident-card-content">
        <Box className="resident-info-item">
          <HomeIcon className="resident-info-icon" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Unit: {resident.unit_number}
          </Typography>
        </Box>
        
        <Box className="resident-info-item">
          <PersonIcon className="resident-info-icon" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {resident.is_owner ? 'Owner' : 'Tenant'} 
            {resident.is_committee_member && ' | Committee Member'}
            {resident.committee_role && ` - ${resident.committee_role}`}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box className="resident-info-item">
          <EmailIcon className="resident-info-icon" fontSize="small" />
          <Typography variant="body2" color="text.secondary" noWrap>
            {resident.email || 'No email provided'}
          </Typography>
        </Box>
        
        <Box className="resident-info-item">
          <PhoneIcon className="resident-info-icon" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {resident.phone || 'No phone provided'}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">View Details</Button>
        <Button size="small" color="primary">Edit</Button>
      </CardActions>
    </Card>
  );
};

const ResidentsList = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSociety, setSelectedSociety] = useState(null);
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [newResident, setNewResident] = useState({
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

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSociety]);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      let data;
      
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
    
    return fullName.includes(searchTerm.toLowerCase()) ||
      resident.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.committee_role?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Need to add the societies state and fetch
  const [societies, setSocieties] = useState([]);
  
  // Fetch societies for the dropdown
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const data = await societyService.getAllSocieties();
        setSocieties(data);
      } catch (err) {
        console.error('Error fetching societies:', err);
      }
    };
    
    fetchSocieties();
  }, []);
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
    // Default to the currently selected society if one is selected
    if (selectedSociety) {
      setNewResident(prev => ({ ...prev, society_id: selectedSociety }));
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewResident({
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewResident({ ...newResident, [name]: value });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setNewResident({ ...newResident, [name]: checked });
  };

  const handleCreateResident = async () => {
    try {
      setDialogError('');
      setFieldErrors({});
      
      // Validate required fields
      if (!newResident.first_name || !newResident.last_name || !newResident.society_id) {
        const errors = {};
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
    } catch (err) {
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
    <Container maxWidth="lg" className="residents-container">
      <Box className="residents-header">
        <Typography variant="h4" component="h1" className="residents-header-title">
          Residents
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Resident
        </Button>
      </Box>
      
      <Paper className="residents-filters">
        <Grid container spacing={2} alignItems="center" p={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search residents by name, email, unit number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="society-select-label">Filter by Society</InputLabel>
              <Select
                labelId="society-select-label"
                value={selectedSociety || ''}
                onChange={(e) => setSelectedSociety(e.target.value || null)}
                label="Filter by Society"
              >
                <MenuItem value="">All Societies</MenuItem>
                {societies.map((society) => (
                  <MenuItem key={society.id} value={society.id}>
                    {society.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Showing {filteredResidents.length} of {residents.length} residents
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : filteredResidents.length > 0 ? (
        <Grid container spacing={4}>
          {filteredResidents.map((resident) => (
            <Grid item key={resident.id} xs={12} sm={6} md={4}>
              <ResidentCard resident={resident} />
            </Grid>
          ))}
        </Grid>
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
                  value={newResident.society_id}
                  label="Society"
                  onChange={handleInputChange}
                >
                  {societies.map(society => (
                    <MenuItem key={society.id} value={society.id}>
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
  );
};

export default ResidentsList;
