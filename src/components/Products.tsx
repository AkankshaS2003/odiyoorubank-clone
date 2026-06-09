import React, { useState } from 'react';
import { PiggyBank, Briefcase, Sparkles, TrendingUp, HelpCircle, CheckCircle, AlertCircle, X, ShieldAlert, Landmark, FileCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export interface ProductItem {
  id: string;
  name: string;
  category: 'deposit' | 'loan';
  description: string;
  interestRate: string;
  badge?: string;
  benefits: string[];
}

export const Products: React.FC = () => {
  const { user, isAuthenticated, openNewDeposit, applyForLoan } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'deposit' | 'loan'>('deposit');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  
  // Application form state
  const [applyAmount, setApplyAmount] = useState<number>(50000);
  const [applyDuration, setApplyDuration] = useState<number>(3); // years or months
  const [applicationSuccess, setApplicationSuccess] = useState<boolean>(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  const depositProducts: ProductItem[] = [
    {
      id: 'prod-savings',
      name: t('savings_name'),
      category: 'deposit',
      description: t('savings_desc'),
      interestRate: '4.50% p.a.',
      badge: 'Most Popular',
      benefits: ['Zero balance facility for members', 'Free monthly physical statements', 'Simulated online fund transfers']
    },
    {
      id: 'prod-fixed',
      name: t('fd_name'),
      category: 'deposit',
      description: t('fd_desc'),
      interestRate: '8.25% p.a.',
      badge: 'Highest Return',
      benefits: ['Senior Citizen rate: 8.75%', 'Loan options up to 90% of FD value', 'Persistent compounding']
    },
    {
      id: 'prod-recurring',
      name: t('rd_name'),
      category: 'deposit',
      description: t('rd_desc'),
      interestRate: '7.75% p.a.',
      benefits: ['Flexible monthly contributions', 'Compounded quarterly interest', 'Auto-debit from savings']
    },
    {
      id: 'prod-daily',
      name: t('daily_deposit_name'),
      category: 'deposit',
      description: t('daily_deposit_desc'),
      interestRate: '6.50% p.a.',
      benefits: ['Daily threshold as low as ₹50', 'Doorstep collector agent facility', 'No penalty on early withdrawal']
    },
    {
      id: 'prod-mis',
      name: t('mis_name'),
      category: 'deposit',
      description: t('mis_desc'),
      interestRate: '8.00% p.a.',
      benefits: ['Guaranteed steady monthly cash flows', '5 Years lock-in tenure', 'Automatic monthly disburser transfers']
    },
    {
      id: 'prod-share',
      name: t('share_capital_name'),
      category: 'deposit',
      description: t('share_capital_desc'),
      interestRate: 'Variable Dividend',
      badge: 'Legal Stakeholder',
      benefits: ['Legal co-ownership and voting power', 'Pro-rata annual dividend payouts', 'Priority queue at branch locations']
    }
  ];

  const loanProducts: ProductItem[] = [
    {
      id: 'prod-gold',
      name: t('gold_name'),
      category: 'loan',
      description: t('gold_desc'),
      interestRate: '8.50% p.a.',
      badge: 'Instant Processing',
      benefits: ['Disbursed within 30 minutes', 'LTV up to 75% of gold value', 'Secure government-grade safe vault keeping']
    },
    {
      id: 'prod-vehicle',
      name: t('vehicle_name'),
      category: 'loan',
      description: t('vehicle_desc'),
      interestRate: '9.25% p.a.',
      benefits: ['Up to 85% on-road funding', 'Up to 7 years repayment tenure', 'Quick loan sanction']
    },
    {
      id: 'prod-personal',
      name: t('personal_name'),
      category: 'loan',
      description: t('personal_desc'),
      interestRate: '11.50% p.a.',
      badge: 'Unsecured Credit',
      benefits: ['No collateral requirements', 'Flexible loan limit up to ₹5 Lakhs', 'Simplified paperless eligibility check']
    },
    {
      id: 'prod-education',
      name: t('education_name'),
      category: 'loan',
      description: t('education_desc'),
      interestRate: '7.90% p.a.',
      benefits: ['Moratorium period during studies', 'Tax rebates under Section 80E', 'Direct tuition fee disbursements']
    },
    {
      id: 'prod-housing',
      name: t('housing_name'),
      category: 'loan',
      description: t('housing_desc'),
      interestRate: '8.25% p.a.',
      benefits: ['Subsidized rates for cooperative members', 'Long terms up to 20 years', 'Zero prepayment charges']
    }
  ];

  const activeProducts = activeTab === 'deposit' ? depositProducts : loanProducts;

  const handleApplyClick = (product: ProductItem) => {
    setSelectedProduct(product);
    setApplyAmount(product.category === 'deposit' ? 25000 : 100000);
    setApplyDuration(product.category === 'deposit' ? 3 : 24); // years for deposits, months for loans
    setApplicationSuccess(false);
    setApplicationError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!isAuthenticated || !user) {
      setApplicationError('Please register or log in as a member to apply for our banking products.');
      return;
    }

    if (selectedProduct.category === 'deposit') {
      if (user.savingsBalance < applyAmount) {
        setApplicationError(`Insufficient Savings balance. You currently have ₹${user.savingsBalance.toLocaleString('en-IN')}. Please add funds to your savings account in the Member Dashboard first.`);
        return;
      }
      
      const success = openNewDeposit(
        selectedProduct.name.replace(' Deposit', '').replace(' (FD)', '').replace(' Scheme', '') as any,
        applyAmount,
        applyDuration
      );
      if (success) {
        setApplicationSuccess(true);
      } else {
        setApplicationError('Something went wrong. Please check your inputs and try again.');
      }
    } else {
      // Loan Application
      const success = applyForLoan(
        selectedProduct.name as any,
        applyAmount,
        applyDuration
      );
      if (success) {
        setApplicationSuccess(true);
      } else {
        setApplicationError('Could not process loan application. Verify parameters.');
      }
    }
  };

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">Our Offerings</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {t('prod_title')}
          </h2>
          <p className="text-slate-650 leading-relaxed">
            {t('prod_desc')}
          </p>

          {/* Toggle Tabs */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl mt-8">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'deposit' ? 'bg-primary text-white shadow-md' : 'text-slate-655 hover:text-slate-900'}`}
            >
              <PiggyBank className="h-4 w-4" />
              <span>Deposits & Share Capital</span>
            </button>
            <button
              onClick={() => setActiveTab('loan')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'loan' ? 'bg-primary text-white shadow-md' : 'text-slate-655 hover:text-slate-900'}`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Flexible Credit & Loans</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-3xl p-6 border border-slate-150 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 flex flex-col justify-between relative group"
            >
              {product.badge && (
                <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.badge}
                </span>
              )}

              <div>
                {/* Visual Icon */}
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {product.category === 'deposit' ? <PiggyBank className="h-6 w-6" /> : <Briefcase className="h-6 w-6" />}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{product.description}</p>

                {/* Key Benefits */}
                <ul className="space-y-2 mb-6">
                  {product.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-slate-600">
                      <span className="text-primary font-bold mr-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interest Rate & CTA */}
              <div className="border-t border-slate-100 pt-4 mt-auto flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Interest Rate</span>
                  <span className="text-lg font-extrabold text-primary">{product.interestRate}</span>
                </div>
                <button
                  onClick={() => handleApplyClick(product)}
                  className="px-4.5 py-2.5 bg-primary/5 hover:bg-primary hover:text-white rounded-xl text-xs font-bold text-primary transition-all duration-300"
                >
                  {t('apply_now')}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Product Application Interactive Modal Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100 animate-scale-up">
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Success State */}
            {applicationSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <FileCheck className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-950">Application Successful!</h3>
                <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                  Your simulated {selectedProduct.category === 'deposit' ? 'deposit account' : 'credit line'} has been created instantly!
                </p>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-left text-xs space-y-1 max-w-xs mx-auto">
                  <p className="text-slate-500 font-semibold uppercase tracking-wider">Transaction Invoice</p>
                  <p className="text-slate-800"><span className="font-semibold">Type:</span> {selectedProduct.name}</p>
                  <p className="text-slate-800"><span className="font-semibold">Principal:</span> ₹{applyAmount.toLocaleString('en-IN')}</p>
                  <p className="text-slate-800"><span className="font-semibold">Interest Rate:</span> {selectedProduct.interestRate}</p>
                  <p className="text-slate-800"><span className="font-semibold">Repayment/Lock:</span> {applyDuration} {selectedProduct.category === 'deposit' ? 'Years' : 'Months'}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="mt-4 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  Return to Products
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Cooperative Application Portal</span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedProduct.name}</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{selectedProduct.description}</p>
                </div>

                {applicationError && (
                  <div className="p-4.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-3 text-xs">
                    <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
                    <span>{applicationError}</span>
                  </div>
                )}

                {/* Amount Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <label className="text-slate-500">
                      {selectedProduct.category === 'deposit' ? 'Deposit Principal' : 'Loan Sum Requested'}
                    </label>
                    <span className="text-primary font-bold text-base">₹{applyAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={selectedProduct.category === 'deposit' ? 1000 : 10000}
                    max={selectedProduct.category === 'deposit' ? 500000 : 1000000}
                    step={selectedProduct.category === 'deposit' ? 1000 : 10000}
                    value={applyAmount}
                    onChange={(e) => setApplyAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>{selectedProduct.category === 'deposit' ? 'Min: ₹1,000' : 'Min: ₹10,000'}</span>
                    <span>{selectedProduct.category === 'deposit' ? 'Max: ₹5,00000' : 'Max: ₹10,00,000'}</span>
                  </div>
                </div>

                {/* Duration select */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <label className="text-slate-500">
                      {selectedProduct.category === 'deposit' ? 'Deposit Term (Lock-in)' : 'Credit Repayment Period'}
                    </label>
                    <span className="text-primary font-bold">
                      {applyDuration} {selectedProduct.category === 'deposit' ? 'Years' : 'Months'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={selectedProduct.category === 'deposit' ? 1 : 6}
                    max={selectedProduct.category === 'deposit' ? 10 : 60}
                    step={1}
                    value={applyDuration}
                    onChange={(e) => setApplyDuration(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>{selectedProduct.category === 'deposit' ? 'Min: 1 Yr' : 'Min: 6 Months'}</span>
                    <span>{selectedProduct.category === 'deposit' ? 'Max: 10 Yrs' : 'Max: 60 Months'}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Standard Rate:</span>
                    <span className="font-bold text-slate-800">{selectedProduct.interestRate}</span>
                  </div>
                  {isAuthenticated && user && (
                    <div className="flex justify-between text-xs text-slate-600 border-t border-slate-200/50 pt-2">
                      <span>Available Savings Balance:</span>
                      <span className={`font-bold ${user.savingsBalance < applyAmount && selectedProduct.category === 'deposit' ? 'text-red-500' : 'text-emerald-600'}`}>
                        ₹{user.savingsBalance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Landmark className="h-5 w-5" />
                  <span>Confirm Account Opening</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
