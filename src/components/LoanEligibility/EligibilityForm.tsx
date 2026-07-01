import React, { useState } from 'react';
import { User, Wallet, Briefcase, IndianRupee, RotateCcw, CheckCircle2 } from 'lucide-react';

export interface LoanRequestData {
  fullName: string;
  age: number | '';
  gender: string;
  occupation: string;
  income: number | '';
  existingEmi: number | '';
  expenses: number | '';
  savings: number | '';
  loanType: string;
  desiredAmount: number | '';
  loanTenure: number | '';
}

interface EligibilityFormProps {
  onSubmit: (data: LoanRequestData) => void;
}

export const EligibilityForm: React.FC<EligibilityFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<LoanRequestData>({
    fullName: '',
    age: '',
    gender: 'Male',
    occupation: 'Private Employee',
    income: '',
    existingEmi: '',
    expenses: '',
    savings: '',
    loanType: 'Gold Loan',
    desiredAmount: '',
    loanTenure: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      age: '',
      gender: 'Male',
      occupation: 'Private Employee',
      income: '',
      existingEmi: '',
      expenses: '',
      savings: '',
      loanType: 'Gold Loan',
      desiredAmount: '',
      loanTenure: '',
    });
  };

  const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-slate-100">
      <div className="p-2 bg-primary/10 text-primary rounded-lg">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50">
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Personal Information */}
        <section>
          <SectionTitle title="Personal Information" icon={User} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Full Name</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all" placeholder="" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Age</label>
              <input required type="number" name="age" min="18" max="80" value={formData.age} onChange={handleChange} onWheel={(e) => (e.target as HTMLElement).blur()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Occupation</label>
              <select name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all">
                <option value="Farmer">Farmer</option>
                <option value="Government Employee">Government Employee</option>
                <option value="Private Employee">Private Employee</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Student">Student</option>
              </select>
            </div>
          </div>
        </section>

        {/* Financial Information */}
        <section>
          <SectionTitle title="Financial Information" icon={Wallet} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Monthly Income (₹)</label>
              <input required type="number" name="income" min="0" value={formData.income} onChange={handleChange} onWheel={(e) => (e.target as HTMLElement).blur()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Existing EMI (₹)</label>
              <input required type="number" name="existingEmi" min="0" value={formData.existingEmi} onChange={handleChange} onWheel={(e) => (e.target as HTMLElement).blur()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Monthly Expenses (₹)</label>
              <input required type="number" name="expenses" min="0" value={formData.expenses} onChange={handleChange} onWheel={(e) => (e.target as HTMLElement).blur()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Savings Amount (₹)</label>
              <input required type="number" name="savings" min="0" value={formData.savings} onChange={handleChange} onWheel={(e) => (e.target as HTMLElement).blur()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all" />
            </div>
          </div>
        </section>

        {/* Loan Information */}
        <section>
          <SectionTitle title="Loan Requirements" icon={Briefcase} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Loan Type</label>
              <select name="loanType" value={formData.loanType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all">
                <option value="Gold Loan">Gold Loan</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Educational Loan">Educational Loan</option>
                <option value="Housing Loan">Housing Loan</option>
                <option value="Agricultural Loan">Agricultural Loan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Desired Amount (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-slate-400" />
                </div>
                <input required type="number" name="desiredAmount" min="1000" value={formData.desiredAmount} onChange={handleChange} onWheel={(e) => (e.target as HTMLElement).blur()} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Loan Tenure (Years)</label>
              <input required type="number" name="loanTenure" min="1" max="30" value={formData.loanTenure} onChange={handleChange} onWheel={(e) => (e.target as HTMLElement).blur()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 transition-all" />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Reset Form</span>
          </button>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 transition-all"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Check Eligibility</span>
          </button>
        </div>

      </form>
    </div>
  );
};
