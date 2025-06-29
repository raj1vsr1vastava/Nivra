import apiClient from '../apiClient';

// Resident services
const residentService = {
  // Get all residents
  getAllResidents: async () => {
    const response = await apiClient.get('/residents/');
    return response.data;
  },

  // Get resident by ID
  getResidentById: async (residentId) => {
    const response = await apiClient.get(`/residents/${residentId}`);
    return response.data;
  },

  // Get society residents
  getSocietyResidents: async (societyId) => {
    const response = await apiClient.get(`/societies/${societyId}/residents`);
    return response.data;
  },

  // Create resident
  createResident: async (residentData) => {
    const response = await apiClient.post('/residents/', residentData);
    return response.data;
  },

  // Update resident
  updateResident: async (residentId, residentData) => {
    const response = await apiClient.put(`/residents/${residentId}`, residentData);
    return response.data;
  }
};

export default residentService;
