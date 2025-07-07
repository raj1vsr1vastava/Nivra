import apiClient from '../apiClient';

// Define types for the filters
interface SocietyFinanceFilters {
  society_id?: string;
  expense_type?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  payment_status?: string;
  skip?: number;
  limit?: number;
  is_active?: boolean;
}

// Define types for finance data
interface FinanceData {
  id?: string;
  society_id: string;
  expense_type: string;
  category: string;
  vendor_name?: string;
  expense_date: string;
  amount: number;
  currency: string;
  payment_status: string;
  payment_date?: string | null;
  payment_method?: string;
  invoice_number?: string;
  receipt_number?: string;
  description?: string;
  recurring: boolean;
  recurring_frequency?: string;
  next_due_date?: string | null;
  [key: string]: any; // For additional properties
}

interface SummaryFilters {
  start_date?: string;
  end_date?: string;
  expense_type?: string;
}

interface FinanceSummary {
  total: {
    amount: number;
    count: number;
  };
  categories?: {
    [key: string]: {
      amount: number;
      count: number;
    };
  };
}

// Society Finance services
const societyFinanceService = {
  // Get all society finances
  getAllSocietyFinances: async (filters: SocietyFinanceFilters = {}): Promise<FinanceData[]> => {
    const params = new URLSearchParams();
    
    // Add filters to params if provided
    if (filters.society_id) params.append('society_id', filters.society_id);
    if (filters.expense_type) params.append('expense_type', filters.expense_type);
    if (filters.category) params.append('category', filters.category);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    
    const response = await apiClient.get(`/society_finances/?${params.toString()}`);
    return response.data;
  },

  // Get society finance by ID
  getSocietyFinanceById: async (financeId: string): Promise<FinanceData> => {
    const response = await apiClient.get(`/society_finances/${financeId}`);
    return response.data;
  },

  // Get society finances for a specific society
  getSocietyFinancesBySocietyId: async (societyId: string, filters: SocietyFinanceFilters = {}): Promise<FinanceData[]> => {
    const params = new URLSearchParams();
    
    // Add filters to params if provided
    if (filters.expense_type) params.append('expense_type', filters.expense_type);
    if (filters.category) params.append('category', filters.category);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    
    const response = await apiClient.get(`/societies/${societyId}/finances?${params.toString()}`);
    return response.data;
  },

  // Create society finance
  createSocietyFinance: async (financeData: FinanceData): Promise<FinanceData> => {
    const response = await apiClient.post('/society_finances/', financeData);
    return response.data;
  },

  // Update society finance
  updateSocietyFinance: async (financeId: string, financeData: Partial<FinanceData>): Promise<FinanceData> => {
    const response = await apiClient.put(`/society_finances/${financeId}`, financeData);
    return response.data;
  },

  // Delete society finance
  deleteSocietyFinance: async (financeId: string): Promise<boolean> => {
    const response = await apiClient.delete(`/society_finances/${financeId}`);
    return response.status === 204;
  },

  // Get unique finance categories for a society
  getFinanceCategories: async (societyId: string): Promise<string[]> => {
    const response = await apiClient.get(`/societies/${societyId}/finance-categories`);
    return response.data;
  },

  // Get finance summary by category
  getFinanceSummary: async (societyId: string, filters: SummaryFilters = {}): Promise<FinanceSummary> => {
    const params = new URLSearchParams();
    
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.expense_type) params.append('expense_type', filters.expense_type);
    
    const response = await apiClient.get(`/societies/${societyId}/finance-summary?${params.toString()}`);
    return response.data;
  }
};

export default societyFinanceService;
