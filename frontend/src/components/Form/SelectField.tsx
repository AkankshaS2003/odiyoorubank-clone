import React from 'react';
import { ChevronDown } from 'lucide-react';

export const SelectField = ({ label, name, value, onChange, options, width = "w-full", required = false, error }: any) => {
  return (
    <div className={`relative ${width}`}>
      <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-1 text-sm">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full h-[42px] px-3 py-2 border ${error ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] bg-white appearance-none print:appearance-none print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent`}
        >
          <option value="" disabled>Select Option</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F4C81] pointer-events-none print:hidden" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
