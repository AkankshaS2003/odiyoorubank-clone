import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

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
  _id?: string;
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
  role?: 'customer' | 'employee' | 'manager' | 'admin';
}

export interface SystemSettings {
  fdRate: number;
  goldLoanRate: number;
  savingsRate: number;
  rdRate: number;
  marqueeText: string;
  heroTitle: string;
  heroDesc: string;
  aboutText: string;
  contactPhone: string;
  contactEmail: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<string | null>;
  googleLogin: (token: string) => Promise<string | null>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<string | null>;
  registerUser: (data: Partial<User> & { password?: string }) => Promise<string | null>;
  logout: () => void;
  // Preserving mock banking functions so the UI doesn't crash
  openNewDeposit: (type: Deposit['type'], amount: number, durationYears: number) => boolean;
  applyForLoan: (type: Loan['type'], amount: number, tenureMonths: number) => Promise<boolean>;
  payEmi: (loanId: string) => boolean;
  uploadKyc: (documentType: string, filePlaceholder: string) => boolean;
  addSavingsMoney: (amount: number) => void;
  systemSettings: SystemSettings;
  updateSystemSettings: (newSettings: Partial<SystemSettings>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    fdRate: 8.50,
    goldLoanRate: 8.50,
    savingsRate: 4.50,
    rdRate: 7.75,
    marqueeText: '• State Best Souharda Cooperative Society Award in the 69th All India Cooperative Week • Cooperative Fixed Deposit Rates Increased to 8.50% • New Digital Doorstep Banking Service Sanctioned',
    heroTitle: 'Odiyooru Souharda',
    heroDesc: 'Cooperative Society Ltd',
    aboutText: 'Odiyooru Souharda Cooperative Society Ltd is a premier cooperative financial institution established on 20-04-2011, dedicated to empowering communities and micro-merchants through reliable deposits, gold loans, and absolute financial security. Guided by values of trust, progress, and co-ownership, we have been a trusted partner in rural growth and self-reliance for over a decade.',
    contactPhone: '+91 824 2441234',
    contactEmail: 'support@odiyoorubank.in'
  });

  // Load user from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.success) {
          setSystemSettings(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch system settings', error);
      }
    };
    fetchSettings();
  }, []);
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

  const login = async (identifier: string, pass: string): Promise<string | null> => {
    try {
      const res = await api.post('/auth/login', { email: identifier, password: pass });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        
        const profileRes = await api.get('/auth/me');
        setUser({ ...profileRes.data.data, savingsBalance: 5000, deposits: [], loans: [], kycStatus: 'Verified' });
        setIsAuthenticated(true);
        return profileRes.data.data.role || 'customer';
      }
      return null;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const googleLogin = async (token: string): Promise<string | null> => {
    try {
      // Trigger Firebase Auth Popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();

      // Now send the Firebase Token to our backend
      const res = await api.post('/auth/google', { token: firebaseToken });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        const profileRes = await api.get('/auth/me');
        setUser({ ...profileRes.data.data, savingsBalance: 5000, deposits: [], loans: [], kycStatus: 'Verified' });
        setIsAuthenticated(true);
        return profileRes.data.data.role || 'customer';
      }
      return null;
    } catch (error) {
      console.error('Firebase Google login error', error);
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

  const resetPassword = async (token: string, password: string): Promise<string | null> => {
    try {
      const res = await api.put(`/auth/resetpassword/${token}`, { password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        const profileRes = await api.get('/auth/me');
        setUser({ ...profileRes.data.data, savingsBalance: 5000, deposits: [], loans: [], kycStatus: 'Verified' });
        setIsAuthenticated(true);
        return profileRes.data.data.role || 'customer';
      }
      return null;
    } catch (error) {
      console.error('Reset password error', error);
      throw error;
    }
  };

  const registerUser = async (data: any): Promise<string | null> => {
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
        
        return profileRes.data.data.role || 'customer';
      }
      return null;
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
    const rates = { Savings: 4.5, Fixed: 8.50, Recurring: 7.75, Daily: 6.50 };
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

  const updateSystemSettings = async (newSettings: Partial<SystemSettings>): Promise<boolean> => {
    try {
      const res = await api.put('/admin/settings', newSettings);
      if (res.data.success) {
        setSystemSettings(res.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update system settings', error);
      return false;
    }
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
      addSavingsMoney,
      systemSettings,
      updateSystemSettings
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
