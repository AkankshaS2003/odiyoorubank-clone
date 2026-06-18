import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, FileCheck } from 'lucide-react';

interface DepositApplicationProps {
  setCurrentTab: (tab: string) => void;
}

const InputField = ({ label, name, type = "text", value, onChange, placeholder = "", width = "w-full" }: any) => (
  <div className={`${width} mb-3`}>
    <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-slate-800 bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent"
    />
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }: any) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-[#0F4C81] rounded border-slate-300 focus:ring-[#0F4C81] print:appearance-none print:w-4 print:h-4 print:border-2 print:border-[#0F4C81] print:rounded-sm"
    />
    <span className="text-xs font-bold text-slate-700">{label}</span>
  </label>
);

export const DepositApplication: React.FC<DepositApplicationProps> = ({ setCurrentTab }) => {
  const { user, openNewDeposit } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    depositType: '', // FD, RD, Cash Certificate
    amount: '',
    amountWords: '',
    depositPeriod: '',
    accountType: 'Single Applicant',
    
    app1MemberNo: '',
    app1Name: '',
    app1Address: '',
    app1Pincode: '',
    app1Occupation: '',
    app1Mobile: '',
    app1SmsAlert: false,
    app1Dob: '',
    app1Sex: '',

    app2MemberNo: '',
    app2Name: '',
    app2Address: '',
    app2Pincode: '',
    app2Occupation: '',
    app2Mobile: '',
    app2SmsAlert: false,
    app2Dob: '',
    app2Sex: '',

    modeOfOperation: '',
    standingInstructions: '',
    
    date: new Date().toISOString().split('T')[0],
    place: '',

    nomineeName: '',
    nomineeAddress: '',
    nomineeRelationship: '',
    guardianName: '',
    minorDob: '',

    introducerName: '',
    introducerAccountNo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Auto-fill applicant details if Member Number matches Customer ID
        if (name === 'app1MemberNo' && user?.customerId && value === user.customerId) {
          newData.app1Name = user.fullName || '';
          newData.app1Address = user.address || '';
          newData.app1Mobile = user.phone || '';
          newData.app1Dob = user.dob || '';
        }
        
        return newData;
      });
    }
  };

  const handleDepositTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, depositType: type }));
  };

  const handleModeChange = (mode: string) => {
    setFormData(prev => ({ ...prev, modeOfOperation: mode }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.depositPeriod || !formData.depositType) {
      alert("Please fill in Deposit Type, Amount, and Period");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate network delay / backend submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="bg-slate-50 min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full text-center animate-scale-up">
          <div className="mx-auto h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <FileCheck className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 mb-8">
            Your application for <strong>{formData.depositType}</strong> of ₹{Number(formData.amount).toLocaleString('en-IN')} has been successfully received by the cooperative society.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">Application Progress</h3>
            <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span>Application Received</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Document Verification</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Account Activation</span>
            </div>
          </div>

          <button 
            onClick={() => setCurrentTab('dashboard')}
            className="w-full py-4 bg-[#0F4C81] text-white rounded-xl font-bold shadow-lg shadow-[#0F4C81]/20 hover:bg-[#0F4C81]/90 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white text-slate-800">
      <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-black text-[#0F4C81]">Fixed/Recurring Deposit Application</h1>
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-[#0F4C81]/20">
            <Printer className="w-4 h-4" /> Print Form
          </button>
        </div>

        {/* Paper Document Container */}
        <div className="bg-white p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100 print:shadow-none print:border-none print:p-2">
          
          {/* HEADER SECTION */}
          <div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-6">
            <div className="text-center flex-grow px-4">
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-[#0F4C81] uppercase">ODIYOORU CREDIT CO-OPERATIVE SOCIETY LTD.</h1>
              <p className="text-[#0F4C81]/80 text-[10px] font-bold tracking-widest mt-1">TRUSTED BANKING FOR EVERY FAMILY</p>
              <h2 className="mt-3 inline-block bg-[#0F4C81] text-white px-4 py-1 rounded text-sm font-bold tracking-widest uppercase print:border print:border-[#0F4C81] print:text-[#0F4C81] print:bg-white">Application Form for Deposit</h2>
            </div>
            <div className="text-right text-[10px] font-bold space-y-2 w-40 shrink-0">
              <div className="flex justify-end items-center gap-2"><span>Branch:</span> <input type="text" value="Main Branch" readOnly className="w-24 border-b border-slate-400 outline-none print:border-slate-800 bg-transparent text-right text-slate-600"/></div>
              <div className="flex justify-end items-center gap-2"><span>A/C No:</span> <input type="text" value={user?.accountNumber || 'Not Assigned'} readOnly className="w-24 border-b border-slate-400 outline-none print:border-slate-800 bg-transparent text-right text-slate-600"/></div>
              <div className="flex justify-end items-center gap-2"><span>Cust ID:</span> <input type="text" value={user?.customerId || ''} readOnly className="w-24 border-b border-slate-400 outline-none print:border-slate-800 bg-transparent text-right text-slate-600"/></div>
            </div>
          </div>

          {/* DEPOSIT TYPE SECTION */}
          <div className="flex justify-center gap-8 mb-6 p-3 bg-[#EAF6FF] rounded-lg print:bg-transparent print:border print:border-slate-300">
            {['Fixed Deposit', 'Recurring Deposit'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.depositType === type} onChange={() => handleDepositTypeChange(type)} className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81] print:appearance-none print:border-2 print:border-[#0F4C81] print:w-4 print:h-4"/>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F4C81]">{type}</span>
              </label>
            ))}
          </div>

          {/* DEPOSIT DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <InputField label="Amount (₹)" name="amount" type="number" value={formData.amount} onChange={handleChange} />
            <div className="md:col-span-2"><InputField label="Amount in Words" name="amountWords" value={formData.amountWords} onChange={handleChange} /></div>
            <div className="md:col-span-1">
              <div className="w-full mb-3">
                <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Period of Deposit</label>
                <select name="depositPeriod" value={formData.depositPeriod} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-slate-800 bg-white">
                  <option value="">Select Period</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* ACCOUNT TYPE TOGGLE */}
          <div className="flex justify-center gap-8 mb-6 p-3 bg-slate-100 rounded-lg print:hidden">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="accountType" value="Single Applicant" checked={formData.accountType === 'Single Applicant'} onChange={handleChange} className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F4C81]">Single Applicant</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="accountType" value="Joint Applicant" checked={formData.accountType === 'Joint Applicant'} onChange={handleChange} className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F4C81]">Joint Applicant</span>
            </label>
          </div>

          {/* APPLICANT SECTIONS */}
          <div className={`grid grid-cols-1 ${formData.accountType === 'Joint Applicant' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8 mb-6`}>
            {/* FIRST APPLICANT */}
            <div className="border border-slate-200 rounded-xl p-4 print:border-slate-400">
              <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase">1st Applicant Details</h3>
              <div className="space-y-1">
                <InputField label="Member Number" name="app1MemberNo" value={formData.app1MemberNo} onChange={handleChange} />
                <InputField label="Full Name" name="app1Name" value={formData.app1Name} onChange={handleChange} />
                <InputField label="Address" name="app1Address" value={formData.app1Address} onChange={handleChange} />
                <InputField label="Pincode" name="app1Pincode" value={formData.app1Pincode} onChange={handleChange} />
                <InputField label="Occupation" name="app1Occupation" value={formData.app1Occupation} onChange={handleChange} />
                <InputField label="Mobile Number" name="app1Mobile" value={formData.app1Mobile} onChange={handleChange} />
                <div className="flex gap-4 items-center mb-3">
                  <span className="text-[10px] font-bold text-[#0F4C81] uppercase">SMS Alert Required:</span>
                  <CheckboxField label="Yes" name="app1SmsAlert" checked={formData.app1SmsAlert} onChange={handleChange} />
                  <CheckboxField label="No" name="app1SmsAlertNo" checked={!formData.app1SmsAlert} onChange={() => setFormData(prev => ({ ...prev, app1SmsAlert: false }))} />
                </div>
                <InputField label="Date of Birth" name="app1Dob" type="date" value={formData.app1Dob} onChange={handleChange} />
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] font-bold text-[#0F4C81] uppercase">Sex:</span>
                  <label className="text-xs font-bold flex items-center gap-1"><input type="radio" name="app1Sex" value="Male" onChange={handleChange} className="print:appearance-none print:border-2 print:border-slate-800 print:w-3 print:h-3"/> Male</label>
                  <label className="text-xs font-bold flex items-center gap-1"><input type="radio" name="app1Sex" value="Female" onChange={handleChange} className="print:appearance-none print:border-2 print:border-slate-800 print:w-3 print:h-3"/> Female</label>
                </div>
              </div>
            </div>

            {/* SECOND APPLICANT */}
            {formData.accountType === 'Joint Applicant' && (
              <div className="border border-slate-200 rounded-xl p-4 print:border-slate-400">
                <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase">2nd Applicant Details</h3>
                <div className="space-y-1">
                  <InputField label="Member Number" name="app2MemberNo" value={formData.app2MemberNo} onChange={handleChange} />
                  <InputField label="Full Name" name="app2Name" value={formData.app2Name} onChange={handleChange} />
                  <InputField label="Address" name="app2Address" value={formData.app2Address} onChange={handleChange} />
                  <InputField label="Pincode" name="app2Pincode" value={formData.app2Pincode} onChange={handleChange} />
                  <InputField label="Occupation" name="app2Occupation" value={formData.app2Occupation} onChange={handleChange} />
                  <InputField label="Mobile Number" name="app2Mobile" value={formData.app2Mobile} onChange={handleChange} />
                  <div className="flex gap-4 items-center mb-3">
                    <span className="text-[10px] font-bold text-[#0F4C81] uppercase">SMS Alert Required:</span>
                    <CheckboxField label="Yes" name="app2SmsAlert" checked={formData.app2SmsAlert} onChange={handleChange} />
                    <CheckboxField label="No" name="app2SmsAlertNo" checked={!formData.app2SmsAlert} onChange={() => setFormData(prev => ({ ...prev, app2SmsAlert: false }))} />
                  </div>
                  <InputField label="Date of Birth" name="app2Dob" type="date" value={formData.app2Dob} onChange={handleChange} />
                  <div className="flex gap-4 items-center">
                    <span className="text-[10px] font-bold text-[#0F4C81] uppercase">Sex:</span>
                    <label className="text-xs font-bold flex items-center gap-1"><input type="radio" name="app2Sex" value="Male" onChange={handleChange} className="print:appearance-none print:border-2 print:border-slate-800 print:w-3 print:h-3"/> Male</label>
                    <label className="text-xs font-bold flex items-center gap-1"><input type="radio" name="app2Sex" value="Female" onChange={handleChange} className="print:appearance-none print:border-2 print:border-slate-800 print:w-3 print:h-3"/> Female</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MODE OF PAYMENT / OPERATION */}
          <div className="mb-6 border-t-2 border-slate-200 pt-4 print:border-slate-400">
            <h3 className="text-xs font-black text-[#0F4C81] uppercase tracking-wider mb-4">Mode of Payment / Operation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4">
              {[
                'Self', 'Either or Survivor', 'First Depositor Only', 'To All Depositors Jointly',
                'Any 2 Authorised Signatories Jointly', 'Any 3 Authorised Signatories Jointly',
                'No.1 Jointly with Any Authorised Signatory', 'Secretary & Treasurer'
              ].map(mode => (
                <label key={mode} className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.modeOfOperation === mode} onChange={() => handleModeChange(mode)} className="w-4 h-4 mt-0.5 text-[#0F4C81] rounded border-slate-300 print:appearance-none print:border-2 print:border-slate-800 print:w-3 print:h-3" />
                  <span className="text-[10px] font-bold leading-tight">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* STANDING INSTRUCTION SECTION */}
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Standing Instructions (If any)</label>
            <textarea name="standingInstructions" value={formData.standingInstructions} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm resize-none print:border-slate-400 print:rounded-none"></textarea>
          </div>

          {/* NOMINATION SECTION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-4 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase">Nomination (Form DA 1)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Name of Nominee" name="nomineeName" value={formData.nomineeName} onChange={handleChange} />
              <InputField label="Relationship with Depositor" name="nomineeRelationship" value={formData.nomineeRelationship} onChange={handleChange} />
              <div className="md:col-span-2">
                <InputField label="Address of Nominee" name="nomineeAddress" value={formData.nomineeAddress} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* DATE & PLACE + SIGNATURES */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 mt-12 gap-8">
            <div className="space-y-4 w-full md:w-1/3">
              <InputField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} />
              <InputField label="Place" name="place" value={formData.place} onChange={handleChange} />
            </div>
            <div className="flex-grow flex flex-col justify-end gap-4 text-center w-full">
              <div className="flex justify-end gap-8">
                <div className="w-40 border-t border-slate-800 pt-2 text-[10px] font-bold">1st Depositor Signature</div>
                {formData.accountType === 'Joint Applicant' && (
                  <div className="w-40 border-t border-slate-800 pt-2 text-[10px] font-bold">2nd Depositor Signature</div>
                )}
              </div>
              <div className="flex justify-end gap-8 mt-6">
                <div className="w-full max-w-[320px] text-left">
                  <label className="block text-[10px] font-bold text-[#0F4C81] mb-2 uppercase tracking-wider">Upload Digital Signature (Required)</label>
                  <input type="file" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EAF6FF] file:text-[#0F4C81] hover:file:bg-[#d6efff] transition-all cursor-pointer"/>
                </div>
              </div>
            </div>
          </div>

          {/* INTRODUCER SECTION REMOVED */}

          <div className="flex justify-end mt-12 pt-8 border-t border-slate-200 print:hidden">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
