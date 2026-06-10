import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EligibilityForm } from '../components/LoanEligibility/EligibilityForm';
import type { LoanRequestData } from '../components/LoanEligibility/EligibilityForm';
import { EligibilityDashboard } from '../components/LoanEligibility/EligibilityDashboard';
import { Loader2 } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowLeft } from 'lucide-react';

export interface LoanResponseData {
  eligibilityScore: number;
  maxLoanAmount: number;
  recommendedLoans: string[];
  riskLevel: string;
  monthlyEMI: number;
  approvalProbability: string;
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
    
    setTimeout(() => setLoadingText('Calculating Eligibility Score...'), 1000);
    setTimeout(() => setLoadingText('Generating Loan Recommendations...'), 2000);

    try {
      const res = await api.post('/loans/calculator', {
        income: Number(data.income),
        existingEmi: Number(data.existingEmi),
        age: Number(data.age)
      });
      
      const { eligibleAmount, eligibilityPercentage, estimatedEmi, isEligible } = res.data.data;
      
      let score = eligibilityPercentage || 50;
      let risk = isEligible ? "Low Risk" : "High Risk";
      let prob = isEligible ? "90%" : "20%";

      setResultData({
        eligibilityScore: score,
        maxLoanAmount: eligibleAmount,
        recommendedLoans: [data.loanType, "Personal Loan"],
        riskLevel: risk,
        monthlyEMI: estimatedEmi,
        approvalProbability: prob
      });
      
      setTimeout(() => {
        setStep('dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to calculate eligibility', error);
      // Fallback or error handling
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow pt-8 pb-20 px-4 sm:px-6 lg:px-8 print:pt-0 print:pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 print:hidden">
            <button onClick={() => { if (goBack) goBack(); else if (setCurrentTab) setCurrentTab('home'); }} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-bold">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </button>
          </div>
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12 print:hidden">
            <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">Smart Checker</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Smart Loan Eligibility
            </h1>
            <p className="text-slate-600 text-lg">
              Check your loan eligibility instantly and get AI-powered loan recommendations based on your financial profile.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EligibilityForm onSubmit={handleCheckEligibility} />
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center py-32 space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="h-20 w-20 text-primary animate-spin relative z-10" />
                </div>
                <motion.h3 
                  key={loadingText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-slate-800"
                >
                  {loadingText}
                </motion.h3>
                <p className="text-slate-500">Securely processing your data via bank-grade encryption</p>
              </motion.div>
            )}

            {step === 'dashboard' && formData && resultData && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <EligibilityDashboard 
                  formData={formData} 
                  resultData={resultData} 
                  onReset={handleReset} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
