import apiClient from '../apiClient';

// Society services
const societyService = {
  // Get all societies
  getAllSocieties: async () => {
    const response = await apiClient.get('/societies/');
    return response.data;
  },

  // Get society by ID
  getSocietyById: async (societyId) => {
    const response = await apiClient.get(`/societies/${societyId}`);
    return response.data;
  },

  // Create new society
  createSociety: async (societyData) => {
    const response = await apiClient.post('/societies/', societyData);
    return response.data;
  },

  // Update society
  updateSociety: async (societyId, societyData) => {
    const response = await apiClient.put(`/societies/${societyId}`, societyData);
    return response.data;
  },

  // Delete society
  deleteSociety: async (societyId) => {
    const response = await apiClient.delete(`/societies/${societyId}`);
    return response.data;
  },
  
  // Get society finances summary
  getSocietyFinancesSummary: async (societyId) => {
    const response = await apiClient.get(`/societies/${societyId}/finances/summary`);
    return response.data;
  }
};

export default societyService;
