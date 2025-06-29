import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  CircularProgress, 
  Box, 
  Alert, 
  TextField,
  Button
} from '@mui/material';
import { societyService } from '../../services';
import SocietyCard from '../../components/SocietyCard';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import './SocietiesList.css';

const SocietiesList = () => {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const data = await societyService.getAllSocieties();
      setSocieties(data);
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

  return (
    <div className="societies-container">
      <Container maxWidth="lg">
        <div className="societies-header">
          <h1 className="societies-header-title">
            Housing Societies
          </h1>
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
            startIcon={<AddIcon />}
            // onClick={() => navigate('/societies/new')}
          >
          Add Society
        </Button>
        </div>
        
        <div className="societies-filters">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                className="search-field"
                fullWidth
                placeholder="Search societies by name, city or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1.5 }} />,
                  sx: { borderRadius: 'var(--border-radius)' }
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="body2" 
                sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}
              >
                Showing {filteredSocieties.length} of {societies.length} societies
              </Typography>
            </Grid>
          </Grid>
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
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {filteredSocieties.map((society) => (
            <Grid item key={society.id} xs={12} sm={6} md={4}>
              <SocietyCard society={society} />
            </Grid>
          ))}
        </Grid>
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
      </Container>
    </div>
  );
};

export default SocietiesList;
