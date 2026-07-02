import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, FileCheck } from 'lucide-react';

interface MortgageLoanApplicationProps {
  setCurrentTab?: (tab: string) => void;
}

const InputField = ({ label, name, type = "text", value, onChange, placeholder = "", width = "w-full", readOnly = false }: any) => {
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
      <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">{label}</label>
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

const SelectField = ({ label, name, value, onChange, options, width = "w-full" }: any) => (
  <div className={`\ mb-3`}>
    <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">{label}</label>
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

const RadioGroup = ({ label, name, value, onChange, options }: any) => (
  <div className="mb-3">
    <label className="block text-[10px] font-bold text-[#0F4C81] mb-2 uppercase tracking-wider">{label}</label>
    <div className="flex gap-4">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={onChange}
            className="w-4 h-4 text-[#0F4C81] border-slate-300 focus:ring-[#0F4C81] print:appearance-none print:w-4 print:h-4 print:border-2 print:border-[#0F4C81] print:rounded-full"
          />
          <span className="text-sm font-medium text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const MortgageLoanApplication: React.FC<MortgageLoanApplicationProps> = ({ setCurrentTab }) => {
  const { user, submitServiceApplication, getCustomerByCustomerId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Files
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [saleDeedFile, setSaleDeedFile] = useState<File | null>(null);
  const [rtcFile, setRtcFile] = useState<File | null>(null);
  const [ecFile, setEcFile] = useState<File | null>(null);
  const [taxReceiptFile, setTaxReceiptFile] = useState<File | null>(null);
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [propertyPhotoFile, setPropertyPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const generateAppNo = () => `ML-${Math.floor(100000 + Math.random() * 900000)}`;

  
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
    customerId: user?.customerId || '',
    fullName: '',
    fatherHusbandName: '',
    dob: '',
    mobile: '',
    email: '',

    // Address
    permHouse: '',
    permDistrict: '',
    permState: '',
    permPin: '',

    sameAsPerm: false,
    commHouse: '',
    commDistrict: '',
    commState: '',
    commPin: '',

    // ID
    aadhaar: '',
    pan: '',

    // Employment
    occupation: '',
    employer: '',
    monthlyIncome: '',
    annualIncome: '',

    // Property Mortgage Details
    ownerName: '',
    propertyAddress: '',
    surveyNo: '',
    propertyType: '',
    propertyArea: '',
    marketValue: '',
    existingLoan: 'No',

    // Loan Details
    loanAmountRequired: '',
    purpose: '',
    tenure: '',

    // Nominee
    nomName: '',
    nomRel: '',
    nomMobile: '',
    nomAddress: '',

    // Signatures
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
      }));
    }
  }, [user]);


  useEffect(() => {
    const draft = localStorage.getItem('draft_MortgageLoanApplication');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('draft_MortgageLoanApplication', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const newData = { ...prev, [name]: checked };
        if (name === 'sameAsPerm' && checked) {
          newData.commHouse = prev.permHouse;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || !signatureFile || !aadhaarFile || !panFile) {
      alert("Please upload all the required images (Aadhaar, PAN, Photo, and Signature).");
      return;
    }
    if (!formData.loanAmountRequired || !formData.propertyType || !formData.tenure) {
      alert("Please fill in Property Type, Loan Amount Requested, and Tenure.");
      return;
    }
    
    setIsSubmitting(true);
    
    const images: any = {};
    try {
      if (photoFile) images.photo = await fileToBase64(photoFile);
      if (aadhaarFile) images.aadhaar = await fileToBase64(aadhaarFile);
      if (panFile) images.pan = await fileToBase64(panFile);
      if (saleDeedFile) images.saleDeed = await fileToBase64(saleDeedFile);
      if (rtcFile) images.rtc = await fileToBase64(rtcFile);
      if (ecFile) images.ec = await fileToBase64(ecFile);
      if (taxReceiptFile) images.taxReceipt = await fileToBase64(taxReceiptFile);
      if (sketchFile) images.sketch = await fileToBase64(sketchFile);
      if (propertyPhotoFile) images.propertyPhotos = await fileToBase64(propertyPhotoFile);
      if (signatureFile) images.signature = await fileToBase64(signatureFile);
    } catch (err) {
      console.error('Failed to convert images to base64', err);
    }

    const res = await submitServiceApplication("Member's Mortgage Loan", formData, images);
    
    setIsSubmitting(false);
    if (res) {
      localStorage.removeItem('draft_MortgageLoanApplication');
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
          <p className="text-slate-500 mb-8">
            Your Member's Mortgage Loan Application (No: {formData.applicationNo}) for ₹{Number(formData.loanAmountRequired).toLocaleString('en-IN')} has been successfully received.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">Application Progress</h3>
            <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span>Application Received</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Property Valuation & Verification</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Loan Sanction</span>
            </div>
          </div>

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

          {/* MEMBER DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Member Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-2"><InputField label="Membership Number" name="memberNo" value={formData.memberNo} onChange={handleChange} placeholder="Enter to Auto-fill" /></div>
              <div className="lg:col-span-2"><InputField label="Customer ID" name="customerId" value={formData.customerId} readOnly /></div>
              
              <div className="lg:col-span-4"><InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} /></div>
              <div className="lg:col-span-4"><InputField label="Father's / Husband's Name" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} /></div>
              
              <div className="lg:col-span-2"><InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} /></div>
              <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} />
              <InputField label="Email ID" name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>

            <div className="mb-6 print:hidden">
              <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Member Photo Upload</label>
              <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
            </div>

            <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[10px] font-bold text-[#0F4C81] mb-3 uppercase tracking-wider">Permanent Address</h3>
                <InputField label="Address Details" name="permHouse" value={formData.permHouse} onChange={handleChange} />
                <InputField label="District" name="permDistrict" value={formData.permDistrict} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="State" name="permState" value={formData.permState} onChange={handleChange} />
                  <InputField label="PIN Code" name="permPin" value={formData.permPin} onChange={handleChange} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-3">
                  <h3 className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider">Communication Address</h3>
                  <CheckboxField label="Same as Permanent" name="sameAsPerm" checked={formData.sameAsPerm} onChange={handleChange} />
                </div>
                <InputField label="Address Details" name="commHouse" value={formData.commHouse} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="District" name="commDistrict" value={formData.commDistrict} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="State" name="commState" value={formData.commState} onChange={handleChange} readOnly={formData.sameAsPerm} />
                  <InputField label="PIN Code" name="commPin" value={formData.commPin} onChange={handleChange} readOnly={formData.sameAsPerm} />
                </div>
              </div>
            </div>
          </div>

          {/* IDENTIFICATION DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Identification Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
              <InputField label="PAN Number" name="pan" value={formData.pan} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-300 print:hidden">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Aadhaar Card Upload</label>
                <input type="file" accept="image/*,.pdf" onChange={e => setAadhaarFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">PAN Card Upload</label>
                <input type="file" accept="image/*,.pdf" onChange={e => setPanFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
            </div>
          </div>

          {/* EMPLOYMENT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Employment & Income Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
              <InputField label="Employer / Business Name" name="employer" value={formData.employer} onChange={handleChange} />
              <InputField label="Monthly Income (₹)" name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleChange} />
              <InputField label="Annual Income (₹)" name="annualIncome" type="number" value={formData.annualIncome} onChange={handleChange} />
            </div>
          </div>

          {/* PROPERTY MORTGAGE DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Property Mortgage Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField label="Property Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} />
              <InputField label="Survey Number" name="surveyNo" value={formData.surveyNo} onChange={handleChange} />
              <div className="md:col-span-2"><InputField label="Property Address" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} /></div>
              <SelectField label="Property Type" name="propertyType" value={formData.propertyType} onChange={handleChange} options={['Residential Property', 'Commercial Property', 'Agricultural Land', 'Vacant Site', 'Other']} />
              <InputField label="Property Area" name="propertyArea" value={formData.propertyArea} onChange={handleChange} />
              <InputField label="Market Value (₹)" name="marketValue" type="number" value={formData.marketValue} onChange={handleChange} />
              <RadioGroup label="Existing Loan on Property?" name="existingLoan" value={formData.existingLoan} onChange={handleChange} options={['Yes', 'No']} />
            </div>
          </div>

          {/* LOAN DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-slate-50 print:bg-transparent">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Loan Amount Requested (₹)" name="loanAmountRequired" type="number" value={formData.loanAmountRequired} onChange={handleChange} />
              <SelectField 
                label="Purpose of Loan" 
                name="purpose" 
                value={formData.purpose} 
                onChange={handleChange} 
                options={['Business', 'Education', 'Medical', 'Marriage', 'Agriculture', 'Home Improvement', 'Other']} 
              />
              <SelectField 
                label="Loan Tenure (in Years)" 
                name="tenure" 
                value={formData.tenure} 
                onChange={handleChange} 
                options={['1 Year', '3 Years', '5 Years', '7 Years', '10 Years']} 
              />
            </div>
          </div>

          {/* PROPERTY DOCUMENTS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Property Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:hidden">
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Sale Deed</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setSaleDeedFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">RTC / Pahani</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setRtcFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Encumbrance Certificate</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setEcFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Tax Receipt</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setTaxReceiptFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Property Sketch</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setSketchFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Latest Property Photo</label>
                <input type="file" accept="image/*" onChange={e => setPropertyPhotoFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic hidden print:block">All documents must be attached separately along with this application form.</p>
          </div>

          {/* NOMINEE DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Nominee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField label="Nominee Name" name="nomName" value={formData.nomName} onChange={handleChange} />
              <InputField label="Relationship" name="nomRel" value={formData.nomRel} onChange={handleChange} />
              <InputField label="Mobile Number" name="nomMobile" value={formData.nomMobile} onChange={handleChange} />
              <InputField label="Address" name="nomAddress" value={formData.nomAddress} onChange={handleChange} />
            </div>
          </div>

          {/* DECLARATION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-blue-50/50 print:bg-transparent text-justify">
            <h3 className="text-xs font-black text-[#0F4C81] mb-2 uppercase tracking-wider">Declaration</h3>
            <p className="text-xs text-slate-700 leading-relaxed print:text-slate-900 font-medium italic">
              "I hereby declare that the information provided by me is true and correct. I confirm my ownership of the property mentioned above and consent to mortgage it to ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD against this loan."
            </p>
          </div>

          {/* SIGNATURE SECTION */}
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
          <div className="flex justify-end mt-12 pt-8 border-t border-slate-200 print:hidden">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Mortgage Loan Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
