import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, 
  CircularProgress, 
  Box, 
  Alert, 
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { residentService, societyService } from '../../services';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { SocietyData } from '../../types';
import '../../styles/shared-headers.css';
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

// Route params interface
type RouteParams = {
  societyId?: string;
};

const ResidentsList: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<RouteParams>();
  const societyId = params.societyId;
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSociety, setSelectedSociety] = useState<string | number | null>(null);
  
  // Need to add the societies state and fetch
  const [societies, setSocieties] = useState<SocietyData[]>([]);
  const [currentSociety, setCurrentSociety] = useState<SocietyData | null>(null);

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSociety, societyId]);

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

  // Fetch current society details when societyId is provided
  useEffect(() => {
    const fetchCurrentSociety = async (): Promise<void> => {
      if (societyId) {
        try {
          const societyData = await societyService.getSocietyById(societyId);
          setCurrentSociety(societyData);
        } catch (err) {
          console.error('Error fetching current society:', err);
        }
      } else {
        setCurrentSociety(null);
      }
    };
    
    fetchCurrentSociety();
  }, [societyId]);

  const fetchResidents = async (): Promise<void> => {
    try {
      setLoading(true);
      let data: Resident[];
      
      // If societyId is provided from route params, filter by that society
      if (societyId) {
        data = await residentService.getSocietyResidents(societyId);
      } else if (selectedSociety) {
        // Fetch residents for specific society from dropdown filter
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
    const unitNumber = resident.unit_number?.toLowerCase() || '';
    const searchLowerCase = searchTerm.toLowerCase();
    
    return fullName.includes(searchLowerCase) ||
      unitNumber.includes(searchLowerCase) ||
      resident.email?.toLowerCase().includes(searchLowerCase) ||
      resident.committee_role?.toLowerCase().includes(searchLowerCase);
  });
  
  const handleAddResident = (): void => {
    // Navigate to ManageResident page in Add mode
    // If we're on a society-specific residents page, pass the societyId
    if (societyId) {
      navigate(`/residents/add?societyId=${societyId}`);
    } else {
      navigate('/residents/add');
    }
  };
  
  return (
    <div className="residents-container">
      <Container maxWidth="xl" className="no-padding">
        <div className="page-header">
          <div className="page-title-section">
            {societyId && (
              <IconButton 
                onClick={() => navigate(`/societies/${societyId}`)}
                className="page-back-button"
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <h1 className="page-header-title">
              {currentSociety ? `${currentSociety.name} Residents` : 'Residents'}
            </h1>
          </div>
          <Box className="page-header-controls">
            <Box className="page-search-container">
              <TextField
                className="search-field"
                fullWidth
                placeholder="Search unit, name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" className="search-icon" />
                }}
                variant="outlined"
                size="small"
              />
            </Box>
            {!societyId && (
              <Box className="page-filter-container">
                <FormControl fullWidth size="small" className="residents-form-control">
                  <InputLabel id="society-select-label">Filter by Society</InputLabel>
                  <Select
                    labelId="society-select-label"
                    value={selectedSociety !== null ? selectedSociety.toString() : ''}
                    onChange={(e) => setSelectedSociety(e.target.value || null)}
                    label="Filter by Society"
                    className="residents-select"
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
            )}
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddResident}
              className="page-add-button"
            >
              Add Resident
            </Button>
          </Box>
        </div>

      {loading ? (
        <Box className="residents-loading">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" className="residents-error">{error}</Alert>
      ) : filteredResidents.length > 0 ? (
        <Box className="residents-grid">
          {filteredResidents.map((resident) => (
            <Box key={resident.id}>
                <CardList 
                  data={resident}
                  title={resident.unit_number || 'No Unit'} /* Changed from full name to unit number */
                  subtitle={`${resident.first_name} ${resident.last_name}`} /* Added full name as subtitle */
                  fields={[]} /* Removed contact details - no fields displayed */
                  actions={[
                    {
                      label: '',
                      variant: 'text',
                      icon: <ArrowForwardIosIcon />, // Reverted to original icon without custom size
                      onClick: () => navigate(`/residents/${resident.id}`),
                      sx: { 
                        minWidth: '40px', // Reverted to original width
                        width: '40px', 
                        height: '32px', // Reverted to original height
                        padding: '4px', // Reverted to original padding
                        marginLeft: 'auto',
                        '&:hover': {
                          backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                          color: 'var(--primary-color)'
                        }
                      }
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

    </Container>
    </div>
  );
};

export default ResidentsList;
