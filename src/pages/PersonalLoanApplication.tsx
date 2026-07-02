import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, FileCheck } from 'lucide-react';

interface PersonalLoanApplicationProps {
  setCurrentTab?: (tab: string) => void;
}

const InputField = ({ label, name, type = "text", value, onChange, placeholder = "", width = "w-full", readOnly = false, required = false }: any) => {
  let displayValue = value || '';
  if (type === 'date' && typeof displayValue === 'string' && displayValue.includes('-')) {
    const parts = displayValue.split('-');
    if (parts.length === 3 && parts[0].length === 2) {
      displayValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  const internalOnChange = (e: any) => {
    let finalValue = e.target.value;
    if (type === 'date' && finalValue) {
      const parts = finalValue.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        finalValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: finalValue }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className={`\ mb-3`}>
      <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        max={type === 'date' ? "9999-12-31" : undefined}
        name={name}
        value={displayValue}
        onChange={internalOnChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] ${type === 'date' ? 'lowercase' : 'capitalize'} bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent ${readOnly ? 'bg-slate-50' : ''}`}
      />
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, options, width = "w-full", required = false }: any) => (
  <div className={`\ mb-3`}>
    <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
      {label}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:appearance-none print:bg-transparent"
    >
      <option value="">Select Option</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const calculateAge = (dobString: string) => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
};

export const PersonalLoanApplication: React.FC<PersonalLoanApplicationProps> = ({ setCurrentTab }) => {
  const { user, submitServiceApplication, getCustomerByCustomerId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const generateAppNo = () => `PL-${Math.floor(100000 + Math.random() * 900000)}`;

  
  const fetchCustomerDetails = async (id: string) => {
    if (!id) return;
    const customer = await getCustomerByCustomerId(id);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        memberNo: customer.memberId || prev.memberNo,
        fullName: customer.fullName || prev.fullName,
        permHouse: customer.address || prev.permHouse,
        mobile: customer.phone || prev.mobile,
        dob: customer.dob || prev.dob,
        aadhaar: customer.aadhaar || prev.aadhaar,
        pan: customer.pan || prev.pan,
        email: customer.email || prev.email,
        accNumber: customer.accountNumber || prev.accNumber,
        accBranch: customer.accountNumber ? 'Main Branch' : prev.accBranch,
        accIfsc: customer.accountNumber ? 'ODIY0001234' : prev.accIfsc,
      }));
    } else {
      alert("Customer not found");
    }
  };

  const [formData, setFormData] = useState<any>({
    // Header
    applicationNo: generateAppNo(),
    date: new Date().toISOString().split('T')[0],

    // Applicant
    memberNo: '',
    fullName: '',
    fatherHusbandName: '',
    dob: '',
    gender: '',

    // Contact
    mobile: '',
    email: '',

    // Address
    permHouse: '',
    permStreet: '',
    permCity: '',
    permTaluk: '',
    permDistrict: '',
    permState: '',
    permPin: '',

    sameAsPerm: false,
    commHouse: '',
    commStreet: '',
    commCity: '',
    commTaluk: '',
    commDistrict: '',
    commState: '',
    commPin: '',

    // ID
    aadhaar: '',
    pan: '',

    // Employment
    occupation: '',
    employer: '',
    designation: '',
    monthlyIncome: '',
    yearsEmployed: '',

    // Loan Details
    loanAmountRequired: '',
    purpose: '',
    tenure: '',

    // Bank Account
    accNumber: '',
    accBranch: '',
    accIfsc: '',

    // Guarantor
    guarName: '',
    guarMemberNo: '',
    guarMobile: '',
    guarOccupation: '',
    guarAddress: '',

    // Nominee
    nomName: '',
    nomRel: '',
    nomDob: '',
    nomMobile: '',
    nomAddress: '',
    guardianName: '',
    guardianRel: '',

    // App Signature
    appPlace: '',
    appDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) {
      setFormData((prev: any) => ({
        ...prev,
        memberNo: prev.memberNo || user.memberId || '',
        fullName: prev.fullName || user.fullName || '',
        mobile: prev.mobile || user.phone || '',
        email: prev.email || user.email || '',
        dob: prev.dob || user.dob || '',
        permHouse: prev.permHouse || user.address || '',
        aadhaar: prev.aadhaar || user.aadhaar || '',
        pan: prev.pan || user.pan || '',
        accNumber: prev.accNumber || user.accountNumber || '',
        accBranch: (prev.accNumber || user.accountNumber) ? 'Main Branch' : prev.accBranch,
        accIfsc: (prev.accNumber || user.accountNumber) ? 'ODIY0001234' : prev.accIfsc,
      }));
    }
  }, [user]);


  useEffect(() => {
    const draft = localStorage.getItem('draft_PersonalLoanApplication');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('draft_PersonalLoanApplication', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const newData = { ...prev, [name]: checked };
        if (name === 'sameAsPerm' && checked) {
          newData.commHouse = prev.permHouse;
          newData.commStreet = prev.permStreet;
          newData.commCity = prev.permCity;
          newData.commTaluk = prev.permTaluk;
          newData.commDistrict = prev.permDistrict;
          newData.commState = prev.permState;
          newData.commPin = prev.permPin;
        }
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Auto-fill logic
        if (name === 'memberNo' && user?.customerId && value === user.customerId) {
          newData.fullName = user.fullName || '';
          newData.mobile = user.phone || '';
          newData.dob = user.dob || '';
          newData.email = user.email || '';
          if (user.address) {
            newData.permHouse = user.address;
          }
        }
        
        return newData;
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveDraft = () => {
    localStorage.setItem('draft_PersonalLoanApplication', JSON.stringify(formData));
    alert('Application saved as draft successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{12}$/.test(formData.aadhaar)) {
      alert("Aadhaar Number must be exactly 12 digits.");
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      alert("PAN Number must be in the format ABCDE1234F.");
      return;
    }

    if (!photoFile || !signatureFile || !aadhaarFile || !panFile) {
      alert("Please upload all the required images (Aadhaar, PAN, Photo, and Signature).");
      return;
    }
    if (!formData.loanAmountRequired || !formData.tenure || !formData.purpose) {
      alert("Please fill in Loan Amount Required, Purpose, and Tenure.");
      return;
    }
    
    setIsSubmitting(true);
    
    const images: any = {};
    try {
      if (photoFile) images.photo = await fileToBase64(photoFile);
      if (aadhaarFile) images.aadhaar = await fileToBase64(aadhaarFile);
      if (panFile) images.pan = await fileToBase64(panFile);
      if (signatureFile) images.signature = await fileToBase64(signatureFile);
    } catch (err) {
      console.error('Failed to convert images to base64', err);
    }

    const res = await submitServiceApplication('Personal Loan', formData, images);
    
    setIsSubmitting(false);
    if (res) {
      localStorage.removeItem('draft_PersonalLoanApplication');
      setSuccess(true);
    } else {
      alert("Failed to submit application. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="bg-slate-50 min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-300 max-w-lg w-full text-center animate-scale-up">
          <div className="mx-auto h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <FileCheck className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your application (No: <strong>{formData.applicationNo}</strong>) for <strong>{formData.fullName}</strong> has been submitted successfully on {formData.date}.<br /><br />
            Our officer will contact you within 2 working days on your registered email ({formData.email}).
          </p>
          
          <button 
            onClick={() => setCurrentTab && setCurrentTab('dashboard')}
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
        <div className="flex justify-end items-center mb-6 print:hidden">
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-[#0F4C81]/20">
            <Printer className="w-4 h-4" /> Print Form
          </button>
        </div>

        {/* Paper Document Container */}
        <div className="bg-white p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-300 print:shadow-none print:border-none print:p-2">
          
                                                            {/* HEADER SECTION */}
          <div className="bg-[#ED7F1E] rounded-t-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 -mt-8 md:-mt-12 -mx-8 md:-mx-12 print:m-0 print:p-4 print:rounded-none gap-4 md:gap-0">
            <div className="flex-grow flex items-center justify-center md:justify-start space-x-4 md:space-x-6 mx-auto md:mx-0 w-full md:w-auto">
              <img src="/logo-bg.png" alt="Odiyooru Souharda Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain shrink-0" />
              <div className="text-white leading-tight text-left">
                <span className="text-xl md:text-3xl font-black tracking-tight uppercase block leading-none font-heading">
                  Odiyooru Souharda
                </span>
                <span className="text-sm md:text-lg font-bold uppercase tracking-widest leading-none block mt-1 md:mt-2">
                  Cooperative Society Ltd
                </span>
                <span className="text-[10px] md:text-xs font-bold block mt-1 md:mt-2 font-mono leading-none text-white/90">
                  DRP:S.9:88:RGN:520:2010-11
                </span>
              </div>
            </div>
            
            <div className="text-white text-[10px] md:text-xs font-bold w-full md:w-auto shrink-0 mt-4 md:mt-0">
              <table className="ml-auto">
                <tbody>
                  <tr>
                    <td className="text-right pr-3 opacity-90 pb-2">Branch:</td>
                    <td className="text-left pb-2">
                      <input type="text" value="Main Branch" readOnly className="w-32 border-b border-white/40 outline-none bg-transparent text-center text-white placeholder-white/60 focus:border-white transition-colors opacity-90" />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right pr-3 opacity-90 pb-2">Customer ID:</td>
                    <td className="text-left pb-2">
                      <input 
                        type="text" 
                        value={formData?.headerCustomerId !== undefined ? formData.headerCustomerId : (typeof user !== 'undefined' ? (user?.customerId || '') : '')} 
                        onChange={(e) => setFormData(prev => ({ ...prev, headerCustomerId: e.target.value.toUpperCase() }))}
                        onBlur={() => typeof fetchCustomerDetails === 'function' && formData?.headerCustomerId ? fetchCustomerDetails(formData.headerCustomerId) : null}
                        className="w-32 bg-white/20 rounded px-2 py-1 outline-none text-center text-white border border-white/10 placeholder-white/60 font-bold tracking-wide transition-colors focus:bg-white/30" 
                        placeholder="Enter ID"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right pr-3 opacity-90">Application No:</td>
                    <td className="text-left">
                      <input type="text" value={formData?.applicationNo || '— — — —'} readOnly className="w-32 border-b border-white/40 outline-none bg-transparent text-center text-white placeholder-white/60 focus:border-white transition-colors tracking-widest font-bold" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* APPLICANT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Applicant Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-2"><InputField label="Customer ID" name="customerId" value={user?.customerId || ''} readOnly /></div>
              <div className="lg:col-span-2"><InputField label="Membership Number" name="memberNo" value={formData.memberNo} onChange={handleChange} placeholder="Enter to Auto-fill" /></div>
              
              <div className="lg:col-span-4"><InputField label="Applicant Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required={true} /></div>
              <div className="lg:col-span-4"><InputField label="Father's / Husband's Name" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} required={true} /></div>
              
              <div className="lg:col-span-2">
                <div className="flex gap-4 items-center">
                  <div className="flex-grow">
                    <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required={true} />
                  </div>
                  {formData.dob && (
                    <div className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 mt-1 whitespace-nowrap">
                      Age: {calculateAge(formData.dob)} years
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2">
                <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} required={true} />
              </div>
            </div>

            <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required={true} />
              <InputField label="Email ID" name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Permanent Address</h3>
                <InputField label="House Number / Name" name="permHouse" value={formData.permHouse} onChange={handleChange} required={true} />
                <InputField label="Street" name="permStreet" value={formData.permStreet} onChange={handleChange} required={true} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Village / City" name="permCity" value={formData.permCity} onChange={handleChange} required={true} />
                  <InputField label="Taluk / Tehsil" name="permTaluk" value={formData.permTaluk} onChange={handleChange} required={true} />
                </div>
                <InputField label="District" name="permDistrict" value={formData.permDistrict} onChange={handleChange} required={true} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="State" name="permState" value={formData.permState} onChange={handleChange} required={true} />
                  <InputField label="PIN Code" name="permPin" value={formData.permPin} onChange={handleChange} required={true} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end border-b border-slate-200 pb-1 mb-3">
                  <h3 className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider">Communication Address</h3>
                  <CheckboxField label="Same as Permanent" name="sameAsPerm" checked={formData.sameAsPerm} onChange={handleChange} />
                </div>
                <InputField label="House Number / Name" name="commHouse" value={formData.commHouse} onChange={handleChange} readOnly={formData.sameAsPerm} required={true} />
                <InputField label="Street" name="commStreet" value={formData.commStreet} onChange={handleChange} readOnly={formData.sameAsPerm} required={true} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Village / City" name="commCity" value={formData.commCity} onChange={handleChange} readOnly={formData.sameAsPerm} required={true} />
                  <InputField label="Taluk / Tehsil" name="commTaluk" value={formData.commTaluk} onChange={handleChange} readOnly={formData.sameAsPerm} required={true} />
                </div>
                <InputField label="District" name="commDistrict" value={formData.commDistrict} onChange={handleChange} readOnly={formData.sameAsPerm} required={true} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="State" name="commState" value={formData.commState} onChange={handleChange} readOnly={formData.sameAsPerm} required={true} />
                  <InputField label="PIN Code" name="commPin" value={formData.commPin} onChange={handleChange} readOnly={formData.sameAsPerm} required={true} />
                </div>
              </div>
            </div>
          </div>

          {/* IDENTIFICATION DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Identification Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleChange} required={true} />
              <InputField label="PAN Number" name="pan" value={formData.pan} onChange={handleChange} required={true} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-300 print:hidden">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">
                  Aadhaar Card Upload <span className="text-rose-500 ml-1">*</span>
                </label>
                <input type="file" accept="image/*,.pdf" onChange={e => setAadhaarFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">
                  PAN Card Upload <span className="text-rose-500 ml-1">*</span>
                </label>
                <input type="file" accept="image/*,.pdf" onChange={e => setPanFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">
                  Passport Size Photo <span className="text-rose-500 ml-1">*</span>
                </label>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
            </div>
          </div>

          {/* EMPLOYMENT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Employment & Income Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} options={['Salaried', 'Self-employed', 'Business Owner', 'Agriculture', 'Homemaker', 'Student', 'Retired', 'Other']} required={true} />
              <InputField label="Employer / Business Name" name="employer" value={formData.employer} onChange={handleChange} />
              <InputField label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
              <InputField label="Monthly Income (₹)" name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleChange} required={true} />
              <InputField label="Work Experience (Years)" name="yearsEmployed" type="number" value={formData.yearsEmployed} onChange={handleChange} />
            </div>
          </div>

          {/* LOAN DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-slate-50 print:bg-transparent">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Loan Amount Required (₹)" name="loanAmountRequired" type="number" value={formData.loanAmountRequired} onChange={handleChange} required={true} />
              <SelectField 
                label="Loan Purpose" 
                name="purpose" 
                value={formData.purpose} 
                onChange={handleChange} 
                options={['Medical Emergency', 'Education', 'Marriage', 'Home Renovation', 'Business Purpose', 'Travel', 'Debt Consolidation', 'Other']} 
                required={true}
              />
              <SelectField 
                label="Loan Tenure (in Months)" 
                name="tenure" 
                value={formData.tenure} 
                onChange={handleChange} 
                options={['6 Months', '12 Months', '18 Months', '24 Months', '36 Months', '48 Months', '60 Months']} 
                required={true}
              />
            </div>
          </div>

          {/* BANK ACCOUNT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Bank Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Account Number" name="accNumber" value={formData.accNumber} onChange={handleChange} />
              <InputField label="Branch" name="accBranch" value={formData.accBranch} onChange={handleChange} />
              <InputField label="IFSC Code" name="accIfsc" value={formData.accIfsc} onChange={handleChange} />
            </div>
          </div>

          {/* NOMINEE DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Nominee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <InputField label="Nominee Name" name="nomName" value={formData.nomName} onChange={handleChange} required={true} />
              <InputField label="Relationship" name="nomRel" value={formData.nomRel} onChange={handleChange} required={true} />
              <InputField label="Date of Birth" name="nomDob" type="date" value={formData.nomDob} onChange={handleChange} />
              <div className="lg:col-span-2"><InputField label="Address" name="nomAddress" value={formData.nomAddress} onChange={handleChange} /></div>
              <InputField label="Mobile Number" name="nomMobile" value={formData.nomMobile} onChange={handleChange} />
            </div>
            
            {formData.nomDob && calculateAge(formData.nomDob) !== '' && parseInt(calculateAge(formData.nomDob)) < 18 && (
              <>
                <h3 className="text-[10px] font-bold text-rose-500 border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider">Nominee is Minor (Guardian Required)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleChange} required={true} />
                  <InputField label="Guardian Relationship" name="guardianRel" value={formData.guardianRel} onChange={handleChange} required={true} />
                </div>
              </>
            )}
          </div>

          {/* DECLARATION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-blue-50/50 print:bg-transparent text-justify">
            <h3 className="text-xs font-black text-[#0F4C81] mb-2 uppercase tracking-wider">Declaration</h3>
            <p className="text-xs text-slate-700 leading-relaxed print:text-slate-900 font-medium italic">
              "I hereby declare that the information provided by me is true and correct. I agree to abide by the rules and regulations of ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD I authorize the society to verify my employment and credit history."
            </p>
          </div>

          {/* APPLICANT SIGNATURE */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div className="space-y-4 w-full md:w-1/3">
              <InputField label="Place" name="appPlace" value={formData.appPlace} onChange={handleChange} />
              <InputField label="Date" name="appDate" type="date" value={formData.appDate} onChange={handleChange} />
            </div>
            <div className="flex-grow flex flex-col justify-end gap-4 text-center w-full">
              <div className="flex justify-end mt-6">
                <div className="w-full max-w-[250px] text-left">
                  <label className="block text-[10px] font-bold text-[#0F4C81] mb-2 uppercase tracking-wider print:hidden">Upload Applicant Signature</label>
                  <input type="file" accept="image/*" onChange={e => setSignatureFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EAF6FF] file:text-[#0F4C81] hover:file:bg-[#d6efff] transition-all cursor-pointer print:hidden"/>
                </div>
              </div>
              <div className="flex justify-end items-end h-16">
                <div className="w-48 border-t border-slate-800 pt-2 text-[10px] font-bold uppercase">Applicant Signature</div>
              </div>
            </div>
          </div>



          {/* SUBMIT BUTTON */}
          <div className="flex justify-end items-center mt-12 pt-8 border-t border-slate-200 print:hidden gap-4">
            <button 
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-6 py-4 bg-white text-[#0F4C81] border-2 border-[#0F4C81] rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all"
            >
              Save as Draft
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Personal Loan Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
