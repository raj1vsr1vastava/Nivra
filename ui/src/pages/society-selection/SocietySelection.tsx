import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Box,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LocationOn,
  Business,
  Search,
  Send
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SocietySelection.css';

interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  totalUnits: number;
  availableUnits: number;
}

// Mock societies data - replace with actual API call
const mockSocieties: Society[] = [
  {
    id: '1',
    name: 'Green Valley Apartments',
    address: '123 Main Street, Sector 12',
    city: 'Gurgaon',
    state: 'Haryana',
    zipcode: '122001',
    totalUnits: 150,
    availableUnits: 12
  },
  {
    id: '2',
    name: 'Sunrise Residency',
    address: '456 Park Avenue, DLF Phase 2',
    city: 'Gurgaon',
    state: 'Haryana',
    zipcode: '122002',
    totalUnits: 200,
    availableUnits: 8
  },
  {
    id: '3',
    name: 'Royal Gardens',
    address: '789 Golf Course Road',
    city: 'Gurgaon',
    state: 'Haryana',
    zipcode: '122003',
    totalUnits: 80,
    availableUnits: 5
  }
];

const SocietySelection: React.FC = () => {
  const { user, requestJoinSociety } = useAuth();
  const navigate = useNavigate();
  
  const [societies, setSocieties] = useState<Society[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  
  // Join request form data
  const [requestData, setRequestData] = useState({
    unitNumber: '',
    isOwner: false,
    message: ''
  });

  // Mock societies data - replace with actual API call
  const mockSocieties: Society[] = [
    {
      id: '1',
      name: 'Green Valley Apartments',
      address: '123 Main Street, Sector 12',
      city: 'Gurgaon',
      state: 'Haryana',
      zipcode: '122001',
      totalUnits: 150,
      availableUnits: 12
    },
    {
      id: '2',
      name: 'Sunrise Residency',
      address: '456 Park Avenue, DLF Phase 2',
      city: 'Gurgaon',
      state: 'Haryana',
      zipcode: '122002',
      totalUnits: 200,
      availableUnits: 8
    },
    {
      id: '3',
      name: 'Royal Gardens',
      address: '789 Golf Course Road',
      city: 'Gurgaon',
      state: 'Haryana',
      zipcode: '122003',
      totalUnits: 80,
      availableUnits: 5
    }
  ];

  const loadSocieties = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSocieties(mockSocieties);
    } catch (err) {
      setError('Failed to load societies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if user is already active (has joined a society)
    if (user?.userStatus === 'active') {
      navigate('/societies');
      return;
    }
    
    // Load societies
    loadSocieties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredSocieties = societies.filter(society =>
    society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestJoin = (society: Society) => {
    setSelectedSociety(society);
    setShowRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedSociety || !requestData.unitNumber.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsLoading(true);
      await requestJoinSociety(
        selectedSociety.id,
        requestData.unitNumber,
        requestData.isOwner,
        requestData.message
      );
      
      setShowRequestDialog(false);
      setError('');
      
      // Show success message and redirect
      alert('Join request sent successfully! You will be notified once the society admin reviews your request.');
      navigate('/pending-approval');
      
    } catch (err: any) {
      setError(err.message || 'Failed to send join request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowRequestDialog(false);
    setSelectedSociety(null);
    setRequestData({
      unitNumber: '',
      isOwner: false,
      message: ''
    });
  };

  return (
    <div className="society-selection-container">
      <Container maxWidth="lg">
        <Paper className="society-selection-paper">
          <div className="society-selection-header">
            <Typography variant="h4" className="society-selection-title">
              Join a Society
            </Typography>
            <Typography variant="subtitle1" className="society-selection-subtitle">
              Welcome {user?.firstName}! To get started, please request to join a society.
            </Typography>
          </div>

          {error && (
            <Alert severity="error" className="society-selection-alert">
              {error}
            </Alert>
          )}

          {/* Search */}
          <Box className="society-search-container">
            <TextField
              fullWidth
              placeholder="Search societies by name, address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="society-search-field"
              InputProps={{
                startAdornment: <Search className="society-search-icon" />,
              }}
            />
          </Box>

          {/* Societies List */}
          <div className="societies-grid">
            {filteredSocieties.map((society) => (
              <div className="society-card-container" key={society.id}>
                <Card className="society-card">
                  <CardContent>
                    <Typography variant="h6" className="society-card-title">
                      {society.name}
                    </Typography>
                    
                    <Box className="society-card-address">
                      <LocationOn className="society-card-icon" />
                      <Typography variant="body2" className="society-card-address-text">
                        {society.address}
                      </Typography>
                    </Box>
                    
                    <Box className="society-card-details">
                      <Typography variant="body2">
                        {society.city}, {society.state} - {society.zipcode}
                      </Typography>
                    </Box>
                    
                    <Box className="society-card-stats">
                      <Chip
                        icon={<Business />}
                        label={`${society.totalUnits} Units`}
                        className="society-card-chip"
                      />
                      <Chip
                        label={`${society.availableUnits} Available`}
                        className="society-card-chip available"
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions className="society-card-actions">
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={() => handleRequestJoin(society)}
                      disabled={isLoading}
                      className="society-join-button"
                    >
                      Request to Join
                    </Button>
                  </CardActions>
                </Card>
              </div>
            ))}
          </div>

          {filteredSocieties.length === 0 && !isLoading && (
            <Box className="no-societies-message">
              <Typography variant="h6" color="textSecondary">
                No societies found matching your search.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Join Request Dialog */}
      <Dialog 
        open={showRequestDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request to Join {selectedSociety?.name}</DialogTitle>
        <DialogContent>
          <Box className="join-request-form">
            <TextField
              autoFocus
              margin="dense"
              label="Unit Number"
              fullWidth
              required
              value={requestData.unitNumber}
              onChange={(e) => setRequestData(prev => ({ ...prev, unitNumber: e.target.value }))}
              placeholder="e.g., A-101, B-205"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={requestData.isOwner}
                  onChange={(e) => setRequestData(prev => ({ ...prev, isOwner: e.target.checked }))}
                />
              }
              label="I am the owner of this unit"
            />
            
            <TextField
              margin="dense"
              label="Message to Society Admin (Optional)"
              fullWidth
              multiline
              rows={3}
              value={requestData.message}
              onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Add any additional information..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRequest} 
            variant="contained"
            disabled={isLoading || !requestData.unitNumber.trim()}
          >
            {isLoading ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SocietySelection;
