import React, { useState, useEffect } from 'react';
import { 
  Container, 
  CircularProgress, 
  Box, 
  Alert, 
  TextField,
  Button
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

const SocietiesList: React.FC = () => {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

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

  const handleAddSociety = (): void => {
    navigate('/societies/new');
  };

  return (
    <div className="societies-container">
      <Container maxWidth="xl" className="societies-container-max-width">
        <div className="societies-header">
          <h1 className="societies-header-title">
            Housing Societies
          </h1>
          <Box className="societies-header-actions">
            <Box className="societies-search-container">
              <TextField
                className="search-field"
                fullWidth
                placeholder="Search societies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" />,
                }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddSociety}
              className="societies-add-button"
            >
              Add Society
            </Button>
          </Box>
        </div>

      {loading ? (
        <Box className="societies-loading-container">
          <CircularProgress size={40} className="societies-loading-spinner" />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          className="societies-error-alert"
        >
          {error}
        </Alert>
      ) : filteredSocieties.length > 0 ? (
        <Box className="societies-grid">
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
        <Box className="no-societies">
          <Alert 
            severity="info" 
            className="no-societies-alert"
          >
            No societies found matching your search criteria.
          </Alert>
        </Box>
      )}
      </Container>
    </div>
  );
};

export default SocietiesList;
