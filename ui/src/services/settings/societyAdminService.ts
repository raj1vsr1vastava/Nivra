import apiClient from '../apiClient';

// Define society admin data interface
export interface SocietyAdminData {
  id?: string;
  user_id: string;
  society_id: string;
  is_primary_admin?: boolean;
  created_at?: string;
  [key: string]: any; // For additional properties
}

// Society admin services
const societyAdminService = {
  // Get all society admins
  getAllSocietyAdmins: async (): Promise<SocietyAdminData[]> => {
    const response = await apiClient.get('/society-admins/');
    return response.data;
  },

  // Get society admin by ID
  getSocietyAdminById: async (adminId: string): Promise<SocietyAdminData> => {
    const response = await apiClient.get(`/society-admins/${adminId}`);
    return response.data;
  },

  // Create new society admin
  createSocietyAdmin: async (adminData: SocietyAdminData): Promise<SocietyAdminData> => {
    const response = await apiClient.post('/society-admins/', adminData);
    return response.data;
  },

  // Update society admin
  updateSocietyAdmin: async (adminId: string, adminData: Partial<SocietyAdminData>): Promise<SocietyAdminData> => {
    const response = await apiClient.put(`/society-admins/${adminId}`, adminData);
    return response.data;
  },

  // Delete society admin
  deleteSocietyAdmin: async (adminId: string): Promise<any> => {
    const response = await apiClient.delete(`/society-admins/${adminId}`);
    return response.data;
  }
};

export default societyAdminService;
