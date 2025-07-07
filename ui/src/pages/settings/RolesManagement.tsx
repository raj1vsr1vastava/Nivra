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

// Import types from service files
import { RoleData } from '../../services/settings/roleService';
import { PermissionData } from '../../services/settings/permissionService';

// Extended interfaces for component use
interface Role extends RoleData {
  created_at?: string;
  updated_at?: string;
  permissions?: string[];
}

interface GroupedPermissions {
  [resourceType: string]: PermissionData[];
}

const RolesManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role>({
    name: '',
    description: '',
    permissions: []
  });
  
  // Fetch roles and permissions
  const fetchRoles = async (): Promise<void> => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async (): Promise<void> => {
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

  const handleOpenDialog = async (role: Role | null = null): Promise<void> => {
    if (role) {
      // Edit mode - fetch role permissions
      try {
        const rolePermissions = await roleService.getRolePermissions(role.id as string);
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

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setCurrentRole({ ...currentRole, [name]: value });
  };

  const handlePermissionChange = (permissionId: string): void => {
    const currentPermissions = currentRole.permissions || [];
    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];
    
    setCurrentRole({ ...currentRole, permissions: updatedPermissions });
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (isEditMode && currentRole.id) {
        // Update existing role
        const { permissions, ...roleData } = currentRole;
        await roleService.updateRole(currentRole.id, roleData);
        
        // Update role permissions
        if (permissions) {
          await roleService.updateRolePermissions(currentRole.id, permissions);
        }
      } else {
        // Create new role
        const { permissions, ...roleData } = currentRole;
        const newRole = await roleService.createRole(roleData);
        
        // Add permissions to the new role
        if (permissions && permissions.length > 0) {
          await roleService.updateRolePermissions(newRole.id as string, permissions);
        }
      }
      fetchRoles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string): Promise<void> => {
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
  const groupedPermissions: GroupedPermissions = permissions.reduce((groups, permission) => {
    const resourceType = permission.resource_type || 'other';
    if (!groups[resourceType]) {
      groups[resourceType] = [];
    }
    groups[resourceType].push(permission);
    return groups;
  }, {} as GroupedPermissions);

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
                <TableCell>{role.created_at ? new Date(role.created_at).toLocaleString() : ''}</TableCell>
                <TableCell>{role.updated_at ? new Date(role.updated_at).toLocaleString() : ''}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleOpenDialog(role)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => role.id && handleDeleteRole(role.id)}>
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
              value={currentRole.description || ''}
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
                  {perms.map((permission) => permission.id && (
                    <Chip
                      key={permission.id}
                      label={permission.name}
                      onClick={() => permission.id && handlePermissionChange(permission.id)}
                      color={permission.id && currentRole.permissions?.includes(permission.id) ? "primary" : "default"}
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
