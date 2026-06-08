import React, { createContext, useContext, useState, useEffect } from 'react';

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
  mobile: string;
  email: string;
  aadhaar: string;
  pan: string;
  address: string;
  memberId: string;
  kycStatus: 'Pending' | 'Verified' | 'Unsubmitted';
  kycDocumentUrl?: string;
  deposits: Deposit[];
  loans: Loan[];
  savingsBalance: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  loginWithOtp: (mobile: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  registerUser: (data: Omit<User, 'memberId' | 'kycStatus' | 'deposits' | 'loans' | 'savingsBalance'> & { password?: string }) => Promise<string>;
  logout: () => void;
  openNewDeposit: (type: Deposit['type'], amount: number, durationYears: number) => boolean;
  applyForLoan: (type: Loan['type'], amount: number, tenureMonths: number) => boolean;
  payEmi: (loanId: string) => boolean;
  uploadKyc: (documentType: string, filePlaceholder: string) => boolean;
  addSavingsMoney: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [otpMobile, setOtpMobile] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('iccs_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Sync user state with localStorage
  const saveUser = (updatedUser: User | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('iccs_current_user', JSON.stringify(updatedUser));
      setIsAuthenticated(true);
      
      // Update in registers database as well
      const registers = JSON.parse(localStorage.getItem('iccs_registers') || '[]');
      const updatedRegisters = registers.map((u: any) => 
        u.email === updatedUser.email || u.memberId === updatedUser.memberId ? { ...u, ...updatedUser } : u
      );
      localStorage.setItem('iccs_registers', JSON.stringify(updatedRegisters));
    } else {
      localStorage.removeItem('iccs_current_user');
      setIsAuthenticated(false);
    }
  };

  const login = async (identifier: string, pass: string): Promise<boolean> => {
    // Simulated delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get registered users from localStorage
    const registers = JSON.parse(localStorage.getItem('iccs_registers') || '[]');
    
    // Default mock user for testing if no users exist
    if (registers.length === 0) {
      const defaultUser: User & { password?: string } = {
        fullName: 'Rajesh Kumar Sharma',
        mobile: '9876543210',
        email: 'member@odiyoorubank.in',
        aadhaar: '1234 5678 9012',
        pan: 'ABCDE1234F',
        address: 'Shree Gurudevadatta Samsthanam, Odiyoor Post, Bantwal Taluk - 574243',
        memberId: 'OS-2026-9041',
        kycStatus: 'Verified',
        savingsBalance: 25480,
        deposits: [
          {
            id: 'DEP-101',
            type: 'Fixed',
            amount: 100000,
            rate: 8.25,
            date: '2026-01-10',
            maturityDate: '2027-01-10',
            status: 'Active',
            accruedInterest: 3200
          },
          {
            id: 'DEP-102',
            type: 'Recurring',
            amount: 5000,
            rate: 7.75,
            date: '2026-02-15',
            maturityDate: '2027-02-15',
            status: 'Active',
            accruedInterest: 480
          }
        ],
        loans: [
          {
            id: 'LN-501',
            type: 'Gold Loan',
            amount: 150000,
            outstanding: 124500,
            rate: 9.50,
            tenureMonths: 12,
            emi: 13150,
            nextPaymentDate: '2026-06-10',
            paidEmis: 2
          }
        ],
        password: 'password'
      };
      registers.push(defaultUser);
      localStorage.setItem('iccs_registers', JSON.stringify(registers));
    }

    const matched = registers.find((u: any) => 
      (u.email.toLowerCase() === identifier.toLowerCase() || u.memberId === identifier) && 
      (u.password === pass || pass === 'admin123') // fallback demo password
    );

    if (matched) {
      // Remove password before setting user state
      const { password, ...userProfile } = matched;
      saveUser(userProfile as User);
      return true;
    }
    return false;
  };

  const loginWithOtp = async (mobile: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setOtpMobile(mobile);
    return true; // OTP sent successfully
  };

  const verifyOtp = async (code: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (code === '123456' || code === '111111') { // Mock correct OTP code
      const registers = JSON.parse(localStorage.getItem('iccs_registers') || '[]');
      let matched = registers.find((u: any) => u.mobile === otpMobile);
      
      if (!matched) {
        // Automatically register mock user if mobile OTP is used but user doesn't exist
        const randId = Math.floor(1000 + Math.random() * 9000);
        const newUser: User = {
          fullName: 'New Valued Member',
          mobile: otpMobile || '9876543210',
          email: `${otpMobile || 'member'}@odiyoorubank.in`,
          aadhaar: 'XXXX XXXX XXXX',
          pan: 'XXXXX0000X',
          address: 'Not Provided',
          memberId: `OS-2026-${randId}`,
          kycStatus: 'Unsubmitted',
          savingsBalance: 5000,
          deposits: [],
          loans: []
        };
        registers.push({ ...newUser, password: 'password' });
        localStorage.setItem('iccs_registers', JSON.stringify(registers));
        matched = newUser;
      }
      
      const { password, ...userProfile } = matched;
      saveUser(userProfile as User);
      setOtpMobile(null);
      return true;
    }
    return false;
  };

  const registerUser = async (data: Omit<User, 'memberId' | 'kycStatus' | 'deposits' | 'loans' | 'savingsBalance'> & { password?: string }): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const registers = JSON.parse(localStorage.getItem('iccs_registers') || '[]');
    
    // Check if email or mobile already registered
    const exists = registers.some((u: any) => u.email.toLowerCase() === data.email.toLowerCase() || u.mobile === data.mobile);
    if (exists) {
      throw new Error('Email or Mobile Number is already registered.');
    }
 
    const randId = Math.floor(1000 + Math.random() * 9000);
    const memberId = `OS-2026-${randId}`;
 
    const newUser: User & { password?: string } = {
      ...data,
      memberId,
      kycStatus: 'Unsubmitted',
      savingsBalance: 10000, // Welcome ₹10,000 savings balance simulation
      deposits: [
        {
          id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
          type: 'Savings',
          amount: 10000,
          rate: 4.5,
          date: new Date().toISOString().split('T')[0],
          maturityDate: 'Ongoing',
          status: 'Active',
          accruedInterest: 0
        }
      ],
      loans: [],
      password: data.password || 'password'
    };

    registers.push(newUser);
    localStorage.setItem('iccs_registers', JSON.stringify(registers));
    
    // Automatically log in the newly registered user
    const { password, ...userProfile } = newUser;
    saveUser(userProfile as User);

    return memberId;
  };

  const logout = () => {
    saveUser(null);
  };

  const openNewDeposit = (type: Deposit['type'], amount: number, durationYears: number): boolean => {
    if (!user) return false;
    if (user.savingsBalance < amount) return false; // insufficient savings money to open deposit

    const rates = { Savings: 4.5, Fixed: 8.25, Recurring: 7.75, Daily: 6.50 };
    const rate = rates[type];
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    const maturityDate = new Date();
    maturityDate.setFullYear(today.getFullYear() + durationYears);
    const maturityStr = maturityDate.toISOString().split('T')[0];

    const newDep: Deposit = {
      id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      type,
      amount,
      rate,
      date: dateStr,
      maturityDate: type === 'Savings' ? 'Ongoing' : maturityStr,
      status: 'Active',
      accruedInterest: 0
    };

    const updatedUser: User = {
      ...user,
      savingsBalance: user.savingsBalance - amount,
      deposits: [...user.deposits, newDep]
    };

    saveUser(updatedUser);
    return true;
  };

  const applyForLoan = (type: Loan['type'], amount: number, tenureMonths: number): boolean => {
    if (!user) return false;

    const rates = {
      'Gold Loan': 8.50,
      'Vehicle Loan': 9.25,
      'Personal Loan': 11.50,
      'Education Loan': 7.90,
      'Housing Loan': 8.25
    };
    
    const rate = rates[type];
    
    // Standard EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyRate = (rate / 100) / 12;
    const emi = Math.round(
      (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );

    const nextPayment = new Date();
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    const nextPaymentStr = nextPayment.toISOString().split('T')[0];

    const newLoan: Loan = {
      id: `LN-${Math.floor(100 + Math.random() * 900)}`,
      type,
      amount,
      outstanding: amount,
      rate,
      tenureMonths,
      emi,
      nextPaymentDate: nextPaymentStr,
      paidEmis: 0
    };

    const updatedUser: User = {
      ...user,
      savingsBalance: user.savingsBalance + amount, // Disburse loan amount straight into savings!
      loans: [...user.loans, newLoan]
    };

    saveUser(updatedUser);
    return true;
  };

  const payEmi = (loanId: string): boolean => {
    if (!user) return false;
    
    const loan = user.loans.find((l) => l.id === loanId);
    if (!loan) return false;
    if (user.savingsBalance < loan.emi) return false; // Insufficient balance to pay EMI

    const updatedLoans = user.loans.map((l) => {
      if (l.id === loanId) {
        const nextPayment = new Date(l.nextPaymentDate);
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        const newOutstanding = Math.max(0, l.outstanding - l.emi);
        
        return {
          ...l,
          outstanding: newOutstanding,
          paidEmis: l.paidEmis + 1,
          nextPaymentDate: nextPayment.toISOString().split('T')[0]
        };
      }
      return l;
    });

    const updatedUser: User = {
      ...user,
      savingsBalance: user.savingsBalance - loan.emi,
      loans: updatedLoans
    };

    saveUser(updatedUser);
    return true;
  };

  const uploadKyc = (documentType: string, _filePlaceholder: string): boolean => {
    if (!user) return false;

    const updatedUser: User = {
      ...user,
      kycStatus: 'Verified', // Auto verify simulation for premium immediate UX
      kycDocumentUrl: `/kyc/${documentType.toLowerCase()}.pdf`
    };

    saveUser(updatedUser);
    return true;
  };

  const addSavingsMoney = (amount: number) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      savingsBalance: user.savingsBalance + amount
    };
    saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      loginWithOtp,
      verifyOtp,
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
