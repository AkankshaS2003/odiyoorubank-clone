import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EligibilityForm } from '../components/LoanEligibility/EligibilityForm';
import type { LoanRequestData } from '../components/LoanEligibility/EligibilityForm';
import { EligibilityDashboard } from '../components/LoanEligibility/EligibilityDashboard';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
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
    
    // Simulate multi-step loading sequence
    setTimeout(() => setLoadingText('Calculating Eligibility Score...'), 1000);
    setTimeout(() => setLoadingText('Generating Loan Recommendations...'), 2000);

    setTimeout(() => {
      // Simulate backend calculation logic since we don't have a real API
      const incomeNum = Number(data.income);
      const existingEmiNum = Number(data.existingEmi);
      const expensesNum = Number(data.expenses);
      const desiredAmountNum = Number(data.desiredAmount);
      const tenureMonths = Number(data.loanTenure) * 12;

      // Available income for EMI
      const netMonthlyIncome = incomeNum - expensesNum - existingEmiNum;
      
      // Assume a max EMI they can afford is up to 50% of net income
      const maxAffordableEmi = netMonthlyIncome > 0 ? netMonthlyIncome * 0.5 : 0;
      
      // Very basic loan formula approximation: Max Loan = Affordable EMI * tenure (ignoring complex interest for demo)
      let calculatedMaxLoan = maxAffordableEmi * tenureMonths * 0.75;
      calculatedMaxLoan = Math.max(0, Math.round(calculatedMaxLoan / 10000) * 10000); // round to 10k

      // Suggested EMI based on requested loan amount
      const suggestedEmi = desiredAmountNum > 0 && tenureMonths > 0 
        ? Math.round(desiredAmountNum / tenureMonths * 1.1) // 10% interest approx factor
        : 0;

      let score = 50;
      let risk = "Medium Risk";
      let prob = "50%";

      if (maxAffordableEmi > suggestedEmi * 1.5) {
        score = 85 + Math.floor(Math.random() * 10);
        risk = "Low Risk";
        prob = "95%";
      } else if (maxAffordableEmi > suggestedEmi) {
        score = 65 + Math.floor(Math.random() * 10);
        risk = "Medium Risk";
        prob = "70%";
      } else {
        score = 30 + Math.floor(Math.random() * 15);
        risk = "High Risk";
        prob = "20%";
      }

      setResultData({
        eligibilityScore: score,
        maxLoanAmount: calculatedMaxLoan,
        recommendedLoans: [data.loanType, "Personal Loan"],
        riskLevel: risk,
        monthlyEMI: suggestedEmi,
        approvalProbability: prob
      });
      setStep('dashboard');
    }, 3000);
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
