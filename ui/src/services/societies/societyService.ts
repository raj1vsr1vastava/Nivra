import apiClient from '../apiClient';
import { SocietyData } from '../../types';

interface SocietyFinancesSummary {
  income: number;
  expenses: number;
  balance: number;
  recentTransactions: {
    id: string | number;
    title: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
  }[];
  // Add other finance summary properties as needed
}

// Society services
const societyService = {
  // Get all societies
  getAllSocieties: async (): Promise<SocietyData[]> => {
    const response = await apiClient.get('/societies/');
    return response.data;
  },

  // Get society by ID
  getSocietyById: async (societyId: string | number): Promise<SocietyData> => {
    const response = await apiClient.get(`/societies/${societyId}`);
    return response.data;
  },

  // Create new society
  createSociety: async (societyData: Partial<SocietyData> & { 
    city: string;
    state: string;
    zipcode: string;
    country: string;
    contact_email?: string;
    contact_phone?: string; 
    total_units: number;
    registration_number?: string;
  }): Promise<SocietyData> => {
    try {
      // Transform data to match backend expectations
      // IMPORTANT: The backend schema uses total_units but the API might expect units field
      const payload = {
        name: societyData.name,
        address: societyData.address,
        city: societyData.city,
        state: societyData.state,
        zipcode: societyData.zipcode,
        country: societyData.country,
        // Send both field names to ensure compatibility
        total_units: societyData.total_units,
        units: societyData.total_units, // Duplicate field for API compatibility
        ...(societyData.contact_email ? { contact_email: societyData.contact_email } : {}),
        ...(societyData.contact_phone ? { contact_phone: societyData.contact_phone } : {}),
        ...(societyData.registration_number ? { registration_number: societyData.registration_number } : {})
      };
      
      console.log('Sending society data to API:', JSON.stringify(payload, null, 2));
      const response = await apiClient.post('/societies/', payload);
      return response.data;
    } catch (error: any) {
      console.error('Society creation failed with error:', error);
      // Rethrow with more context
      if (error.status === 422) {
        const enhancedError = new Error(`Validation error: ${error.message || 'Please check all required fields'}`);
        // Add custom properties to the error
        Object.assign(enhancedError, {
          ...error,
          message: `Validation error: ${error.message || 'Please check all required fields'}`,
          field: error.field || (error.fields ? Object.keys(error.fields)[0] : null)
        });
        throw enhancedError;
      }
      throw error;
    }
  },

  // Update society
  updateSociety: async (societyId: string | number, societyData: Partial<SocietyData>): Promise<SocietyData> => {
    const response = await apiClient.put(`/societies/${societyId}`, societyData);
    return response.data;
  },

  // Delete society
  deleteSociety: async (societyId: string | number): Promise<void> => {
    const response = await apiClient.delete(`/societies/${societyId}`);
    return response.data;
  },
  
  // Get society finances summary
  getSocietyFinancesSummary: async (societyId: string | number): Promise<SocietyFinancesSummary> => {
    const response = await apiClient.get(`/societies/${societyId}/finances/summary`);
    return response.data;
  }
};

export default societyService;
