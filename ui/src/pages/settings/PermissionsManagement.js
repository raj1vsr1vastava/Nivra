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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { permissionService } from '../../services';

const PermissionsManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPermission, setCurrentPermission] = useState({
    name: '',
    description: '',
    resource_type: '',
    action: ''
  });
  
  // Resource types and actions
  const resourceTypes = ['all', 'societies', 'residents', 'users', 'roles', 'finances', 'notices', 'payments', 'public'];
  const actions = ['read', 'write', 'create', 'update', 'delete', 'manage'];
  
  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleOpenDialog = (permission = null) => {
    if (permission) {
      // Edit mode
      setCurrentPermission(permission);
      setIsEditMode(true);
    } else {
      // Create mode
      setCurrentPermission({
        name: '',
        description: '',
        resource_type: '',
        action: ''
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
    setCurrentPermission({ ...currentPermission, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        // Update existing permission
        await permissionService.updatePermission(currentPermission.id, currentPermission);
      } else {
        // Create new permission
        await permissionService.createPermission(currentPermission);
      }
      fetchPermissions();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (window.confirm('Are you sure you want to delete this permission? This may affect existing roles.')) {
      try {
        await permissionService.deletePermission(permissionId);
        fetchPermissions();
      } catch (error) {
        console.error('Error deleting permission:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Permission Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
        >
          Add New Permission
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Resource Type</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.name}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>{permission.resource_type}</TableCell>
                <TableCell>{permission.action}</TableCell>
                <TableCell>{new Date(permission.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleOpenDialog(permission)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeletePermission(permission.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Permission Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Permission' : 'Add New Permission'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              name="name"
              label="Permission Name"
              value={currentPermission.name}
              onChange={handleInputChange}
              fullWidth
              required
              helperText="e.g., society_read, resident_manage"
            />
            <TextField
              name="description"
              label="Description"
              value={currentPermission.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              helperText="Brief description of what this permission allows"
            />
            <FormControl fullWidth required>
              <InputLabel>Resource Type</InputLabel>
              <Select
                name="resource_type"
                value={currentPermission.resource_type}
                label="Resource Type"
                onChange={handleInputChange}
              >
                {resourceTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Action</InputLabel>
              <Select
                name="action"
                value={currentPermission.action}
                label="Action"
                onChange={handleInputChange}
              >
                {actions.map(action => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default PermissionsManagement;
