import apiClient from '../apiClient';

// Society Finance services
const societyFinanceService = {
  // Get all society finances
  getAllSocietyFinances: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to params if provided
    if (filters.society_id) params.append('society_id', filters.society_id);
    if (filters.expense_type) params.append('expense_type', filters.expense_type);
    if (filters.category) params.append('category', filters.category);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    
    const response = await apiClient.get(`/society_finances/?${params.toString()}`);
    return response.data;
  },

  // Get society finance by ID
  getSocietyFinanceById: async (financeId) => {
    const response = await apiClient.get(`/society_finances/${financeId}`);
    return response.data;
  },

  // Get society finances for a specific society
  getSocietyFinancesBySocietyId: async (societyId, filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to params if provided
    if (filters.expense_type) params.append('expense_type', filters.expense_type);
    if (filters.category) params.append('category', filters.category);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    
    const response = await apiClient.get(`/societies/${societyId}/finances?${params.toString()}`);
    return response.data;
  },

  // Create society finance
  createSocietyFinance: async (financeData) => {
    const response = await apiClient.post('/society_finances/', financeData);
    return response.data;
  },

  // Update society finance
  updateSocietyFinance: async (financeId, financeData) => {
    const response = await apiClient.put(`/society_finances/${financeId}`, financeData);
    return response.data;
  },

  // Delete society finance
  deleteSocietyFinance: async (financeId) => {
    const response = await apiClient.delete(`/society_finances/${financeId}`);
    return response.status === 204;
  },

  // Get unique finance categories for a society
  getFinanceCategories: async (societyId) => {
    const response = await apiClient.get(`/societies/${societyId}/finance-categories`);
    return response.data;
  },

  // Get finance summary by category
  getFinanceSummary: async (societyId, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.expense_type) params.append('expense_type', filters.expense_type);
    
    const response = await apiClient.get(`/societies/${societyId}/finance-summary?${params.toString()}`);
    return response.data;
  }
};

export default societyFinanceService;
