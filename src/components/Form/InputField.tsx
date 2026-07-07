import React from 'react';

export const InputField = ({ label, name, type = "text", value, onChange, placeholder = "", width = "w-full", readOnly = false, required = false, error, note, step }: any) => {
  return (
    <div className={`relative ${width}`}>
      <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-1 text-sm">*</span>}
      </label>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        step={step}
        className={`w-full h-[42px] px-3 py-2 border ${error ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent ${readOnly ? 'bg-slate-50' : ''} ${type === 'date' ? 'appearance-none' : ''}`}
      />
      {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
