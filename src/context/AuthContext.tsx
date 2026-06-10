import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface Deposit {
  id: string;
  type: 'Savings' | 'Fixed' | 'Recurring' | 'Daily';
  amount: number;
  rate: number;
  date: string;
  maturityDate: string;
  status: 'Active' | 'Matured';
  accruedInterest: number;
}

export interface Loan {
  id: string;
  type: 'Gold Loan' | 'Vehicle Loan' | 'Personal Loan' | 'Education Loan' | 'Housing Loan';
  amount: number;
  outstanding: number;
  rate: number;
  tenureMonths: number;
  emi: number;
  nextPaymentDate: string;
  paidEmis: number;
}

export interface User {
  fullName: string;
  phone: string;
  email: string;
  aadhaar?: string;
  pan?: string;
  address?: string;
  memberId?: string;
  kycStatus?: 'Pending' | 'Verified' | 'Unsubmitted';
  kycDocumentUrl?: string;
  deposits?: Deposit[];
  loans?: Loan[];
  savingsBalance?: number;
  role?: 'customer' | 'employee' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  googleLogin: (token: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  registerUser: (data: Partial<User> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  // Preserving mock banking functions so the UI doesn't crash
  openNewDeposit: (type: Deposit['type'], amount: number, durationYears: number) => boolean;
  applyForLoan: (type: Loan['type'], amount: number, tenureMonths: number) => Promise<boolean>;
  payEmi: (loanId: string) => boolean;
  uploadKyc: (documentType: string, filePlaceholder: string) => boolean;
  addSavingsMoney: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load user from backend on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser({ ...res.data.data, savingsBalance: 5000, deposits: [], loans: [], kycStatus: 'Verified' });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Failed to fetch profile', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
    };
    fetchUser();
  }, []);

  const login = async (identifier: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email: identifier, password: pass });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        
        const profileRes = await api.get('/auth/me');
        setUser({ ...profileRes.data.data, savingsBalance: 5000, deposits: [], loans: [], kycStatus: 'Verified' });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const googleLogin = async (token: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/google', { token });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        const profileRes = await api.get('/auth/me');
        setUser({ ...profileRes.data.data, savingsBalance: 5000, deposits: [], loans: [], kycStatus: 'Verified' });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google login error', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      return res.data.success;
    } catch (error) {
      console.error('Forgot password error', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      const res = await api.put(`/auth/resetpassword/${token}`, { password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        const profileRes = await api.get('/auth/me');
        setUser({ ...profileRes.data.data, savingsBalance: 5000, deposits: [], loans: [], kycStatus: 'Verified' });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Reset password error', error);
      throw error;
    }
  };

  const registerUser = async (data: any): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password
      });
      
      if (res.data.success) {
        const token = res.data.data.token;
        localStorage.setItem('token', token);
        
        const profileRes = await api.get('/auth/me');
        setUser({ ...profileRes.data.data, savingsBalance: 5000, deposits: [], loans: [], kycStatus: 'Verified' });
        setIsAuthenticated(true);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // MOCK BANKING FUNCTIONS PRESERVED FOR UI
  const saveUser = (updatedUser: User | null) => setUser(updatedUser);

  const openNewDeposit = (type: Deposit['type'], amount: number, durationYears: number): boolean => {
    if (!user) return false;
    if ((user.savingsBalance || 0) < amount) return false; 
    const rates = { Savings: 4.5, Fixed: 8.25, Recurring: 7.75, Daily: 6.50 };
    const newDep: Deposit = {
      id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      type, amount, rate: rates[type],
      date: new Date().toISOString().split('T')[0],
      maturityDate: 'Ongoing',
      status: 'Active', accruedInterest: 0
    };
    saveUser({ ...user, savingsBalance: (user.savingsBalance || 0) - amount, deposits: [...(user.deposits || []), newDep] });
    return true;
  };

  const applyForLoan = async (type: Loan['type'], amount: number, tenureMonths: number): Promise<boolean> => {
    return true;
  };

  const payEmi = (loanId: string): boolean => {
    return true;
  };

  const uploadKyc = (documentType: string, _filePlaceholder: string): boolean => {
    if (!user) return false;
    saveUser({ ...user, kycStatus: 'Verified', kycDocumentUrl: `/kyc/${documentType.toLowerCase()}.pdf` });
    return true;
  };

  const addSavingsMoney = (amount: number) => {
    if (!user) return;
    saveUser({ ...user, savingsBalance: (user.savingsBalance || 0) + amount });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      googleLogin,
      forgotPassword,
      resetPassword,
      registerUser,
      logout,
      openNewDeposit,
      applyForLoan,
      payEmi,
      uploadKyc,
      addSavingsMoney
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
