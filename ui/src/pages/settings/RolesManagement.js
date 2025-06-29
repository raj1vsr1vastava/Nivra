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
  Stack,
  Box,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { roleService, permissionService } from '../../services';

const RolesManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState({
    name: '',
    description: '',
    permissions: []
  });
  
  // Fetch roles and permissions
  const fetchRoles = async () => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleOpenDialog = async (role = null) => {
    if (role) {
      // Edit mode - fetch role permissions
      try {
        const rolePermissions = await roleService.getRolePermissions(role.id);
        const rolePermissionIds = rolePermissions.map(p => p.id);
        setCurrentRole({
          ...role,
          permissions: rolePermissionIds
        });
        setIsEditMode(true);
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        setCurrentRole(role);
        setIsEditMode(true);
      }
    } else {
      // Create mode
      setCurrentRole({
        name: '',
        description: '',
        permissions: []
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
    setCurrentRole({ ...currentRole, [name]: value });
  };

  const handlePermissionChange = (permissionId) => {
    const updatedPermissions = currentRole.permissions.includes(permissionId)
      ? currentRole.permissions.filter(id => id !== permissionId)
      : [...currentRole.permissions, permissionId];
    
    setCurrentRole({ ...currentRole, permissions: updatedPermissions });
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        // Update existing role
        const { permissions, ...roleData } = currentRole;
        await roleService.updateRole(currentRole.id, roleData);
        
        // Update role permissions
        await roleService.updateRolePermissions(currentRole.id, currentRole.permissions);
      } else {
        // Create new role
        const { permissions, ...roleData } = currentRole;
        const newRole = await roleService.createRole(roleData);
        
        // Add permissions to the new role
        if (currentRole.permissions.length > 0) {
          await roleService.updateRolePermissions(newRole.id, currentRole.permissions);
        }
      }
      fetchRoles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.deleteRole(roleId);
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  // Group permissions by resource_type
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const resourceType = permission.resource_type;
    if (!groups[resourceType]) {
      groups[resourceType] = [];
    }
    groups[resourceType].push(permission);
    return groups;
  }, {});

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Role Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
        >
          Add New Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{new Date(role.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(role.updated_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleOpenDialog(role)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteRole(role.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Role' : 'Add New Role'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              name="name"
              label="Role Name"
              value={currentRole.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="description"
              label="Description"
              value={currentRole.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
            
            <Typography variant="h6">Permissions</Typography>
            
            {Object.entries(groupedPermissions).map(([resourceType, perms]) => (
              <Box key={resourceType} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', mb: 1 }}>
                  {resourceType}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {perms.map((permission) => (
                    <Chip
                      key={permission.id}
                      label={permission.name}
                      onClick={() => handlePermissionChange(permission.id)}
                      color={currentRole.permissions.includes(permission.id) ? "primary" : "default"}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
                <Divider sx={{ my: 1 }} />
              </Box>
            ))}
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

export default RolesManagement;
