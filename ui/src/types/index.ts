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
  name: string;
  unit?: string | number;
  contact?: string;
  // Add other resident properties as needed
}

export interface FinanceData {
  id: string | number;
  title: string;
  amount: number;
  date: string | Date;
  category?: string;
  type: 'income' | 'expense';
  // Add other finance properties as needed
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
