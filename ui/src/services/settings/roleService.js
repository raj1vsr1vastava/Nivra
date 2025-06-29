import apiClient from '../apiClient';

// Role services
const roleService = {
  // Get all roles
  getAllRoles: async () => {
    const response = await apiClient.get('/roles/');
    return response.data;
  },

  // Get role by ID
  getRoleById: async (roleId) => {
    const response = await apiClient.get(`/roles/${roleId}`);
    return response.data;
  },

  // Get role permissions
  getRolePermissions: async (roleId) => {
    const response = await apiClient.get(`/roles/${roleId}/permissions`);
    return response.data;
  },

  // Create new role
  createRole: async (roleData) => {
    const response = await apiClient.post('/roles/', roleData);
    return response.data;
  },

  // Update role
  updateRole: async (roleId, roleData) => {
    const response = await apiClient.put(`/roles/${roleId}`, roleData);
    return response.data;
  },
  
  // Update role permissions
  updateRolePermissions: async (roleId, permissionIds) => {
    const response = await apiClient.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds });
    return response.data;
  },

  // Delete role
  deleteRole: async (roleId) => {
    const response = await apiClient.delete(`/roles/${roleId}`);
    return response.data;
  }
};

export default roleService;
