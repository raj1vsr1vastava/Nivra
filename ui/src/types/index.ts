import { ReactNode, ReactElement } from 'react';
import { SxProps, Theme } from '@mui/material/styles';

export interface CardField {
  label?: string;
  value: string | number | ReactNode;
  icon?: ReactElement;
  iconColor?: string;
  fontWeight?: number;
  gridColumn?: number;
}

export interface ChipData {
  label: string;
  variant?: 'outlined' | 'filled';
  color?: string;
  fontWeight?: number;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export interface ActionData {
  label: string;
  onClick?: (data?: any) => void;
  variant?: 'text' | 'outlined' | 'contained';
  icon?: ReactElement;
  endIcon?: ReactElement;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export interface CardProps {
  data?: any;
  title: string;
  subtitle?: string;
  fields?: CardField[];
  chips?: ChipData[];
  actions?: ActionData[];
  borderColor?: string;
  hoverBorderColor?: string;
  image?: string | null;
  animate?: boolean;
  index?: number;
}

// Add more types as needed for your application
export interface SocietyData {
  id: string | number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  units?: number;
  total_units?: number;
  residents?: number;
  contact_email?: string;
  contact_phone?: string;
  registration_number?: string;
  registration_date?: string;
  status?: 'active' | 'inactive' | 'pending';
  // Add other society properties as needed
}

export interface ResidentData {
  id: string | number;
  name?: string;
  first_name: string;
  last_name: string;
  unit?: string | number;
  unit_number?: string;
  contact?: string;
  email?: string;
  phone?: string;
  society_id: string | number;
  society?: {
    id: string | number;
    name: string;
    city: string;
    state: string;
  };
  is_owner: boolean;
  is_committee_member: boolean;
  is_active: boolean;
  committee_role?: string;
  move_in_date?: string;
  move_out_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
}

export interface FinanceData {
  id: string | number;
  resident_id: string | number;
  amount: number;
  currency: string;
  payment_status: 'paid' | 'pending' | 'overdue' | 'partial';
  transaction_type: 'maintenance' | 'utility' | 'parking' | 'special_charge' | 'late_fee' | 'security_deposit';
  description?: string;
  invoice_number?: string;
  receipt_number?: string;
  due_date?: string;
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
  title?: string;
  date?: string | Date;
  category?: string;
  type?: 'income' | 'expense';
  // Add other finance properties as needed
}

// Finance-related interfaces for ResidentFinancesList
export interface FinanceRecord {
  id: string | number;
  resident_id: string | number;
  amount: number;
  currency: string;
  payment_status: 'paid' | 'pending' | 'overdue' | 'partial';
  transaction_type: 'maintenance' | 'utility' | 'parking' | 'special_charge' | 'late_fee' | 'security_deposit';
  description?: string;
  invoice_number?: string;
  receipt_number?: string;
  due_date?: string;
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinanceSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface StatusColorMap {
  [key: string]: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export interface UserData {
  id: string | number;
  name: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

export interface RoleData {
  id: string | number;
  name: string;
  permissions: string[];
  // Add other role properties as needed
}

export interface PermissionData {
  id: string | number;
  name: string;
  description: string;
  // Add other permission properties as needed
}

export interface SelectOption {
  value: string;
  label: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';
export type TransactionType = 'maintenance' | 'utility' | 'parking' | 'special_charge' | 'late_fee' | 'security_deposit';
