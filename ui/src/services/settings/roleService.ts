import apiClient from '../apiClient';

// Define role data interface
export interface RoleData {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
  [key: string]: any; // For additional properties
}

// Define permission data interface
export interface PermissionData {
  id: string;
  name: string;
  description?: string;
}

// Role services
const roleService = {
  // Get all roles
  getAllRoles: async (): Promise<RoleData[]> => {
    const response = await apiClient.get('/roles/');
    return response.data;
  },

  // Get role by ID
  getRoleById: async (roleId: string): Promise<RoleData> => {
    const response = await apiClient.get(`/roles/${roleId}`);
    return response.data;
  },

  // Get role permissions
  getRolePermissions: async (roleId: string): Promise<PermissionData[]> => {
    const response = await apiClient.get(`/roles/${roleId}/permissions`);
    return response.data;
  },

  // Create new role
  createRole: async (roleData: RoleData): Promise<RoleData> => {
    const response = await apiClient.post('/roles/', roleData);
    return response.data;
  },

  // Update role
  updateRole: async (roleId: string, roleData: Partial<RoleData>): Promise<RoleData> => {
    const response = await apiClient.put(`/roles/${roleId}`, roleData);
    return response.data;
  },
  
  // Update role permissions
  updateRolePermissions: async (roleId: string, permissionIds: string[]): Promise<any> => {
    const response = await apiClient.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds });
    return response.data;
  },

  // Delete role
  deleteRole: async (roleId: string): Promise<any> => {
    const response = await apiClient.delete(`/roles/${roleId}`);
    return response.data;
  }
};

export default roleService;
