import apiClient from '../apiClient';

// Define permission data interface
export interface PermissionData {
  id?: string;
  name: string;
  description?: string;
  resource_type?: string;
  action?: string;
  [key: string]: any; // For additional properties
}

// Permission services
const permissionService = {
  // Get all permissions
  getAllPermissions: async (): Promise<PermissionData[]> => {
    const response = await apiClient.get('/permissions/');
    return response.data;
  },

  // Get permission by ID
  getPermissionById: async (permissionId: string): Promise<PermissionData> => {
    const response = await apiClient.get(`/permissions/${permissionId}`);
    return response.data;
  },

  // Create new permission
  createPermission: async (permissionData: PermissionData): Promise<PermissionData> => {
    const response = await apiClient.post('/permissions/', permissionData);
    return response.data;
  },

  // Update permission
  updatePermission: async (permissionId: string, permissionData: Partial<PermissionData>): Promise<PermissionData> => {
    const response = await apiClient.put(`/permissions/${permissionId}`, permissionData);
    return response.data;
  },

  // Delete permission
  deletePermission: async (permissionId: string): Promise<any> => {
    const response = await apiClient.delete(`/permissions/${permissionId}`);
    return response.data;
  }
};

export default permissionService;
