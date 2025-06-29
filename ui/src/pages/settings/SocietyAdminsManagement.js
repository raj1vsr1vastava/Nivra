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
  Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { societyAdminService, userService, societyService } from '../../services';

const SocietyAdminsManagement = () => {
  const [societyAdmins, setSocietyAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState({
    user_id: '',
    society_id: '',
    is_primary_admin: false
  });
  
  // Fetch data
  const fetchSocietyAdmins = async () => {
    try {
      const data = await societyAdminService.getAllSocietyAdmins();
      setSocietyAdmins(data);
    } catch (error) {
      console.error('Error fetching society admins:', error);
    }
  };

  const fetchUsers = async () => {
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

  const fetchSocieties = async () => {
    try {
      const data = await societyService.getAllSocieties();
      setSocieties(data);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  useEffect(() => {
    fetchSocietyAdmins();
    fetchUsers();
    fetchSocieties();
  }, []);

  const handleOpenDialog = (admin = null) => {
    if (admin) {
      // Edit mode
      setCurrentAdmin(admin);
      setIsEditMode(true);
    } else {
      // Create mode
      setCurrentAdmin({
        user_id: '',
        society_id: '',
        is_primary_admin: false
      });
      setIsEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin({ ...currentAdmin, [name]: value });
  };

  const handleSwitchChange = (e) => {
    setCurrentAdmin({ ...currentAdmin, is_primary_admin: e.target.checked });
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        // Update existing society admin
        await societyAdminService.updateSocietyAdmin(currentAdmin.id, currentAdmin);
      } else {
        // Create new society admin
        await societyAdminService.createSocietyAdmin(currentAdmin);
      }
      fetchSocietyAdmins();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving society admin:', error);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
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
  const findUserById = (id) => users.find(user => user.id === id);
  const findSocietyById = (id) => societies.find(society => society.id === id);

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
              
              return (
                <TableRow key={admin.id}>
                  <TableCell>{user ? user.full_name : 'Unknown'}</TableCell>
                  <TableCell>{society ? society.name : 'Unknown'}</TableCell>
                  <TableCell>{admin.is_primary_admin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => handleOpenDialog(admin)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteAdmin(admin.id)}>
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
                value={currentAdmin.user_id}
                label="User"
                onChange={handleInputChange}
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required>
              <InputLabel>Society</InputLabel>
              <Select
                name="society_id"
                value={currentAdmin.society_id}
                label="Society"
                onChange={handleInputChange}
              >
                {societies.map(society => (
                  <MenuItem key={society.id} value={society.id}>
                    {society.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={currentAdmin.is_primary_admin}
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
