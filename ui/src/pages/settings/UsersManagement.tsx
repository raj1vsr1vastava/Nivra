import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
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
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { userService, roleService } from '../../services';
import './SettingsManagement.css';

// Import types from service files
import { UserData } from '../../services/settings/userService';
import { RoleData } from '../../services/settings/roleService';

// Define interfaces extending the service types
interface User extends Omit<UserData, 'full_name' | 'is_active'> {
  full_name: string; // Make full_name required
  password?: string; 
  is_active: boolean; // Make is_active required
  last_login?: string;
}

interface Role extends RoleData {}

interface FieldErrors {
  [key: string]: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [currentUser, setCurrentUser] = useState<User>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role_id: '',
    is_active: true
  });
  
  // Fetch users and roles
  const fetchUsers = async (): Promise<void> => {
    try {
      const data = await userService.getAllUsers();
      // Convert UserData[] to User[] by ensuring required fields have values
      const typedUsers = data.map(user => ({
        ...user,
        full_name: user.full_name || '',
        is_active: user.is_active ?? true
      })) as User[];
      setUsers(typedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async (): Promise<void> => {
    try {
      const data = await roleService.getAllRoles();
      // Since Role extends RoleData without adding required fields, we can cast directly
      setRoles(data as Role[]);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleOpenDialog = (user: User | null = null): void => {
    if (user) {
      // Edit mode - remove password as it's not returned from API
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword as User);
      setIsEditMode(true);
    } else {
      // Create mode
      setCurrentUser({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role_id: '',
        is_active: true
      });
      setIsEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setCurrentUser({
      username: '',
      email: '',
      full_name: '',
      password: '',
      role_id: '',
      is_active: true
    });
    setIsEditMode(false);
    setError(''); // Clear any errors when closing the dialog
    setFieldErrors({}); // Clear field-specific errors
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setError(''); // Clear previous errors
      setFieldErrors({}); // Clear field errors
      
      if (isEditMode && currentUser.id) {
        // Update existing user
        const { password, ...updateData } = currentUser;
        
        // Only include password if it was provided
        if (password) {
          updateData.password = password;
        }
        
        await userService.updateUser(currentUser.id, updateData as UserData);
      } else {
        // Create new user
        await userService.createUser(currentUser as UserData);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      // Handle structured errors
      if (error.field) {
        // Single field error
        setFieldErrors({
          [error.field]: error.message
        });
      } else if (error.fields && Array.isArray(error.fields)) {
        // Multiple field errors
        const newFieldErrors: FieldErrors = {};
        error.fields.forEach((field: string) => {
          newFieldErrors[field] = `This field is required`;
        });
        setFieldErrors(newFieldErrors);
      }
      
      // Set generic error message
      setError(error.message || 'Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="settings-management-container">
      <Container maxWidth="lg">
        <div className="settings-management-header">
          <h1>User Management</h1>
        </div>
        
        <div className="settings-management-panel">
          <div className="settings-search-bar">
            <TextField 
              className="settings-form-field"
              placeholder="Search users..." 
              variant="outlined" 
              size="small"
              InputProps={{
                startAdornment: <SearchIcon color="action" />,
              }}
            />
            <Button 
              className="settings-action-button"
              variant="contained" 
              onClick={() => handleOpenDialog()}
            >
              Add New User
            </Button>
          </div>

          <TableContainer>
            <Table className="settings-data-table">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>
                      {roles.find(role => role.id === user.role_id)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <span className={`status-${user.is_active ? "paid" : "overdue"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => user.id && handleDeleteUser(user.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* User Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogContent>
              {error && (
                <Box sx={{ mt: 1, mb: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                </Box>
              )}
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  name="username"
                  label="Username"
                  value={currentUser.username}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={Boolean(fieldErrors.username)}
                  helperText={fieldErrors.username}
                />
                <TextField
                  name="email"
                  label="Email"
                  value={currentUser.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  type="email"
                  error={Boolean(fieldErrors.email)}
                  helperText={fieldErrors.email}
                />
                <TextField
                  name="full_name"
                  label="Full Name"
                  value={currentUser.full_name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={Boolean(fieldErrors.full_name)}
                  helperText={fieldErrors.full_name}
                />
                <TextField
                  name="password"
                  label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
                  value={currentUser.password || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required={!isEditMode}
                  type="password"
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password}
                />
                <FormControl fullWidth error={Boolean(fieldErrors.role_id)}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role_id"
                    value={currentUser.role_id}
                    label="Role"
                    onChange={handleInputChange}
                    required
                  >
                    {roles.map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.role_id && (
                    <Box component="span" sx={{ color: 'error.main', mt: 0.5, fontSize: '0.75rem', ml: 1.5 }}>
                      {fieldErrors.role_id}
                    </Box>
                  )}
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="is_active"
                    value={currentUser.is_active ? 'true' : 'false'} // Convert to string to avoid MUI type error
                    label="Status"
                    onChange={(e) => {
                      setCurrentUser({
                        ...currentUser,
                        is_active: e.target.value === 'true'
                      });
                    }}
                  >
                    <MenuItem value={'true'}>Active</MenuItem>
                    <MenuItem value={'false'}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseDialog}
                className="settings-action-button"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                className="settings-action-button"
              >
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Container>
    </div>
  );
};

export default UsersManagement;
