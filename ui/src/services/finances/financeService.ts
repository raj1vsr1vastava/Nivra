import apiClient from '../apiClient';
import { FinanceData as AppFinanceData } from '../../types';

// Define finance filter interface
export interface FinanceFilters {
  resident_id?: string;
  payment_status?: string;
  transaction_type?: string;
  due_date_start?: string;
  due_date_end?: string;
  skip?: number;
  limit?: number;
}

// Define resident finance filter interface
export interface ResidentFinanceFilters {
  payment_status?: string;
  skip?: number;
  limit?: number;
}

// Define finance data interface for service operations
export interface FinanceData {
  id?: string;
  resident_id?: string;
  amount: number;
  currency?: string;
  description?: string;
  transaction_type: string;
  payment_status: string;
  due_date: string;
  payment_date?: string | null;
  invoice_number?: string;
  receipt_number?: string;
  [key: string]: any; // For additional properties
}

// Finance services
const financeService = {
  // Get all finances with optional filters
  getAllFinances: async (filters: FinanceFilters = {}): Promise<FinanceData[]> => {
    const { resident_id, payment_status, transaction_type, due_date_start, due_date_end, skip, limit } = filters;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (resident_id) params.append('resident_id', resident_id);
    if (payment_status) params.append('payment_status', payment_status);
    if (transaction_type) params.append('transaction_type', transaction_type);
    if (due_date_start) params.append('due_date_start', due_date_start);
    if (due_date_end) params.append('due_date_end', due_date_end);
    if (skip !== undefined) params.append('skip', skip.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `/finances/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get finance by ID
  getFinanceById: async (financeId: string): Promise<FinanceData> => {
    const response = await apiClient.get(`/finances/${financeId}`);
    return response.data;
  },

  // Create new finance entry
  createFinance: async (financeData: FinanceData): Promise<FinanceData> => {
    const response = await apiClient.post('/finances/', financeData);
    return response.data;
  },

  // Update finance entry
  updateFinance: async (financeId: string, financeData: Partial<FinanceData>): Promise<FinanceData> => {
    const response = await apiClient.put(`/finances/${financeId}`, financeData);
    return response.data;
  },

  // Delete finance entry
  deleteFinance: async (financeId: string): Promise<any> => {
    const response = await apiClient.delete(`/finances/${financeId}`);
    return response.data;
  },

  // Get finances for a specific resident
  getResidentFinances: async (residentId: string, filters: ResidentFinanceFilters = {}): Promise<FinanceData[]> => {
    const { payment_status, skip, limit } = filters;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (payment_status) params.append('payment_status', payment_status);
    if (skip !== undefined) params.append('skip', skip.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `/residents/${residentId}/finances/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  }
};

export default financeService;
