import React, { useState } from 'react';
import { User, Wallet, Briefcase, IndianRupee, RotateCcw, CheckCircle2, ChevronDown } from 'lucide-react';

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

const FloatingInput = ({ 
  type = "text", name, value, onChange, label, icon: Icon, min, max, placeholder=" " 
}: any) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <input 
        required 
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        min={min}
        max={max}
        placeholder={placeholder}
        onWheel={(e) => type === 'number' && (e.target as HTMLElement).blur()}
        className={`w-full px-4 py-3.5 ${Icon ? 'pl-11' : ''} rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-slate-50 hover:bg-slate-100/50 focus:bg-white transition-all peer text-slate-700 font-medium`} 
      />
      <label className={`absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 ${Icon ? 'left-10 peer-focus:left-3 peer-placeholder-shown:bg-transparent peer-focus:bg-white peer-valid:bg-white peer-valid:left-3' : 'left-3'}`}>
        {label}
      </label>
    </div>
  );
};

const FloatingSelect = ({ 
  name, value, onChange, label, options, icon: Icon 
}: any) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        className={`w-full px-4 py-3.5 ${Icon ? 'pl-11' : ''} pr-10 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-slate-50 hover:bg-slate-100/50 focus:bg-white transition-all peer text-slate-700 font-medium appearance-none cursor-pointer`}
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
        <ChevronDown className="h-5 w-5" />
      </div>
      <label className={`absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-primary left-3`}>
        {label}
      </label>
    </div>
  );
};

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
    loanType: 'Personal Loan',
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
      loanType: 'Personal Loan',
      desiredAmount: '',
      loanTenure: '',
    });
  };

  const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center space-x-3 mb-6 pb-3 border-b-2 border-slate-100">
      <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 text-primary rounded-xl shadow-inner">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h3>
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50">
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Personal Information */}
        <section>
          <SectionTitle title="Personal Information" icon={User} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FloatingInput 
              name="fullName" value={formData.fullName} onChange={handleChange} 
              label="Full Name" icon={User} 
            />
            <FloatingInput 
              type="number" name="age" value={formData.age} onChange={handleChange} 
              label="Age (Years)" min="18" max="80" 
            />
            <FloatingSelect 
              name="gender" value={formData.gender} onChange={handleChange} 
              label="Gender" options={['Male', 'Female', 'Other']}
            />
            <FloatingSelect 
              name="occupation" value={formData.occupation} onChange={handleChange} 
              label="Occupation" options={['Farmer', 'Government Employee', 'Private Employee', 'Self Employed', 'Business Owner', 'Student']}
            />
          </div>
        </section>

        {/* Financial Information */}
        <section>
          <SectionTitle title="Financial Information" icon={Wallet} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FloatingInput 
              type="number" name="income" value={formData.income} onChange={handleChange} 
              label="Monthly Income" icon={IndianRupee} min="0" 
            />
            <FloatingInput 
              type="number" name="existingEmi" value={formData.existingEmi} onChange={handleChange} 
              label="Existing EMI" icon={IndianRupee} min="0" 
            />
            <FloatingInput 
              type="number" name="expenses" value={formData.expenses} onChange={handleChange} 
              label="Monthly Expenses" icon={IndianRupee} min="0" 
            />
            <FloatingInput 
              type="number" name="savings" value={formData.savings} onChange={handleChange} 
              label="Monthly Savings" icon={IndianRupee} min="0" 
            />
          </div>
        </section>

        {/* Loan Information */}
        <section>
          <SectionTitle title="Loan Requirements" icon={Briefcase} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <FloatingSelect 
                name="loanType" value={formData.loanType} onChange={handleChange} 
                label="Desired Loan Type" options={['Personal Loan', 'Gold Loan', 'Vehicle Loan', 'Educational Loan', 'Housing Loan', 'Agricultural Loan']}
                icon={Briefcase}
              />
            </div>
            <FloatingInput 
              type="number" name="desiredAmount" value={formData.desiredAmount} onChange={handleChange} 
              label="Loan Amount Needed" icon={IndianRupee} min="1000" 
            />
            <FloatingInput 
              type="number" name="loanTenure" value={formData.loanTenure} onChange={handleChange} 
              label="Loan Tenure (Years)" min="1" max="30" 
            />
          </div>
        </section>

        <div className="pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center space-x-2 transition-colors focus:ring-4 focus:ring-slate-100 outline-none"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Reset Form</span>
          </button>
          <button
            type="submit"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 transition-all focus:ring-4 focus:ring-primary/30 outline-none w-full sm:w-auto"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Check Eligibility</span>
          </button>
        </div>

      </form>
    </div>
  );
};
