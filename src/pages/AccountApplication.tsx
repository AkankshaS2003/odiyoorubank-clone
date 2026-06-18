import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, ChevronRight, ChevronLeft, Save, FileDown, CheckCircle, Send, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PaymentGatewayModal } from '../components/PaymentGatewayModal';

interface AccountApplicationProps {
  setCurrentTab: (tab: string) => void;
}

const THEME = {
  blue: '#0F4C81',
  lightBlue: '#EAF6FF',
  white: '#FFFFFF'
};

const InputField = ({ label, name, type = "text", required = false, width = "w-full", placeholder = "", formData, handleChange, error }: any) => (
  <div className={`${width} mb-4`}>
    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border ${error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'} rounded-xl focus:ring-2 focus:border-primary outline-none transition-all text-sm font-medium text-slate-800 bg-white`}
    />
    {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
  </div>
);

const FileUploadBox = ({ label, field, accept = "image/*", uploads, handleFileUpload, error }: any) => (
  <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'} rounded-xl transition-colors cursor-pointer relative overflow-hidden group w-full h-full`}>
    <input type="file" accept={accept} onChange={handleFileUpload(field)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
    {uploads[field] ? (
      <div className="text-center">
        <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
        <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] block">{uploads[field]}</span>
      </div>
    ) : (
      <div className="text-center group-hover:scale-105 transition-transform">
        <Upload className={`w-6 h-6 mx-auto mb-1 opacity-70 ${error ? 'text-red-400' : 'text-primary'}`} />
        <span className={`text-xs font-bold opacity-70 ${error ? 'text-red-500' : 'text-primary'}`}>{label}</span>
      </div>
    )}
  </div>
);

export const AccountApplication: React.FC<AccountApplicationProps> = ({ setCurrentTab }) => {
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const defaultFormData = {
    date: new Date().toISOString().split('T')[0],
    branch: '',
    applicantFullName: user?.fullName || '',
    residentialAddress: user?.address || '',
    occupationAddress: '',
    mobileNumber: user?.phone || '',
    emailId: user?.email || '',
    panNumber: user?.pan || '',
    aadhaarNumber: user?.aadhaar || '',
    dob: user?.dob || '',
    seniorCitizen: 'No',
    minor: 'No',
    
    hasJointApplicant: false,
    jointApplicantName: '',
    jointResidentialAddress: '',
    jointOccupationAddress: '',
    jointMobileNumber: '',
    jointEmailId: '',
    jointPanNumber: '',
    jointDob: '',
    
    modeOfOperation: 'Self',

    nomineeName: '',
    nomineeAddress: '',
    nomineeRelationship: '',
    nomineeDob: '',
    
    isNomineeMinor: false,
    guardianName: '',
    guardianRelationship: '',
    guardianAddress: '',
    
    witnessName: '',
    witnessAddress: '',
    
    introducerName: '',
    introducerAccountNumber: '',
    introducerBranch: '',
    introducerContactNumber: '',
    
    initialDepositAmount: '500'
  };

  const [formData, setFormData] = useState(defaultFormData);
  
  const [uploads, setUploads] = useState<{ [key: string]: string | null }>({
    applicantPhoto: null,
    applicantSignature: null,
    jointPhoto: null,
    jointSignature: null,
    nomineePhoto: null,
    witnessSignature: null,
    introducerSignature: null
  });

  useEffect(() => {
    const draft = localStorage.getItem('odiyooru_account_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.uploads) setUploads(parsed.uploads);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveDraft = () => {
    localStorage.setItem('odiyooru_account_draft', JSON.stringify({ formData, uploads }));
    alert('Draft saved securely!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploads(prev => ({ ...prev, [field]: e.target.files![0].name }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    }
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.applicantFullName) newErrors.applicantFullName = 'Required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Required';
    if (!formData.panNumber) newErrors.panNumber = 'Required';
    if (!formData.aadhaarNumber) newErrors.aadhaarNumber = 'Required';
    if (!formData.dob) newErrors.dob = 'Required';
    if (!formData.residentialAddress) newErrors.residentialAddress = 'Required';
    if (!formData.occupationAddress) newErrors.occupationAddress = 'Required';
    
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format';
    }
    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber.replace(/\s/g, ''))) {
      newErrors.aadhaarNumber = 'Invalid Aadhaar (12 digits required)';
    }

    if (!uploads.applicantPhoto) newErrors.applicantPhoto = 'Photo required';
    if (!uploads.applicantSignature) newErrors.applicantSignature = 'Signature required';

    if (formData.hasJointApplicant) {
      if (!formData.jointApplicantName) newErrors.jointApplicantName = 'Required';
      if (!formData.jointMobileNumber) newErrors.jointMobileNumber = 'Required';
      if (!formData.jointPanNumber) newErrors.jointPanNumber = 'Required';
      if (!formData.jointDob) newErrors.jointDob = 'Required';
      if (!formData.jointResidentialAddress) newErrors.jointResidentialAddress = 'Required';

      if (formData.jointPanNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.jointPanNumber)) {
        newErrors.jointPanNumber = 'Invalid PAN format';
      }
      
      if (!uploads.jointPhoto) newErrors.jointPhoto = 'Photo required';
      if (!uploads.jointSignature) newErrors.jointSignature = 'Signature required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.nomineeName) newErrors.nomineeName = 'Required';
    if (!formData.nomineeRelationship) newErrors.nomineeRelationship = 'Required';
    if (!formData.nomineeDob) newErrors.nomineeDob = 'Required';
    if (!formData.nomineeAddress) newErrors.nomineeAddress = 'Required';
    if (!uploads.nomineePhoto) newErrors.nomineePhoto = 'Photo required';

    if (formData.isNomineeMinor) {
      if (!formData.guardianName) newErrors.guardianName = 'Required';
      if (!formData.guardianRelationship) newErrors.guardianRelationship = 'Required';
      if (!formData.guardianAddress) newErrors.guardianAddress = 'Required';
    }

    // Removed witness and introducer validations

    if (!formData.initialDepositAmount || Number(formData.initialDepositAmount) < 500) {
      newErrors.initialDepositAmount = 'Minimum ₹500 is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(prev => Math.min(prev + 1, 3));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) {
      setShowPaymentGateway(true);
    }
  };

  const handlePaymentSuccess = () => {
    localStorage.removeItem('odiyooru_account_draft');
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-300">
          <div className="w-20 h-20 bg-[#EAF6FF] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#0F4C81]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-8 text-sm">Your Account Opening Form has been successfully securely transmitted to ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD You will receive an SMS confirmation shortly.</p>
          <button onClick={() => setCurrentTab('dashboard')} className="px-8 py-3 bg-[#0F4C81] hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg transition-colors">
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white">
      {showPaymentGateway && <PaymentGatewayModal onClose={() => setShowPaymentGateway(false)} onConfirm={handlePaymentSuccess} amount={Number(formData.initialDepositAmount)} />}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Bar (Hidden on Print) */}
        <div className="mb-8 print:hidden">
          <div className="flex justify-end items-center mb-4">
            <div className="flex gap-3">
              <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#EAF6FF] text-[#0F4C81] rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors shadow-sm">
                <FileDown className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#0F4C81] rounded-full z-0 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm border-4 transition-colors ${step >= num ? 'bg-[#0F4C81] border-[#EAF6FF] text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                {num}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-bold text-gray-500 px-1">
            <span className={step >= 1 ? 'text-[#0F4C81]' : ''}>Applicant Info</span>
            <span className={step >= 2 ? 'text-[#0F4C81]' : ''}>Nomination & Deposit</span>
            <span className={step >= 3 ? 'text-[#0F4C81]' : ''}>Confirm & Pay</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#0F4C81]/5 border border-gray-300 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          
          <div className="bg-[#ED7F1E] p-6 text-white text-center print:bg-white print:text-[#ED7F1E] print:border-b-2 print:border-[#ED7F1E]">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="w-40 shrink-0 hidden md:block"></div>
              <div className="flex-grow px-4 text-white print:text-[#ED7F1E]">
              <div className="flex items-center justify-center space-x-3 md:space-x-4 mx-auto">
                <img src="/logo-bg.png" alt="Odiyooru Souharda Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain shrink-0" />
                <div className="leading-tight text-left">
                  <span className="text-xl md:text-2xl font-black tracking-tight uppercase block leading-none font-heading">
                    Odiyooru Souharda
                  </span>
                  <span className="text-sm md:text-base font-bold uppercase tracking-widest leading-none block mt-1">
                    Cooperative Society Ltd
                  </span>
                  <span className="text-[10px] md:text-xs font-bold block mt-1 font-mono leading-none">
                    DRP:S.9:88:RGN:520:2010-11
                  </span>
                </div>
              </div></div>
              <div className="text-right text-xs font-medium space-y-1 w-40 shrink-0 opacity-90 print:text-gray-800">
                <div className="flex items-center gap-2 justify-end"><span className="opacity-70">Branch:</span> <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="bg-transparent border-b border-white/30 outline-none w-24 text-right print:border-gray-300 print:text-gray-900" placeholder="Branch Name"/></div>
                <div>Customer ID: <span className="font-mono bg-white/10 px-2 py-0.5 rounded print:bg-gray-100">{user?.customerId || 'UNASSIGNED'}</span></div>
                <div>Account No: <span className="font-mono bg-white/10 px-2 py-0.5 rounded print:bg-gray-100">__ __ __ __ __</span></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 print:p-0 print:py-6">
            
            {/* PAGE 1: ACCOUNT OPENING FORM */}
            <div className={step === 1 ? 'block' : 'hidden print:block print:break-after-page'}>
              <div className="border-b-2 border-[#EAF6FF] pb-4 mb-6 flex justify-between items-end print:border-gray-200">
                <h2 className="text-xl font-black text-[#0F4C81] uppercase tracking-wider">Page 1: Account Opening Form</h2>
                <div className="w-32"><InputField label="Date" name="date" type="date"  formData={formData} handleChange={handleChange} error={errors['date']} /></div>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-grow space-y-4">
                  <InputField label="Applicant Full Name" name="applicantFullName" required  formData={formData} handleChange={handleChange} error={errors['applicantFullName']} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Mobile Number" name="mobileNumber" required type="tel"  formData={formData} handleChange={handleChange} error={errors['mobileNumber']} />
                    <InputField label="Email ID" name="emailId" type="email"  formData={formData} handleChange={handleChange} error={errors['emailId']} />
                    <InputField label="PAN Number" name="panNumber"  formData={formData} handleChange={handleChange} error={errors['panNumber']} />
                    <InputField label="Aadhaar Number" name="aadhaarNumber"  formData={formData} handleChange={handleChange} error={errors['aadhaarNumber']} />
                    <InputField label="Date of Birth" name="dob" type="date"  formData={formData} handleChange={handleChange} error={errors['dob']} />
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Senior Citizen</label>
                        <select name="seniorCitizen" value={formData.seniorCitizen} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:border-[#0F4C81] outline-none text-sm bg-white">
                          <option>No</option><option>Yes</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Minor</label>
                        <select name="minor" value={formData.minor} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:border-[#0F4C81] outline-none text-sm bg-white">
                          <option>No</option><option>Yes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Residential Address</label>
                      <textarea name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:border-[#0F4C81] outline-none text-sm bg-white resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Occupation / Office Address</label>
                      <textarea name="occupationAddress" value={formData.occupationAddress} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:border-[#0F4C81] outline-none text-sm bg-white resize-none"></textarea>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-48 shrink-0 flex flex-col gap-4 print:hidden">
                  <div className="h-48 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <FileUploadBox label="Upload Photo" field="applicantPhoto"  uploads={uploads} handleFileUpload={handleFileUpload} error={errors['applicantPhoto']} />
                    </div>
                  </div>
                  <div className="h-32 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <FileUploadBox label="Upload Signature" field="applicantSignature"  uploads={uploads} handleFileUpload={handleFileUpload} error={errors['applicantSignature']} />
                    </div>
                  </div>
                </div>
                <div className="hidden print:flex flex-col gap-4 w-32 shrink-0">
                  <div className="h-40 border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400 text-center p-2">Affix Recent Passport Size Photo</div>
                  <div className="h-24 border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400 text-center p-2">Specimen Signature</div>
                </div>
              </div>

              <div className="mt-8 bg-[#EAF6FF]/50 p-4 rounded-xl border border-[#EAF6FF] print:bg-transparent print:border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="hasJointApplicant" checked={formData.hasJointApplicant} onChange={handleChange} className="w-5 h-5 text-[#0F4C81] rounded focus:ring-[#0F4C81]" />
                  <span className="font-bold text-[#0F4C81]">Include Joint Applicant</span>
                </label>
              </div>

              {formData.hasJointApplicant && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 border-l-4 border-[#0F4C81] pl-6 pt-2">
                  <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">Joint Applicant Details</h3>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-grow space-y-4">
                      <InputField label="Joint Applicant Full Name" name="jointApplicantName" required={formData.hasJointApplicant}  formData={formData} handleChange={handleChange} error={errors['jointApplicantName']} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Mobile Number" name="jointMobileNumber"  formData={formData} handleChange={handleChange} error={errors['jointMobileNumber']} />
                        <InputField label="Email ID" name="jointEmailId"  formData={formData} handleChange={handleChange} error={errors['jointEmailId']} />
                        <InputField label="PAN Number" name="jointPanNumber"  formData={formData} handleChange={handleChange} error={errors['jointPanNumber']} />
                        <InputField label="Date of Birth" name="jointDob" type="date"  formData={formData} handleChange={handleChange} error={errors['jointDob']} />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Residential Address</label>
                          <textarea name="jointResidentialAddress" value={formData.jointResidentialAddress} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:border-[#0F4C81] outline-none text-sm bg-white resize-none"></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-48 shrink-0 flex flex-col gap-4 print:hidden">
                      <div className="h-48 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden relative"><div className="absolute inset-0 flex items-center justify-center p-4"><FileUploadBox label="Joint Photo" field="jointPhoto"  uploads={uploads} handleFileUpload={handleFileUpload} error={errors['jointPhoto']} /></div></div>
                      <div className="h-32 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden relative"><div className="absolute inset-0 flex items-center justify-center p-4"><FileUploadBox label="Joint Signature" field="jointSignature"  uploads={uploads} handleFileUpload={handleFileUpload} error={errors['jointSignature']} /></div></div>
                    </div>
                     <div className="hidden print:flex flex-col gap-4 w-32 shrink-0">
                      <div className="h-40 border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400 text-center p-2">Affix Recent Passport Size Photo</div>
                      <div className="h-24 border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400 text-center p-2">Specimen Signature</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mode of Operation */}
              <div className="mt-8">
                <h3 className="text-sm font-black text-[#0F4C81] uppercase tracking-wider mb-3">Mode of Operation</h3>
                <div className="flex flex-wrap gap-4">
                  {['Self', 'Jointly', 'Either or Survivor', 'Anyone or Survivor', 'Former or Survivor', 'Other'].map(mode => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="modeOfOperation" value={mode} checked={formData.modeOfOperation === mode} onChange={handleChange} className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]" />
                      <span className="text-sm font-medium text-gray-700">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* PAGE 2: NOMINATION FORM */}
            <div className={step === 2 ? 'block' : 'hidden print:block print:break-after-page'}>
              <div className="border-b-2 border-[#EAF6FF] pb-4 mb-6 print:mt-12 print:border-gray-200">
                <h2 className="text-xl font-black text-[#0F4C81] uppercase tracking-wider">Page 2: Nomination Form</h2>
              </div>

              <div className="bg-[#EAF6FF]/30 p-6 rounded-2xl border border-[#EAF6FF] mb-8 print:bg-transparent print:border-gray-200 print:p-0 print:mb-6">
                <h3 className="text-sm font-black text-[#0F4C81] uppercase tracking-wider mb-4">Nominee Details</h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nominee Name" name="nomineeName"  formData={formData} handleChange={handleChange} error={errors['nomineeName']} />
                    <InputField label="Relationship with Applicant" name="nomineeRelationship"  formData={formData} handleChange={handleChange} error={errors['nomineeRelationship']} />
                    <InputField label="Date of Birth" name="nomineeDob" type="date"  formData={formData} handleChange={handleChange} error={errors['nomineeDob']} />
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Nominee Address</label>
                      <textarea name="nomineeAddress" value={formData.nomineeAddress} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:border-[#0F4C81] outline-none text-sm bg-white resize-none"></textarea>
                    </div>
                  </div>
                  <div className="w-full md:w-40 shrink-0 print:hidden">
                    <div className="h-48 rounded-2xl bg-white border border-gray-200 overflow-hidden relative"><div className="absolute inset-0 flex items-center justify-center p-4"><FileUploadBox label="Nominee Photo" field="nomineePhoto"  uploads={uploads} handleFileUpload={handleFileUpload} error={errors['nomineePhoto']} /></div></div>
                  </div>
                  <div className="hidden print:flex flex-col gap-4 w-32 shrink-0">
                    <div className="h-40 border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400 text-center p-2">Nominee Photo</div>
                  </div>
                </div>

                {/* Minor Nominee Section */}
                <div className="mt-4 pt-4 border-t border-[#EAF6FF] print:border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input type="checkbox" name="isNomineeMinor" checked={formData.isNomineeMinor} onChange={handleChange} className="w-5 h-5 text-[#0F4C81] rounded focus:ring-[#0F4C81]" />
                    <span className="font-bold text-gray-700 text-sm">Nominee is a Minor</span>
                  </label>
                  {formData.isNomineeMinor && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8 border-l-2 border-gray-200">
                      <InputField label="Guardian Name" name="guardianName"  formData={formData} handleChange={handleChange} error={errors['guardianName']} />
                      <InputField label="Relationship" name="guardianRelationship"  formData={formData} handleChange={handleChange} error={errors['guardianRelationship']} />
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Guardian Address</label>
                        <textarea name="guardianAddress" value={formData.guardianAddress} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:border-[#0F4C81] outline-none text-sm bg-white resize-none"></textarea>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Removed Witness and Introducer Sections */}
              </div>

              {/* Declaration Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 print:bg-transparent print:p-0 print:border-none print:mt-8">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Declaration</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-8 text-justify">
                  I/We declare that the information provided is true and correct. I/We agree to abide by the rules and regulations of ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD governing the account. I/We authorize the society to verify the details and open the account in my/our name(s).
                </p>
                <div className="flex justify-between items-end gap-8 pt-8">
                  <div className="flex-1 border-t-2 border-gray-400 pt-2 text-center text-xs font-bold text-gray-500">Applicant Signature</div>
                  {formData.hasJointApplicant && <div className="flex-1 border-t-2 border-gray-400 pt-2 text-center text-xs font-bold text-gray-500">Joint Applicant Signature</div>}
                </div>
              </div>

              {/* Office Verification Section - Print only visually */}
              <div className="mt-8 border-2 border-[#0F4C81] p-6 rounded-xl hidden print:block relative">
                <span className="absolute top-0 left-4 -mt-3 bg-white px-2 text-xs font-black text-[#0F4C81]">FOR OFFICE USE ONLY</span>
                <div className="grid grid-cols-3 gap-8 pt-4">
                  <div className="border-b border-gray-400 h-10 relative"><span className="absolute bottom-1 text-xs text-gray-500">Employee Name / Verified By</span></div>
                  <div className="border-b border-gray-400 h-10 relative"><span className="absolute bottom-1 text-xs text-gray-500">Employee Number</span></div>
                  <div className="border-b border-gray-400 h-10 relative"><span className="absolute bottom-1 text-xs text-gray-500">Date</span></div>
                </div>
                <div className="border-b border-gray-400 h-20 mt-8 w-64 relative"><span className="absolute bottom-1 text-xs text-gray-500">Authorized Signatory</span></div>
              </div>
            </div>

            {/* PAGE 3: SPECIMEN SIGNATURE CARD */}
            <div className={step === 3 ? 'block' : 'hidden print:block print:break-after-page'}>
              <div className="border-b-2 border-[#EAF6FF] pb-4 mb-6 print:mt-12 print:border-gray-200 print:hidden">
                <h2 className="text-xl font-black text-[#0F4C81] uppercase tracking-wider">Page 3: Specimen Signature Card</h2>
              </div>

              <div className="max-w-3xl mx-auto border-2 border-[#0F4C81] rounded-none print:border-4">
                <div className="bg-[#0F4C81] p-4 text-white text-center print:bg-white print:text-[#0F4C81] print:border-b-4 print:border-[#0F4C81] flex items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 print:bg-gray-100">
                    <span className="font-bold text-[8px] tracking-widest opacity-80 print:text-[#0F4C81]">LOGO</span>
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-lg font-black tracking-widest uppercase leading-tight text-center">ODIYOORU SOUHARDA<br/>COOPERATIVE SOCIETY LTD</h2>
                    <p className="text-xs font-bold text-gray-500 mt-1 text-center">DRP:S.9:88:RGN:520:2010-11</p>
                    <p className="text-xs tracking-widest mt-0.5">SPECIMEN SIGNATURE CARD</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
                    <div className="flex border-b border-gray-300 pb-1">
                      <span className="text-xs font-bold w-32">Customer Name:</span>
                      <span className="text-sm font-medium">{formData.applicantFullName || '_______________________'}</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1">
                      <span className="text-xs font-bold w-32">Customer No:</span>
                      <span className="text-sm font-medium">{user?.customerId || '_______________________'}</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1">
                      <span className="text-xs font-bold w-32">Account Type:</span>
                      <span className="text-sm font-medium">Savings Account</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1">
                      <span className="text-xs font-bold w-32">Account No:</span>
                      <span className="text-sm font-medium">_______________________</span>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-gray-400 mb-8">
                    <thead>
                      <tr className="bg-gray-100 print:bg-gray-200">
                        <th className="border border-gray-400 p-2 text-xs font-bold text-left w-16">Sr. No.</th>
                        <th className="border border-gray-400 p-2 text-xs font-bold text-left">Name of Holder</th>
                        <th className="border border-gray-400 p-2 text-xs font-bold text-center w-64">Specimen Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 p-3 text-sm text-center">1</td>
                        <td className="border border-gray-400 p-3 text-sm font-medium">{formData.applicantFullName || '_______________________'}</td>
                        <td className="border border-gray-400 p-3 h-24 relative print:h-32 text-center text-xs text-gray-400">{uploads.applicantSignature ? "Signature Uploaded" : "Sign Here"}</td>
                      </tr>
                      {formData.hasJointApplicant && (
                        <tr>
                          <td className="border border-gray-400 p-3 text-sm text-center">2</td>
                          <td className="border border-gray-400 p-3 text-sm font-medium">{formData.jointApplicantName || '_______________________'}</td>
                          <td className="border border-gray-400 p-3 h-24 relative print:h-32 text-center text-xs text-gray-400">{uploads.jointSignature ? "Signature Uploaded" : "Sign Here"}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="border border-gray-400 p-4 relative mt-12">
                    <span className="absolute top-0 left-4 -mt-3 bg-white px-2 text-[10px] font-bold text-gray-500">OFFICE USE ONLY</span>
                    <div className="grid grid-cols-4 gap-4 pt-2">
                      <div className="border-b border-gray-400 h-10 relative"><span className="absolute bottom-1 text-[10px] text-gray-500">Scanned By</span></div>
                      <div className="border-b border-gray-400 h-10 relative"><span className="absolute bottom-1 text-[10px] text-gray-500">Employee No.</span></div>
                      <div className="border-b border-gray-400 h-10 relative"><span className="absolute bottom-1 text-[10px] text-gray-500">Signature</span></div>
                      <div className="border-b border-gray-400 h-10 relative"><span className="absolute bottom-1 text-[10px] text-gray-500">Date</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons (Hidden on print) */}
            <div className="mt-10 flex justify-between items-center border-t border-gray-300 pt-6 print:hidden">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                  <ChevronLeft className="w-5 h-5" /> Previous
                </button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="flex items-center gap-2 px-8 py-3 bg-[#0F4C81] text-white rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-[#0F4C81]/30">
                  Next Step <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-[#ED7F1E] text-white rounded-xl font-bold hover:bg-[#d66a10] transition-colors shadow-lg">
                  <Send className="w-5 h-5" /> Submit Application
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
      
      <PaymentGatewayModal 
        isOpen={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        amount={Number(formData.initialDepositAmount) || 500}
        purpose="Initial Account Deposit"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
