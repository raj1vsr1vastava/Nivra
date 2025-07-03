import apiClient from '../apiClient';

interface ResidentData {
  id: string | number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  unit_number?: string;
  society_id: string | number;
  society_name?: string;
  is_owner: boolean;
  is_committee_member: boolean;
  committee_role?: string;
  is_active: boolean;
  joined_date?: string;
  lease_end_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
}

interface ResidentFinancesSummary {
  dues: number;
  payments: number;
  balance: number;
  recentTransactions: {
    id: string | number;
    title: string;
    amount: number;
    date: string;
    type: 'payment' | 'due';
    status?: 'paid' | 'pending' | 'overdue';
  }[];
}

// Resident services
const residentService = {
  // Get all residents
  getAllResidents: async (): Promise<ResidentData[]> => {
    const response = await apiClient.get('/residents/');
    return response.data;
  },

  // Get resident by ID
  getResidentById: async (residentId: string | number): Promise<ResidentData> => {
    const response = await apiClient.get(`/residents/${residentId}`);
    return response.data;
  },

  // Get society residents
  getSocietyResidents: async (societyId: string | number): Promise<ResidentData[]> => {
    const response = await apiClient.get(`/societies/${societyId}/residents`);
    return response.data;
  },

  // Create resident
  createResident: async (residentData: Partial<ResidentData>): Promise<ResidentData> => {
    const response = await apiClient.post('/residents/', residentData);
    return response.data;
  },

  // Update resident
  updateResident: async (residentId: string | number, residentData: Partial<ResidentData>): Promise<ResidentData> => {
    const response = await apiClient.put(`/residents/${residentId}`, residentData);
    return response.data;
  },

  // Get resident finances summary
  getResidentFinancesSummary: async (residentId: string | number): Promise<ResidentFinancesSummary> => {
    const response = await apiClient.get(`/api/v1/residents/${residentId}/finance-summary`);
    return response.data;
  }
};

export default residentService;
