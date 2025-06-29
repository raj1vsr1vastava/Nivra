import apiClient from '../apiClient';

// Society admin services
const societyAdminService = {
  // Get all society admins
  getAllSocietyAdmins: async () => {
    const response = await apiClient.get('/society-admins/');
    return response.data;
  },

  // Get society admin by ID
  getSocietyAdminById: async (adminId) => {
    const response = await apiClient.get(`/society-admins/${adminId}`);
    return response.data;
  },

  // Create new society admin
  createSocietyAdmin: async (adminData) => {
    const response = await apiClient.post('/society-admins/', adminData);
    return response.data;
  },

  // Update society admin
  updateSocietyAdmin: async (adminId, adminData) => {
    const response = await apiClient.put(`/society-admins/${adminId}`, adminData);
    return response.data;
  },

  // Delete society admin
  deleteSocietyAdmin: async (adminId) => {
    const response = await apiClient.delete(`/society-admins/${adminId}`);
    return response.data;
  }
};

export default societyAdminService;
