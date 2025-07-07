import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
  IconButton,
  FormControlLabel,
  Switch,
  SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { societyAdminService, userService, societyService } from '../../services';
import { SocietyAdminData } from '../../services/settings/societyAdminService';
import { UserData } from '../../services/settings/userService';
import { useAuth } from '../../contexts/AuthContext';
import { SocietyData } from '../../types';

interface Society extends SocietyData {}

const SocietyAdminsManagement: React.FC = () => {
  const { user } = useAuth();
  const [societyAdmins, setSocietyAdmins] = useState<SocietyAdminData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<SocietyAdminData>({
    user_id: '',
    society_id: '',
    is_primary_admin: false
  });
  
  // Fetch data
  const fetchSocietyAdmins = async (): Promise<void> => {
    try {
      const data = await societyAdminService.getAllSocietyAdmins();
      setSocietyAdmins(data);
    } catch (error) {
      console.error('Error fetching society admins:', error);
    }
  };

  const fetchUsers = async (): Promise<void> => {
    try {
      // Fetch users with society_admin role or system_admin role
      const data = await userService.getAllUsers();
      // Filter for active users only
      const adminUsers = data.filter(user => {
        // You might need to adjust this based on how roles are identified
        return user.is_active; // For now, just get active users
      });
      setUsers(adminUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSocieties = async (): Promise<void> => {
    try {
      // Always fetch all societies for the dropdown and lookup, regardless of user role
      // This ensures society names are correctly displayed even for admins created by system admins
      const data = await societyService.getAllSocieties();
      setSocieties(data);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  // Get societies available for selection in the dropdown (filtered for society admins)
  const getAvailableSocieties = (): Society[] => {
    if (user?.role === 'society_admin' && user.id) {
      // For society admins, only show societies they administer in the dropdown
      // We'll need to fetch this separately or filter from the existing data
      // For now, return all societies - this may need refinement based on backend support
      return societies;
    }
    return societies;
  };

  useEffect(() => {
    fetchSocietyAdmins();
    fetchUsers();
    fetchSocieties();
  }, [user]);

  const handleOpenDialog = (admin: SocietyAdminData | null = null): void => {
    if (admin) {
      // Edit mode - ensure all values are properly set
      console.log('Editing admin:', admin);
      setCurrentAdmin({
        ...admin,
        user_id: admin.user_id || '',
        society_id: admin.society_id || '',
        is_primary_admin: admin.is_primary_admin || false
      });
      setIsEditMode(true);
    } else {
      // Create mode
      console.log('Creating new admin');
      setCurrentAdmin({
        user_id: '',
        society_id: '',
        is_primary_admin: false
      });
      setIsEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    // Reset the form state
    setCurrentAdmin({
      user_id: '',
      society_id: '',
      is_primary_admin: false
    });
    setIsEditMode(false);
  };

  const handleInputChange = (e: SelectChangeEvent<string>): void => {
    const { name, value } = e.target;
    console.log('Input changed:', name, '=', value);
    setCurrentAdmin(prev => {
      const updated = { ...prev, [name as string]: value };
      console.log('Updated admin state:', updated);
      return updated;
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentAdmin(prev => ({ ...prev, is_primary_admin: e.target.checked }));
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (isEditMode && currentAdmin.id) {
        // Update existing society admin
        const updatedAdmin = await societyAdminService.updateSocietyAdmin(currentAdmin.id, currentAdmin);
        console.log('Updated admin:', updatedAdmin);
      } else {
        // Create new society admin
        const newAdmin = await societyAdminService.createSocietyAdmin(currentAdmin);
        console.log('Created admin:', newAdmin);
      }
      
      // Close dialog first
      handleCloseDialog();
      
      // Then refresh the data
      await fetchSocietyAdmins();
    } catch (error) {
      console.error('Error saving society admin:', error);
      // Keep dialog open on error so user can retry
    }
  };

  const handleDeleteAdmin = async (adminId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to remove this admin from the society?')) {
      try {
        await societyAdminService.deleteSocietyAdmin(adminId);
        fetchSocietyAdmins();
      } catch (error) {
        console.error('Error deleting society admin:', error);
      }
    }
  };

  // Helper function to find entity by ID
  const findUserById = (id: string): UserData | undefined => users.find(user => user.id === id);
  const findSocietyById = (id: string | number): Society | undefined => societies.find(society => society.id === id);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Society Administrators
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
        >
          Add Society Admin
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Society</TableCell>
              <TableCell>Primary Admin</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {societyAdmins.map((admin) => {
              const user = findUserById(admin.user_id);
              const society = findSocietyById(admin.society_id);
              
              // Check if this is a super user (system admin) - they might have no society_id or special society_id
              const userRole = user?.role || '';
              const societyDisplay = userRole === 'system_admin' ? 'All' : (society ? society.name : 'Unknown');
              
              return (
                <TableRow key={admin.id}>
                  <TableCell>{user ? user.full_name : 'Unknown'}</TableCell>
                  <TableCell>{societyDisplay}</TableCell>
                  <TableCell>{admin.is_primary_admin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{admin.created_at ? new Date(admin.created_at).toLocaleString() : ''}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => handleOpenDialog(admin)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => admin.id && handleDeleteAdmin(admin.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Society Admin Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit Society Administrator' : 'Add Society Administrator'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>User</InputLabel>
              <Select
                name="user_id"
                value={currentAdmin.user_id || ''}
                label="User"
                onChange={handleInputChange}
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id as string}>
                    {user.full_name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required>
              <InputLabel>Society</InputLabel>
              <Select
                name="society_id"
                value={currentAdmin.society_id || ''}
                label="Society"
                onChange={handleInputChange}
              >
                {getAvailableSocieties().map(society => (
                  <MenuItem key={society.id} value={society.id.toString()}>
                    {society.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={currentAdmin.is_primary_admin || false}
                  onChange={handleSwitchChange}
                  name="is_primary_admin"
                />
              }
              label="Primary Administrator"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SocietyAdminsManagement;
