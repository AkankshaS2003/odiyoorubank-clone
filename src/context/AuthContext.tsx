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
  dob?: string;
  bloodGroup?: string;
  memberId?: string;
  kycStatus?: 'Pending' | 'Verified' | 'Unsubmitted';
  kycDocumentUrl?: string;
  deposits?: Deposit[];
  loans?: Loan[];
  savingsBalance?: number;
  fdBalance?: number;
  rdBalance?: number;
  role?: 'customer' | 'employee' | 'manager' | 'admin';
  membershipStatus?: string;
  customerId?: string;
  isKycVerified?: boolean;
  minimumBalancePaid?: boolean;
  accountNumber?: string;
  ifscCode?: string;
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
  announcements?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<string | null>;
  googleLogin: (token: string) => Promise<string | null>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<string | null>;
  registerUser: (data: Partial<User> & { password?: string }) => Promise<string | null>;
  logout: () => void;
  // Preserving mock banking functions so the UI doesn't crash
  openNewDeposit: (type: Deposit['type'], amount: number, durationYears: number) => Promise<boolean>;
  applyForLoan: (type: Loan['type'], amount: number, tenureMonths: number) => Promise<boolean>;
  payEmi: (loanId: string) => boolean;
  uploadKyc: (documentType: string, filePlaceholder: string) => boolean;
  addSavingsMoney: (amount: number) => void;
  becomeMember: (address: string, dob: string) => Promise<boolean>;
  systemSettings: SystemSettings;
  updateSystemSettings: (newSettings: Partial<SystemSettings>) => Promise<boolean>;
  submitServiceApplication: (applicationType: string, formData: any, images: any) => Promise<boolean>;
  getUserServiceApplications: () => Promise<any[]>;
  getAllServiceApplications: () => Promise<any[]>;
  updateServiceApplicationStatus: (id: string, status: string) => Promise<boolean>;
  getCustomerByCustomerId: (customerId: string) => Promise<any>;
  submitAccountApplication: (formData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
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
            setUser({ 
              ...res.data.data, 
              savingsBalance: res.data.data.savingsBalance || 0, 
              deposits: res.data.data.deposits || [], 
              loans: res.data.data.loans || [], 
              kycStatus: res.data.data.isKycVerified ? 'Verified' : 'Pending',
              accountNumber: res.data.data.accountNumber,
              ifscCode: res.data.data.ifscCode
            });
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
        setToken(res.data.data.token);
        
        const profileRes = await api.get('/auth/me');
        setUser({ 
          ...profileRes.data.data, 
          savingsBalance: profileRes.data.data.savingsBalance || 0, 
          deposits: profileRes.data.data.deposits || [], 
          loans: profileRes.data.data.loans || [], 
          kycStatus: profileRes.data.data.isKycVerified ? 'Verified' : 'Pending' 
        });
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
        setToken(res.data.data.token);
        const profileRes = await api.get('/auth/me');
        setUser({ 
          ...profileRes.data.data, 
          savingsBalance: profileRes.data.data.savingsBalance || 0, 
          deposits: profileRes.data.data.deposits || [], 
          loans: profileRes.data.data.loans || [], 
          kycStatus: profileRes.data.data.isKycVerified ? 'Verified' : 'Pending' 
        });
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
        setToken(res.data.data.token);
        const profileRes = await api.get('/auth/me');
        setUser({ 
          ...profileRes.data.data, 
          savingsBalance: profileRes.data.data.savingsBalance || 0, 
          deposits: profileRes.data.data.deposits || [], 
          loans: profileRes.data.data.loans || [], 
          kycStatus: profileRes.data.data.isKycVerified ? 'Verified' : 'Pending' 
        });
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
        const newToken = res.data.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        
        const profileRes = await api.get('/auth/me');
        setUser({ 
          ...profileRes.data.data, 
          savingsBalance: profileRes.data.data.savingsBalance || 0, 
          deposits: profileRes.data.data.deposits || [], 
          loans: profileRes.data.data.loans || [], 
          kycStatus: profileRes.data.data.isKycVerified ? 'Verified' : 'Pending' 
        });
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
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // MOCK BANKING FUNCTIONS PRESERVED FOR UI
  const saveUser = (updatedUser: User | null) => setUser(updatedUser);

  const openNewDeposit = async (type: Deposit['type'], amount: number, durationYears: number): Promise<boolean> => {
    if (!user) return false;
    if ((user.savingsBalance || 0) < amount) return false; 
    
    try {
      const res = await api.post('/account/deposit', { type, amount, durationYears });
      if (res.data.success) {
        saveUser(res.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create deposit', error);
      return false;
    }
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

  const becomeMember = async (address: string, dob: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await api.post('/account/membership/apply', { address, dob });
      if (res.data.success) {
        saveUser(res.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to apply for membership', error);
      return false;
    }
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

  const submitServiceApplication = async (applicationType: string, formData: any, images: any): Promise<boolean> => {
    try {
      const loanTypes = ['Personal Loan', 'Home Loan', 'Educational Loan', 'Education Loan', 'Gold Loan', 'Vehicle Loan', 'Agricultural Loan', 'Mortgage Loan', 'Business Loan'];
      
      if (loanTypes.includes(applicationType)) {
        const payload = {
           loanType: applicationType === 'Educational Loan' ? 'Education Loan' : applicationType,
           amount: formData.requestedAmount || formData.reqAmount || formData.loanAmount || 0,
           tenure: formData.tenure || formData.repayMonths || formData.months || 12,
           income: formData.income || formData.monthlyIncome || formData.annualIncome || 0,
           ...formData,
           uploadedDocuments: Object.keys(images).map(key => ({ documentName: key, documentUrl: images[key] }))
        };
        const res = await api.post('/loans/apply', payload);
        return res.data.success;
      }

      const res = await api.post('/service-applications', { applicationType, formData, images });
      return res.data.success;
    } catch (error) {
      console.error('Failed to submit application', error);
      return false;
    }
  };

  const getUserServiceApplications = async (): Promise<any[]> => {
    try {
      const res = await api.get('/service-applications/my');
      return res.data.success ? res.data.data : [];
    } catch (error) {
      console.error('Failed to get user applications', error);
      return [];
    }
  };

  const getAllServiceApplications = async (): Promise<any[]> => {
    try {
      const res = await api.get('/service-applications');
      return res.data.success ? res.data.data : [];
    } catch (error) {
      console.error('Failed to get all applications', error);
      return [];
    }
  };

  const updateServiceApplicationStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      const res = await api.put(`/service-applications/${id}/status`, { status });
      return res.data.success;
    } catch (error) {
      console.error('Failed to update application status', error);
      return false;
    }
  };

  const getCustomerByCustomerId = async (customerId: string): Promise<any> => {
    try {
      const res = await api.get(`/account/customer/${customerId}`);
      return res.data.success ? res.data.data : null;
    } catch (error) {
      console.error('Failed to fetch customer by ID', error);
      return null;
    }
  };

  const submitAccountApplication = async (formData: any): Promise<boolean> => {
    try {
      const res = await api.post('/applications', formData);
      return res.data.success;
    } catch (error) {
      console.error('Failed to submit account application', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
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
      becomeMember,
      systemSettings,
      updateSystemSettings,
      submitServiceApplication,
      getUserServiceApplications,
      getAllServiceApplications,
      updateServiceApplicationStatus,
      getCustomerByCustomerId,
      submitAccountApplication
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
