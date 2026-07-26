import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EligibilityForm } from '../components/LoanEligibility/EligibilityForm';
import type { LoanRequestData } from '../components/LoanEligibility/EligibilityForm';
import { EligibilityDashboard } from '../components/LoanEligibility/EligibilityDashboard';
import { Loader2, ArrowLeft, BrainCircuit } from 'lucide-react';
import api from '../services/api';

export interface LoanResponseData {
  isEligible: boolean;
  eligibilityStatus: string;
  maxEligibleAmount: number;
  approvalProbability: string;
  recommendedLoanType: string;
  interestRate: number;
  monthlyEMI: number;
  principalAmount: number;
  totalInterest: number;
  totalRepaymentAmount: number;
  processingFee: number;
  debtToIncomeRatio: number;
  disposableIncome: number;
  riskProfile: string;
  eligibilityScore: number;
  aiRecommendation: string;
  detailedReasoning: string[];
  improvementSuggestions: string[];
  chartData: {
    financialBreakdown: { name: string; value: number }[];
    repaymentBreakdown: { name: string; value: number }[];
  };
}

interface LoanEligibilityPageProps {
  setCurrentTab?: (tab: string) => void;
  goBack?: () => void;
}

export const LoanEligibilityPage: React.FC<LoanEligibilityPageProps> = ({ setCurrentTab, goBack }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'dashboard'>('form');
  const [formData, setFormData] = useState<LoanRequestData | null>(null);
  const [resultData, setResultData] = useState<LoanResponseData | null>(null);
  const [loadingText, setLoadingText] = useState('Analyzing Financial Profile...');

  const handleCheckEligibility = async (data: LoanRequestData) => {
    setFormData(data);
    setStep('loading');
    
    setTimeout(() => setLoadingText('Calculating Repayment Capacity...'), 800);
    setTimeout(() => setLoadingText('Checking Debt-to-Income Ratio...'), 1600);
    setTimeout(() => setLoadingText('Generating Smart Recommendation...'), 2400);

    try {
      const res = await api.post('/loans/calculator', {
        income: Number(data.income),
        existingEmi: Number(data.existingEmi),
        expenses: Number(data.expenses),
        savings: Number(data.savings),
        age: Number(data.age),
        occupation: data.occupation,
        loanType: data.loanType,
        desiredLoanAmount: Number(data.desiredAmount),
        loanTenure: Number(data.loanTenure),
        gender: data.gender
      });
      
      setResultData(res.data.data);
      
      setTimeout(() => {
        setStep('dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to calculate eligibility', error);
      setStep('form');
    }
  };

  const handleReset = () => {
    setStep('form');
    setFormData(null);
    setResultData(null);
    setLoadingText('Analyzing Financial Profile...');
  };

  return (
    <div className="min-h-screen bg-[#051C36] flex flex-col">
      <main className="flex-grow pt-4 pb-20 px-4 sm:px-6 lg:px-8 print:pt-0 print:pb-0">
        <div className="max-w-[1500px] mx-auto">
          
          <div className="mb-6 print:hidden">
            <button onClick={() => { if (goBack) goBack(); else if (setCurrentTab) setCurrentTab('home'); }} className="flex items-center text-white hover:text-blue-200 transition-colors font-bold">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </button>
          </div>

          <div className="text-left mb-8 print:hidden">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Smart Loan Eligibility
              </h1>
            </div>
            <p className="text-blue-100 text-lg ml-14">
              AI-powered loan assessment and financial health analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
            {/* Left Panel (Form) */}
            <div className="lg:col-span-5 h-full print:hidden">
              <EligibilityForm onSubmit={handleCheckEligibility} />
            </div>

            {/* Right Panel (Dashboard / Loading) */}
            <div className="lg:col-span-7 h-full print:block print:h-auto">
              <AnimatePresence mode="wait">
                
                {step === 'form' && (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full hidden lg:flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-3xl bg-white/5 min-h-[600px]"
                  >
                    <BrainCircuit className="h-24 w-24 text-white/30 mb-6" />
                    <p className="text-white/60 font-semibold text-xl">Fill the form to generate AI report</p>
                  </motion.div>
                )}

                {step === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-xl p-8"
                  >
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                      <Loader2 className="h-24 w-24 text-primary animate-spin relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">
                      {loadingText}
                    </h3>
                    <p className="text-slate-500 font-medium">Processing via AI decision engine...</p>
                  </motion.div>
                )}

                {step === 'dashboard' && formData && resultData && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <EligibilityDashboard 
                      formData={formData} 
                      resultData={resultData} 
                      onReset={handleReset} 
                      setCurrentTab={setCurrentTab}
                    />
                  </motion.div>
                )}
                
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
