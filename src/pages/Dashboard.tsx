import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, PiggyBank, Briefcase, Plus, TrendingUp, CheckCircle2, UserCheck, CreditCard, RefreshCw, ShieldAlert } from 'lucide-react';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const { user, isAuthenticated, openNewDeposit, payEmi, uploadKyc, addSavingsMoney } = useAuth();
  const { t } = useLanguage();
  
  // Dashboard Action States
  const [addFundsAmount, setAddFundsAmount] = useState<number>(25000);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isOpeningDep, setIsOpeningDep] = useState(false);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);

  // New Deposit Form State
  const [depType, setDepType] = useState<'Fixed' | 'Recurring'>('Fixed');
  const [depAmount, setDepAmount] = useState<number>(50000);
  const [depDuration, setDepDuration] = useState<number>(3); // Years

  // KYC upload mock states
  const [kycDocType, setKycDocType] = useState('Aadhaar');
  const [kycFeedback, setKycFeedback] = useState<string | null>(null);

  // General Notification feedback
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <section className="min-h-screen pt-36 pb-16 flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-150 p-8 rounded-3xl shadow-xl text-center space-y-4 max-w-md w-full">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">{t('access_restricted')}</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            {t('access_restricted_desc')}
          </p>
          <button
            onClick={() => setCurrentTab('login')}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md transition-colors"
          >
            {t('go_to_login')}
          </button>
        </div>
      </section>
    );
  }

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingFunds(true);
    
    setTimeout(() => {
      addSavingsMoney(addFundsAmount);
      setIsAddingFunds(false);
      triggerNotification('success', `Simulated transfer of ₹${addFundsAmount.toLocaleString('en-IN')} completed!`);
    }, 1000);
  };

  const handleOpenDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.savingsBalance < depAmount) {
      triggerNotification('error', `Insufficient Savings balance. Please add simulated funds to open this ₹${depAmount.toLocaleString('en-IN')} deposit.`);
      return;
    }

    setIsOpeningDep(true);
    setTimeout(() => {
      const success = openNewDeposit(depType, depAmount, depDuration);
      setIsOpeningDep(false);
      if (success) {
        triggerNotification('success', `Simulated ${depType} Deposit of ₹${depAmount.toLocaleString('en-IN')} opened successfully!`);
      } else {
        triggerNotification('error', 'Could not open deposit. Verify inputs.');
      }
    }, 1000);
  };

  const handleEmiPayment = (loanId: string, emiVal: number) => {
    if (user.savingsBalance < emiVal) {
      triggerNotification('error', `Insufficient Savings balance to pay EMI of ₹${emiVal.toLocaleString('en-IN')}. Please add simulated funds first.`);
      return;
    }

    const success = payEmi(loanId);
    if (success) {
      triggerNotification('success', `Loan EMI payment of ₹${emiVal.toLocaleString('en-IN')} processed successfully!`);
    } else {
      triggerNotification('error', 'Loan EMI processing failed.');
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingKyc(true);
    
    setTimeout(() => {
      uploadKyc(kycDocType, 'simulated_kyc_document.pdf');
      setIsUploadingKyc(false);
      setKycFeedback('KYC Documents checked and Verified successfully!');
      triggerNotification('success', 'e-KYC verified instantly via simulated Gov data nodes!');
    }, 1200);
  };

  // Summary Metrics calculations
  const totalDepositPrincipal = user.deposits.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutstandingLoan = user.loans.reduce((acc, curr) => acc + curr.outstanding, 0);

  return (
    <section className="min-h-screen pt-28 pb-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating live feedback alerts banner */}
        {notification && (
          <div className={`fixed top-24 right-6 z-50 p-4.5 rounded-2xl shadow-2xl border flex items-center space-x-3 text-xs max-w-sm animate-slide-in ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
            {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Member Greeting Details Panel */}
        <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">{t('active_portal_badge')}</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user.fullName}</h2>
              
              <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-slate-500 font-semibold">
                <span>{t('member_id_value').replace('{id}', user.memberId)}</span>
                <span>•</span>
                <span>PAN: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">{user.pan}</code></span>
                <span>•</span>
                <span className={`inline-flex items-center space-x-1 ${user.kycStatus === 'Verified' ? 'text-emerald-600' : 'text-amber-500'}`}>
                  <span>{t('ekyc_status')}:</span>
                  <span className="font-bold">{user.kycStatus === 'Verified' ? t('kyc_verified') : user.kycStatus === 'Pending' ? t('kyc_pending') : t('kyc_unsubmitted')}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setCurrentTab('home')}
              className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              {t('main_website_btn')}
            </button>
            <button
              onClick={() => setCurrentTab('products')}
              className="px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              {t('open_fd_btn')}
            </button>
          </div>
        </div>

        {/* Core Financial Balances Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Savings Balance Card */}
          <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">{t('savings_balance')}</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 block">₹{user.savingsBalance.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <PiggyBank className="h-6 w-6" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span className="text-emerald-500 font-bold">Interest: 4.50% p.a.</span>
              <span className="text-slate-400 font-semibold">Simulated Checking</span>
            </div>
          </div>

          {/* Active Deposits Card */}
          <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">{t('active_deposits')}</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary mt-1 block">₹{totalDepositPrincipal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-blue-50 text-primary rounded-xl">
                <Landmark className="h-6 w-6" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span className="text-primary font-bold">Portfolios: {user.deposits.length} Active</span>
              <span className="text-slate-400 font-semibold">FD & RD Tracker</span>
            </div>
          </div>

          {/* Active Loans Card */}
          <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">{t('loan_outstandings')}</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1 block">₹{totalOutstandingLoan.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span className="text-rose-500 font-bold">Loans: {user.loans.length} Sanctioned</span>
              <span className="text-slate-400 font-semibold">EMIs Due Monthly</span>
            </div>
          </div>

        </div>

        {/* Dashboard Workflows Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Active Accounts Tracking - Left 8 columns */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Deposits Tracking Ledger */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                <span>{t('deposit_portfolio_title')}</span>
              </h3>

              {user.deposits.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">{t('no_active_deposits')}</p>
                  <button 
                    onClick={() => setCurrentTab('products')}
                    className="mt-2 text-xs font-bold text-primary hover:underline"
                  >
                    {t('explore_fds_now')}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Portfolios ID</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Principal</th>
                        <th className="pb-3">Rate</th>
                        <th className="pb-3">{t('maturity_term')}</th>
                        <th className="pb-3 text-right pr-2">{t('accrued_int_label')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700 font-semibold divide-y divide-slate-100/50">
                      {user.deposits.map((dep) => (
                        <tr key={dep.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 pl-2 font-mono text-[10px] text-slate-400">{dep.id}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dep.type === 'Savings' ? 'bg-emerald-100 text-emerald-800' : dep.type === 'Fixed' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                              {dep.type}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-900">₹{dep.amount.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 text-slate-500">{dep.rate}%</td>
                          <td className="py-3.5 text-slate-500">{dep.maturityDate}</td>
                          <td className="py-3.5 text-right pr-2 text-emerald-600">+₹{dep.accruedInterest.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Loans Outstanding Tracker Ledger */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-rose-500" />
                <span>{t('coop_loans_title')}</span>
              </h3>

              {user.loans.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">{t('no_active_loans')}</p>
                  <button 
                    onClick={() => setCurrentTab('products')}
                    className="mt-2 text-xs font-bold text-primary hover:underline"
                  >
                    {t('sanction_loans_now')}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Loan ID</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Outstanding</th>
                        <th className="pb-3">EMI Amount</th>
                        <th className="pb-3">EMIs Paid</th>
                        <th className="pb-3 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700 font-semibold divide-y divide-slate-100/50">
                      {user.loans.map((ln) => (
                        <tr key={ln.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 pl-2 font-mono text-[10px] text-slate-400">{ln.id}</td>
                          <td className="py-3.5 text-slate-900 font-bold">{ln.type}</td>
                          <td className="py-3.5 text-slate-800">
                            {ln.outstanding === 0 ? (
                              <span className="text-emerald-600 font-extrabold flex items-center space-x-1">
                                <span>{t('fully_paid_loan')}</span>
                              </span>
                            ) : (
                              <span>₹{ln.outstanding.toLocaleString('en-IN')}</span>
                            )}
                          </td>
                          <td className="py-3.5 text-slate-500">₹{ln.emi.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 text-slate-500">{ln.paidEmis} / {ln.tenureMonths} Mo</td>
                          <td className="py-3.5 text-right pr-2">
                            {ln.outstanding > 0 ? (
                              <button
                                onClick={() => handleEmiPayment(ln.id, ln.emi)}
                                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-[10px] font-bold border border-rose-100 hover:border-rose-600 transition-all shadow-sm"
                              >
                                {t('pay_emi_btn')}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-500">{t('settled_loan')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Quick Actions Sidebars - Right 4 columns */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Action 1: Add Simulated Funds */}
            <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
                <span>{t('simulate_transfers_title')}</span>
              </h4>
              <p className="text-xs text-slate-500 leading-normal">
                {t('simulate_transfers_desc')}
              </p>

              <form onSubmit={handleAddFunds} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-450 text-xs">₹</span>
                  <input
                    type="number"
                    min={100}
                    max={100000}
                    required
                    placeholder="Enter deposit sum"
                    className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-xs font-bold text-slate-800"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(Number(e.target.value))}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isAddingFunds}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow transition-colors flex items-center justify-center space-x-1.5"
                >
                  {isAddingFunds ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>{t('transmitting_funds')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>{t('credit_savings_btn')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Action 2: Open term deposits directly */}
            <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <TrendingUp className="h-4.5 w-4.5 text-accent" />
                <span>{t('deposit_vault_title')}</span>
              </h4>

              <form onSubmit={handleOpenDeposit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Deposit Type</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-semibold text-slate-700"
                    value={depType}
                    onChange={(e) => setDepType(e.target.value as any)}
                  >
                    <option value="Fixed">Fixed Deposit (8.25% p.a.)</option>
                    <option value="Recurring">Recurring Deposit (7.75% p.a.)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Principal Outlay</label>
                  <input
                    type="number"
                    min={1000}
                    max={250000}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-800"
                    value={depAmount}
                    onChange={(e) => setDepAmount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">{t('deposit_term')}</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-semibold text-slate-700"
                    value={depDuration}
                    onChange={(e) => setDepDuration(Number(e.target.value))}
                  >
                    <option value={1}>1 Year Term</option>
                    <option value={3}>3 Year Term</option>
                    <option value={5}>5 Year Term</option>
                    <option value={10}>10 Year Term</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isOpeningDep}
                  className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold text-xs shadow transition-colors flex items-center justify-center space-x-1.5"
                >
                  {isOpeningDep ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>{t('locking_ledger')}</span>
                    </>
                  ) : (
                    <>
                      <Landmark className="h-3.5 w-3.5" />
                      <span>{t('open_dep_btn')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Action 3: Aadhaar/PAN upload mockup */}
            <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <UserCheck className="h-4.5 w-4.5 text-primary" />
                <span>{t('ekyc_node_title')}</span>
              </h4>
              <p className="text-xs text-slate-500 leading-normal">
                {t('ekyc_node_desc')}
              </p>

              {user.kycStatus === 'Verified' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold block">{t('doc_verified')}</span>
                    <span className="text-[10px] text-slate-400">{t('dig_signatures_parsed')}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleKycSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t('ekyc_doc_class')}</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-semibold text-slate-700"
                      value={kycDocType}
                      onChange={(e) => setKycDocType(e.target.value)}
                    >
                      <option value="Aadhaar">Aadhaar Card copy (12 Digit)</option>
                      <option value="PAN">PAN Card copy (10 character alphanumeric)</option>
                    </select>
                  </div>
                  
                  <div className="border border-dashed border-slate-200 p-4 rounded-xl text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">{t('browse_file_txt')}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploadingKyc}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow transition-colors flex items-center justify-center space-x-1.5"
                  >
                    {isUploadingKyc ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>{t('parsing_ekyc')}</span>
                      </>
                    ) : (
                      <span>{t('upload_ekyc_btn')}</span>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
