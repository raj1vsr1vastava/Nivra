import apiClient from '../apiClient';

// Permission services
const permissionService = {
  // Get all permissions
  getAllPermissions: async () => {
    const response = await apiClient.get('/permissions/');
    return response.data;
  },

  // Get permission by ID
  getPermissionById: async (permissionId) => {
    const response = await apiClient.get(`/permissions/${permissionId}`);
    return response.data;
  },

  // Create new permission
  createPermission: async (permissionData) => {
    const response = await apiClient.post('/permissions/', permissionData);
    return response.data;
  },

  // Update permission
  updatePermission: async (permissionId, permissionData) => {
    const response = await apiClient.put(`/permissions/${permissionId}`, permissionData);
    return response.data;
  },

  // Delete permission
  deletePermission: async (permissionId) => {
    const response = await apiClient.delete(`/permissions/${permissionId}`);
    return response.data;
  }
};

export default permissionService;
