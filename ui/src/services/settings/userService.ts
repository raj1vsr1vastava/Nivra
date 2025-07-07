import apiClient from '../apiClient';

// Define user data interface
export interface UserData {
  id?: string;
  username: string;
  email: string;
  full_name?: string;
  is_active?: boolean;
  role_id?: string;
  [key: string]: any; // For additional properties
}

// User services
const userService = {
  // Get all users
  getAllUsers: async (): Promise<UserData[]> => {
    const response = await apiClient.get('/users/');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserData> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: UserData): Promise<UserData> => {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<UserData>): Promise<UserData> => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<any> => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }
};

export default userService;
