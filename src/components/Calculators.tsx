import React, { useState } from 'react';
import { ShieldCheck, Percent, ArrowUpRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Calculators: React.FC = () => {
  const { t } = useLanguage();
  const [activeCalc, setActiveCalc] = useState<'emi' | 'fd' | 'rd' | 'eligibility'>('emi');

  // EMI State
  const [emiPrincipal, setEmiPrincipal] = useState<number>(500000);
  const [emiRate, setEmiRate] = useState<number>(8.5);
  const [emiTenure, setEmiTenure] = useState<number>(36); // Months

  // FD State
  const [fdPrincipal, setFdPrincipal] = useState<number>(100000);
  const [fdRate, setFdRate] = useState<number>(8.25);
  const [fdYears, setFdYears] = useState<number>(5);

  // RD State
  const [rdMonthly, setRdMonthly] = useState<number>(5000);
  const [rdRate, setRdRate] = useState<number>(7.75);
  const [rdYears, setRdYears] = useState<number>(3);

  // Eligibility State
  const [salary, setSalary] = useState<number>(60000);
  const [obligations, setObligations] = useState<number>(10000);
  const [eligTenure, setEligTenure] = useState<number>(240); // Months
  const [eligRate, setEligRate] = useState<number>(8.25);

  // --- EMI Calculation Logic ---
  const calculateEmi = () => {
    const P = emiPrincipal;
    const r = emiRate / 12 / 100;
    const n = emiTenure;
    
    if (r === 0) return { emi: Math.round(P / n), interest: 0, total: P };

    const emi = Math.round(
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    );
    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;

    return {
      emi,
      interest: Math.max(0, totalInterest),
      total: totalPayable
    };
  };

  // --- FD Calculation Logic ---
  const calculateFd = () => {
    const P = fdPrincipal;
    const r = fdRate / 100;
    const t = fdYears;
    const n = 4; // Quarterly compounding

    const maturityValue = Math.round(P * Math.pow(1 + r / n, n * t));
    const interestEarned = maturityValue - P;

    return {
      interest: Math.max(0, interestEarned),
      total: maturityValue
    };
  };

  // --- RD Calculation Logic ---
  const calculateRd = () => {
    const P = rdMonthly;
    const r = rdRate / 100;
    const t = rdYears;
    const months = t * 12;
    
    let totalDeposited = P * months;
    let maturityValue = 0;
    
    for (let i = 1; i <= months; i++) {
      const tRemainder = (months - i + 1) / 12;
      maturityValue += P * Math.pow(1 + r / 4, 4 * tRemainder);
    }
    
    maturityValue = Math.round(maturityValue);
    const interestEarned = maturityValue - totalDeposited;

    return {
      deposited: totalDeposited,
      interest: Math.max(0, interestEarned),
      total: maturityValue
    };
  };

  // --- Eligibility Calculation Logic ---
  const calculateEligibility = () => {
    const maxFOIR = 0.50; 
    const disposableIncome = salary - obligations;
    const maxAllowedEmi = Math.max(0, salary * maxFOIR - obligations);
    
    const r = eligRate / 12 / 100;
    const n = eligTenure;

    if (maxAllowedEmi <= 0) return { loanAmount: 0, emi: 0 };

    const maxLoanAmount = Math.round(
      (maxAllowedEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
    );

    return {
      loanAmount: maxLoanAmount,
      emi: Math.round(maxAllowedEmi)
    };
  };

  const emiRes = calculateEmi();
  const fdRes = calculateFd();
  const rdRes = calculateRd();
  const eligRes = calculateEligibility();

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{t('financial_tools')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {t('interactive_calcs')}
          </h2>
          <p className="text-slate-600">
            {t('calcs_desc')}
          </p>

          {/* Calculator Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl mt-8">
            <button
              onClick={() => setActiveCalc('emi')}
              className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCalc === 'emi' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {t('loan_emi_tab')}
            </button>
            <button
              onClick={() => setActiveCalc('fd')}
              className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCalc === 'fd' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {t('fd_tab')}
            </button>
            <button
              onClick={() => setActiveCalc('rd')}
              className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCalc === 'rd' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {t('rd_tab')}
            </button>
            <button
              onClick={() => setActiveCalc('eligibility')}
              className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCalc === 'eligibility' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {t('elig_tab')}
            </button>
          </div>
        </div>

        {/* Calculator Widget Panel */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-100/30">
          
          {/* ==================================================== */}
          {/* 1. EMI CALCULATOR */}
          {/* ==================================================== */}
          {activeCalc === 'emi' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Sliders Left */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('loan_principal')}</label>
                    <span className="text-primary font-bold text-lg">₹{emiPrincipal.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={2500000}
                    step={10000}
                    value={emiPrincipal}
                    onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>₹10,000</span>
                    <span>₹25 Lakhs</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('interest_rate')}</label>
                    <span className="text-primary font-bold text-lg">{emiRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={18}
                    step={0.1}
                    value={emiRate}
                    onChange={(e) => setEmiRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>5%</span>
                    <span>18%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('tenure_months')}</label>
                    <span className="text-primary font-bold text-lg">{emiTenure}</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={120}
                    step={6}
                    value={emiTenure}
                    onChange={(e) => setEmiTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>6 Months</span>
                    <span>120 Months</span>
                  </div>
                </div>
              </div>

              {/* Calculations Right */}
              <div className="lg:col-span-5 bg-white border border-slate-150 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t('est_monthly_emi')}</span>
                    <span className="text-3xl font-extrabold text-primary">₹{emiRes.emi.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('principal_amt')}</span>
                      <span className="font-semibold text-slate-800">₹{emiPrincipal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('total_interest')}</span>
                      <span className="font-semibold text-primary">₹{emiRes.interest.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                      <span className="text-slate-700 font-bold">{t('total_payable')}</span>
                      <span className="font-bold text-slate-900">₹{emiRes.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-400 leading-normal">
                  <Percent className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{t('emi_pie_info')}</span>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* 2. FD CALCULATOR */}
          {/* ==================================================== */}
          {activeCalc === 'fd' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Sliders Left */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('deposit_amt')}</label>
                    <span className="text-primary font-bold text-lg">₹{fdPrincipal.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={1000000}
                    step={5000}
                    value={fdPrincipal}
                    onChange={(e) => setFdPrincipal(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>₹5,000</span>
                    <span>₹10 Lakhs</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('interest_rate')}</label>
                    <span className="text-primary font-bold text-lg">{fdRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={4.5}
                    max={9.5}
                    step={0.05}
                    value={fdRate}
                    onChange={(e) => setFdRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>4.5%</span>
                    <span>9.5%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('tenure_years')}</label>
                    <span className="text-primary font-bold text-lg">{fdYears}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={fdYears}
                    onChange={(e) => setFdYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>1 Year</span>
                    <span>10 Years</span>
                  </div>
                </div>
              </div>

              {/* Calculations Right */}
              <div className="lg:col-span-5 bg-white border border-slate-150 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t('maturity_wealth')}</span>
                    <span className="text-3xl font-extrabold text-accent">₹{fdRes.total.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('invested_capital')}</span>
                      <span className="font-semibold text-slate-800">₹{fdPrincipal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('compound_acquired')}</span>
                      <span className="font-semibold text-accent">₹{fdRes.interest.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                      <span className="text-slate-700 font-bold">{t('total_wealth')}</span>
                      <span className="font-bold text-slate-900">₹{fdRes.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-400 leading-normal bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <ArrowUpRight className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-slate-650">{t('fd_rate_info')}</span>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* 3. RD CALCULATOR */}
          {/* ==================================================== */}
          {activeCalc === 'rd' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Sliders Left */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('monthly_contrib')}</label>
                    <span className="text-primary font-bold text-lg">₹{rdMonthly.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={50000}
                    step={500}
                    value={rdMonthly}
                    onChange={(e) => setRdMonthly(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>₹500</span>
                    <span>₹50,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('interest_rate')}</label>
                    <span className="text-primary font-bold text-lg">{rdRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={4.5}
                    max={9.0}
                    step={0.05}
                    value={rdRate}
                    onChange={(e) => setRdRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>4.5%</span>
                    <span>9.0%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('duration_years')}</label>
                    <span className="text-primary font-bold text-lg">{rdYears}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={rdYears}
                    onChange={(e) => setRdYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>1 Year</span>
                    <span>10 Years</span>
                  </div>
                </div>
              </div>

              {/* Calculations Right */}
              <div className="lg:col-span-5 bg-white border border-slate-150 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t('est_wealth_maturity')}</span>
                    <span className="text-3xl font-extrabold text-accent">₹{rdRes.total.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('total_outlay')}</span>
                      <span className="font-semibold text-slate-800">₹{rdRes.deposited.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('interest_earned')}</span>
                      <span className="font-semibold text-accent">₹{rdRes.interest.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                      <span className="text-slate-700 font-bold">{t('maturity_value')}</span>
                      <span className="font-bold text-slate-900">₹{rdRes.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-400 leading-normal">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{t('rd_auto_info')}</span>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* 4. LOAN ELIGIBILITY CALCULATOR */}
          {/* ==================================================== */}
          {activeCalc === 'eligibility' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Sliders Left */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('net_salary')}</label>
                    <span className="text-primary font-bold text-lg">₹{salary.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={300000}
                    step={2000}
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>₹10,000</span>
                    <span>₹3 Lakhs</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('existing_emi')}</label>
                    <span className="text-primary font-bold text-lg">₹{obligations.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150000}
                    step={1000}
                    value={obligations}
                    onChange={(e) => setObligations(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>₹0 (None)</span>
                    <span>₹1.5 Lakhs</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label className="text-slate-500">{t('desired_tenure')}</label>
                    <span className="text-primary font-bold text-lg">{eligTenure}</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={360}
                    step={12}
                    value={eligTenure}
                    onChange={(e) => setEligTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>12 Months</span>
                    <span>360 Months</span>
                  </div>
                </div>
              </div>

              {/* Calculations Right */}
              <div className="lg:col-span-5 bg-white border border-slate-150 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t('est_eligible_loan')}</span>
                    <span className="text-3xl font-extrabold text-primary">₹{eligRes.loanAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('max_allowed_emi')}</span>
                      <span className="font-semibold text-slate-800">₹{eligRes.emi.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('debt_to_income')}</span>
                      <span className={`font-semibold ${obligations / salary > 0.4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {Math.round((obligations / salary) * 100 || 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                      <span className="text-slate-700 font-bold">{t('loan_status')}</span>
                      <span className={`font-bold ${eligRes.loanAmount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {eligRes.loanAmount > 0 ? t('loan_eligible') : t('loan_leveraged')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-400 leading-normal">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>{t('loan_verify_info')}</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
