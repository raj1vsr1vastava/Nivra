import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../utils/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userStatus: 'pending_society' | 'active' | 'inactive';
  avatar?: string | null;
  societyId?: string | null; // Current society if joined
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  requestJoinSociety: (societyId: string, unitNumber: string, isOwner: boolean, message?: string) => Promise<void>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    const checkAuthStatus = () => {
      try {
        const userData = localStorage.getItem('nivra_user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('nivra_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Make API call to backend
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Using email as username for now
          password: password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store token for future requests
      localStorage.setItem('nivra_token', data.access_token);
      
      // Map API response to our User interface
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        userStatus: data.user.userStatus,
        avatar: data.user.avatar,
        societyId: data.user.societyId
      };
      
      setUser(user);
      localStorage.setItem('nivra_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Make API call to backend
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.email, // Using email as username for now
          email: userData.email,
          full_name: `${userData.firstName} ${userData.lastName}`,
          password: userData.password,
          phone: userData.phone
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // Map API response to our User interface
      const user: User = {
        id: data.id,
        email: data.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'Resident', // New users are residents by default
        userStatus: 'pending_society', // New users need to join a society
        avatar: null,
        societyId: null
      };
      
      setUser(user);
      localStorage.setItem('nivra_user', JSON.stringify(user));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nivra_user');
    localStorage.removeItem('nivra_token');
  };

  const requestJoinSociety = async (societyId: string, unitNumber: string, isOwner: boolean, message?: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock: Create join request
      console.log('Join request created:', {
        userId: user?.id,
        societyId,
        unitNumber,
        isOwner,
        message
      });
      
      // In a real app, this would create a join request in the database
      // and the user would wait for admin approval
      
    } catch (error) {
      throw new Error('Failed to send join request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    requestJoinSociety
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
