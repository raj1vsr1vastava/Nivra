import apiClient from '../apiClient';

// Finance services
const financeService = {
  // Get all finances with optional filters
  getAllFinances: async (filters = {}) => {
    const { resident_id, payment_status, transaction_type, due_date_start, due_date_end, skip, limit } = filters;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (resident_id) params.append('resident_id', resident_id);
    if (payment_status) params.append('payment_status', payment_status);
    if (transaction_type) params.append('transaction_type', transaction_type);
    if (due_date_start) params.append('due_date_start', due_date_start);
    if (due_date_end) params.append('due_date_end', due_date_end);
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);
    
    const queryString = params.toString();
    const url = `/finances/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get finance by ID
  getFinanceById: async (financeId) => {
    const response = await apiClient.get(`/finances/${financeId}`);
    return response.data;
  },

  // Create new finance entry
  createFinance: async (financeData) => {
    const response = await apiClient.post('/finances/', financeData);
    return response.data;
  },

  // Update finance entry
  updateFinance: async (financeId, financeData) => {
    const response = await apiClient.put(`/finances/${financeId}`, financeData);
    return response.data;
  },

  // Delete finance entry
  deleteFinance: async (financeId) => {
    const response = await apiClient.delete(`/finances/${financeId}`);
    return response.data;
  },

  // Get finances for a specific resident
  getResidentFinances: async (residentId, filters = {}) => {
    const { payment_status, skip, limit } = filters;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (payment_status) params.append('payment_status', payment_status);
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);
    
    const queryString = params.toString();
    const url = `/residents/${residentId}/finances/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  }
};

export default financeService;
