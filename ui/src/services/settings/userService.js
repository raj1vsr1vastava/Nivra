import apiClient from '../apiClient';

// User services
const userService = {
  // Get all users
  getAllUsers: async () => {
    const response = await apiClient.get('/users/');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }
};

export default userService;
