import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, FileCheck } from 'lucide-react';

interface HousingLoanApplicationProps {
  setCurrentTab?: (tab: string) => void;
}

const InputField = ({ label, name, type = "text", value, onChange, placeholder = "", width = "w-full", readOnly = false, required = false, error, note }: any) => {
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
    <div className={`mb-3`}>
      <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        max={type === 'date' ? "9999-12-31" : undefined}
        name={name}
        value={displayValue}
        onChange={internalOnChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] ${type === 'date' ? 'lowercase' : 'capitalize'} bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent ${readOnly ? 'bg-slate-50' : ''}`}
      />
      {note && <p className="text-slate-500 text-xs mt-1 italic">{note}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, options, width = "w-full", required = false, error }: any) => (
  <div className={`mb-3`}>
    <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:appearance-none print:bg-transparent`}
    >
      <option value="">Select Option</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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

export const HousingLoanApplication: React.FC<HousingLoanApplicationProps> = ({ setCurrentTab }) => {
  const { user, submitServiceApplication, getCustomerByCustomerId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Files
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [saleDeedFile, setSaleDeedFile] = useState<File | null>(null);
  const [ecFile, setEcFile] = useState<File | null>(null);
  const [buildingPlanFile, setBuildingPlanFile] = useState<File | null>(null);
  const [taxReceiptFile, setTaxReceiptFile] = useState<File | null>(null);
  const [khataFile, setKhataFile] = useState<File | null>(null);
  const [propertyPhotosFile, setPropertyPhotosFile] = useState<File | null>(null);


  const generateAppNo = () => `HL-${Math.floor(100000 + Math.random() * 900000)}`;

  const [formData, setFormData] = useState<any>({
    applicationNo: generateAppNo(),
    date: new Date().toISOString().split('T')[0],

    memberNo: '',
    fullName: '',
    fatherHusbandName: '',
    dob: '',
    gender: '',

    mobile: '',
    email: '',

    permHouseNo: '',
    permStreet: '',
    permHouse: '',
    permCity: '',
    permTaluk: '',
    permDistrict: '',
    permState: '',
    permPin: '',

    sameAsPerm: false,
    commHouseNo: '',
    commStreet: '',
    commHouse: '',
    commCity: '',
    commTaluk: '',
    commDistrict: '',
    commState: '',
    commPin: '',

    aadhaar: '',
    pan: '',

    occupation: '',
    employer: '',
    yearsOfExperience: '',
    monthlyIncome: '',
    existingEmis: '',

    purposeOfLoan: '',
    propertyType: '',
    propertySurveyNo: '',
    propertyLocation: '',
    propertyAddress: '',
    propertyValue: '',
    propertySize: '',

    loanAmountRequired: '',
    applicantContribution: '',
    tenure: '',

    coName: '',
    coRel: '',
    coMobile: '',
    coOccupation: '',
    coMonthlyIncome: '',
    coAadhaar: '',
    coPan: '',
    coAddress: '',

    nomName: '',
    nomRel: '',
    nomMobile: '',
    nomAddress: '',
    nomDob: '',
    guardianName: '',
    guardianRel: '',

    appPlace: '',
    appDate: new Date().toISOString().split('T')[0],
  });

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
      }));
    }
  }, [user]);

  useEffect(() => {
    const draft = localStorage.getItem('draft_HousingLoanApplication');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('draft_HousingLoanApplication', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for the field being modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined } as any));
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const newData = { ...prev, [name]: checked };
        if (name === 'sameAsPerm' && checked) {
          newData.commHouseNo = prev.permHouseNo;
          newData.commStreet = prev.permStreet;
          newData.commHouse = prev.permHouse;
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
        let finalValue = value;
        // Validation: Positive numeric only for currency/area fields
        if (['propertyValue', 'propertySize', 'loanAmountRequired', 'applicantContribution', 'monthlyIncome', 'existingEmis', 'coMonthlyIncome', 'yearsOfExperience'].includes(name)) {
          if (value && Number(value) < 0) {
            finalValue = '0';
          }
        }
        
        const newData = { ...prev, [name]: finalValue };
        
        // Auto-calc Applicant Contribution
        if (name === 'propertyValue' || name === 'loanAmountRequired') {
          const propVal = Number(name === 'propertyValue' ? finalValue : newData.propertyValue) || 0;
          const loanReq = Number(name === 'loanAmountRequired' ? finalValue : newData.loanAmountRequired) || 0;
          if (propVal > 0 && loanReq > 0) {
            newData.applicantContribution = Math.max(0, propVal - loanReq).toString();
          }
        }
        
        // Auto-fill customer ID
        if (name === 'memberNo' && user?.customerId && value === user.customerId) {
          newData.fullName = user.fullName || '';
          newData.mobile = user.phone || '';
          newData.dob = user.dob || '';
          newData.email = user.email || '';
          if (user.address) newData.permHouse = user.address;
        }
        
        return newData;
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const reqFields = [
      'fullName', 'fatherHusbandName', 'dob', 'gender', 'mobile',
      'permHouse', 'permCity', 'permDistrict', 'permState', 'permPin',
      'aadhaar', 'pan', 'occupation', 'monthlyIncome', 'propertyType',
      'propertyValue', 'propertyAddress', 'propertySize', 'loanAmountRequired',
      'applicantContribution', 'tenure', 'coName', 'coRel', 'coMobile',
      'coOccupation', 'coMonthlyIncome', 'nomName', 'nomRel'
    ];

    reqFields.forEach(f => {
      if (!formData[f] || String(formData[f]).trim() === '') {
        newErrors[f] = "This field is required";
      }
    });

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Must be a 10-digit number";
    if (formData.coMobile && !/^\d{10}$/.test(formData.coMobile)) newErrors.coMobile = "Must be a 10-digit number";
    if (formData.nomMobile && formData.nomMobile.trim() !== '' && !/^\d{10}$/.test(formData.nomMobile)) newErrors.nomMobile = "Must be a 10-digit number";

    if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar)) newErrors.aadhaar = "Must be a 12-digit number";
    if (formData.coAadhaar && formData.coAadhaar.trim() !== '' && !/^\d{12}$/.test(formData.coAadhaar)) newErrors.coAadhaar = "Must be a 12-digit number";

    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan)) newErrors.pan = "Invalid PAN format";
    if (formData.coPan && formData.coPan.trim() !== '' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.coPan)) newErrors.coPan = "Invalid PAN format";

    if (formData.permPin && !/^\d{6}$/.test(formData.permPin)) newErrors.permPin = "Must be a 6-digit number";
    if (formData.commPin && formData.commPin.trim() !== '' && !/^\d{6}$/.test(formData.commPin)) newErrors.commPin = "Must be a 6-digit number";

    if (formData.nomDob) {
      const age = (new Date().getTime() - new Date(formData.nomDob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) {
        if (!formData.guardianName) newErrors.guardianName = "Guardian name is required for minor";
        if (!formData.guardianRel) newErrors.guardianRel = "Guardian relationship is required for minor";
      }
    }

    if (!photoFile) newErrors.photoFile = "Applicant Photo is required";
    if (!aadhaarFile) newErrors.aadhaarFile = "Aadhaar Card is required";
    if (!panFile) newErrors.panFile = "PAN Card is required";
    if (!saleDeedFile) newErrors.saleDeedFile = "Sale Deed / Agreement is required";
    if (!ecFile) newErrors.ecFile = "Encumbrance Certificate is required";
    if (!khataFile) newErrors.khataFile = "Khata Certificate is required";
    if (!propertyPhotosFile) newErrors.propertyPhotosFile = "Property Photos are required";
    
    if (['Under Construction', 'Independent House'].includes(formData.propertyType) && !buildingPlanFile) {
      newErrors.buildingPlanFile = "Approved Building Plan is required for this property type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fix the validation errors before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    
    const images: any = {};
    try {
      if (photoFile) images.photo = await fileToBase64(photoFile);
      if (aadhaarFile) images.aadhaar = await fileToBase64(aadhaarFile);
      if (panFile) images.pan = await fileToBase64(panFile);
      if (saleDeedFile) images.saleDeed = await fileToBase64(saleDeedFile);
      if (ecFile) images.ec = await fileToBase64(ecFile);
      if (buildingPlanFile) images.buildingPlan = await fileToBase64(buildingPlanFile);
      if (taxReceiptFile) images.taxReceipt = await fileToBase64(taxReceiptFile);
      if (khataFile) images.khata = await fileToBase64(khataFile);
      if (propertyPhotosFile) images.propertyPhotos = await fileToBase64(propertyPhotosFile);

    } catch (err) {
      console.error('Failed to convert images to base64', err);
    }

    const res = await submitServiceApplication('Housing Loan', formData, images);
    
    setIsSubmitting(false);
    if (res) {
      localStorage.removeItem('draft_HousingLoanApplication');
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
            Your housing loan application has been submitted successfully. Our officer will contact you within 2 working days on your registered mobile number for further verification and document collection
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left mb-8 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Application Number</span>
              <span className="text-xs font-bold">{formData.applicationNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Applicant Name</span>
              <span className="text-xs font-bold">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Submitted Date</span>
              <span className="text-xs font-bold">{new Date().toLocaleDateString()}</span>
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

  // Calculate nominee age for conditional rendering
  let showGuardian = false;
  if (formData.nomDob) {
    const age = (new Date().getTime() - new Date(formData.nomDob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    showGuardian = age < 18;
  }
  
  const showLtvWarning = (Number(formData.loanAmountRequired) > 0 && Number(formData.propertyValue) > 0 && Number(formData.loanAmountRequired) > 0.8 * Number(formData.propertyValue));

  const occupationOptions = ['Salaried', 'Self-employed', 'Business Owner', 'Agriculture', 'Government Employee', 'Homemaker', 'Retired', 'Other'];

  return (
    <div className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white text-slate-800">
      <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        <div className="flex justify-end items-center mb-6 print:hidden">
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-[#0F4C81]/20">
            <Printer className="w-4 h-4" /> Print Form
          </button>
        </div>

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
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Applicant Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-2"><InputField label="Customer ID" name="customerId" value={user?.customerId || ''} readOnly /></div>
              <div className="lg:col-span-2"><InputField label="Membership Number" name="memberNo" value={formData.memberNo} onChange={handleChange} placeholder="Enter to Auto-fill" /></div>
              
              <div className="lg:col-span-4"><InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required={true} error={errors.fullName} /></div>
              <div className="lg:col-span-4"><InputField label="Father's / Husband's Name" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} required={true} error={errors.fatherHusbandName} /></div>
              
              <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required={true} error={errors.dob} />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} required={true} error={errors.gender} />
            </div>

            <div className="mb-6 print:hidden">
              <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
                Applicant Photo Upload <span className="text-red-500">*</span>
              </label>
              <input type="file" accept="image/*" onChange={e => { setPhotoFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, photoFile: undefined})) }} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              {errors.photoFile && <p className="text-red-500 text-xs mt-1">{errors.photoFile}</p>}
            </div>

            <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Contact & Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required={true} error={errors.mobile} />
              <InputField label="Email ID" name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Permanent Address</h3>
                <InputField label="House Number / Name" name="permHouseNo" value={formData.permHouseNo} onChange={handleChange} />
                <InputField label="Street" name="permStreet" value={formData.permStreet} onChange={handleChange} />
                <InputField label="Address Details" name="permHouse" value={formData.permHouse} onChange={handleChange} required={true} error={errors.permHouse} />
                <InputField label="Village / City" name="permCity" value={formData.permCity} onChange={handleChange} required={true} error={errors.permCity} />
                <InputField label="Taluk / Tehsil" name="permTaluk" value={formData.permTaluk} onChange={handleChange} />
                <InputField label="District" name="permDistrict" value={formData.permDistrict} onChange={handleChange} required={true} error={errors.permDistrict} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="State" name="permState" value={formData.permState} onChange={handleChange} required={true} error={errors.permState} />
                  <InputField label="PIN Code" name="permPin" value={formData.permPin} onChange={handleChange} required={true} error={errors.permPin} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end border-b border-slate-200 pb-1 mb-3">
                  <h3 className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider">Communication Address</h3>
                  <CheckboxField label="Same as Permanent" name="sameAsPerm" checked={formData.sameAsPerm} onChange={handleChange} />
                </div>
                <InputField label="House Number / Name" name="commHouseNo" value={formData.commHouseNo} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Street" name="commStreet" value={formData.commStreet} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Address Details" name="commHouse" value={formData.commHouse} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Village / City" name="commCity" value={formData.commCity} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Taluk / Tehsil" name="commTaluk" value={formData.commTaluk} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="District" name="commDistrict" value={formData.commDistrict} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="State" name="commState" value={formData.commState} onChange={handleChange} readOnly={formData.sameAsPerm} />
                  <InputField label="PIN Code" name="commPin" value={formData.commPin} onChange={handleChange} readOnly={formData.sameAsPerm} error={errors.commPin} />
                </div>
              </div>
            </div>
          </div>

          {/* IDENTIFICATION DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Identification Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleChange} required={true} error={errors.aadhaar} />
              <InputField label="PAN Number" name="pan" value={formData.pan} onChange={handleChange} required={true} error={errors.pan} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-300 print:hidden">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Aadhaar Card Upload <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*,.pdf" onChange={e => { setAadhaarFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, aadhaarFile: undefined})) }} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.aadhaarFile && <p className="text-red-500 text-xs mt-1">{errors.aadhaarFile}</p>}
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">PAN Card Upload <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*,.pdf" onChange={e => { setPanFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, panFile: undefined})) }} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.panFile && <p className="text-red-500 text-xs mt-1">{errors.panFile}</p>}
              </div>
            </div>
          </div>

          {/* EMPLOYMENT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Employment & Income Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} options={occupationOptions} required={true} error={errors.occupation} />
              <div className="lg:col-span-2"><InputField label="Employer / Business Name" name="employer" value={formData.employer} onChange={handleChange} /></div>
              <InputField label="Years of Employment / Work Experience" name="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={handleChange} />
              <InputField label="Monthly Income (₹)" name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleChange} required={true} error={errors.monthlyIncome} />
              <InputField label="Existing EMI Obligations (₹)" name="existingEmis" type="number" value={formData.existingEmis} onChange={handleChange} note="Enter 0 if none" />
            </div>
          </div>

          {/* PROPERTY DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SelectField label="Purpose of Loan" name="purposeOfLoan" value={formData.purposeOfLoan} onChange={handleChange} options={['Purchase of Plot', 'Construction of House', 'Purchase of Flat/Apartment', 'Home Renovation / Extension', 'Balance Transfer', 'Other']} />
              <SelectField label="Property Type" name="propertyType" value={formData.propertyType} onChange={handleChange} options={['Residential Plot', 'Independent House', 'Apartment / Flat', 'Row House', 'Commercial Property', 'Agricultural Land converted to Residential', 'Under Construction', 'Ready to Move']} required={true} error={errors.propertyType} />
              <InputField label="Property Market Value (₹)" name="propertyValue" type="number" value={formData.propertyValue} onChange={handleChange} required={true} error={errors.propertyValue} />
              <InputField label="Property Size (Sq.ft)" name="propertySize" type="number" step="0.01" value={formData.propertySize} onChange={handleChange} required={true} error={errors.propertySize} />
              <InputField label="Property Survey Number / Khata Number" name="propertySurveyNo" value={formData.propertySurveyNo} onChange={handleChange} />
              <InputField label="Property Location / Village" name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} />
              <div className="md:col-span-2"><InputField label="Property Address" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} required={true} error={errors.propertyAddress} /></div>
            </div>
          </div>

          {/* LOAN DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-slate-50 print:bg-transparent">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Housing Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <InputField label="Loan Amount Required (₹)" name="loanAmountRequired" type="number" value={formData.loanAmountRequired} onChange={handleChange} required={true} error={errors.loanAmountRequired} />
                {showLtvWarning && <p className="text-xs text-orange-600 font-medium -mt-2 mb-2">Note: Loan amount typically cannot exceed 80% of property market value. Officer will assess final eligibility</p>}
              </div>
              <InputField label="Applicant Contribution (₹)" name="applicantContribution" type="number" value={formData.applicantContribution} onChange={handleChange} required={true} error={errors.applicantContribution} />
              <SelectField 
                label="Loan Tenure" 
                name="tenure" 
                value={formData.tenure} 
                onChange={handleChange} 
                options={['12 Months', '24 Months', '36 Months', '48 Months', '60 Months', '84 Months', '120 Months', '180 Months', '240 Months']} 
                required={true}
                error={errors.tenure}
              />
            </div>
          </div>

          {/* PROPERTY DOCUMENTS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Property Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:hidden">
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Sale Deed / Agreement <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf,image/*" onChange={e => { setSaleDeedFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, saleDeedFile: undefined})) }} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.saleDeedFile && <p className="text-red-500 text-xs mt-1">{errors.saleDeedFile}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Encumbrance Certificate <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf,image/*" onChange={e => { setEcFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, ecFile: undefined})) }} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.ecFile && <p className="text-red-500 text-xs mt-1">{errors.ecFile}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">
                  Approved Building Plan {['Under Construction', 'Independent House'].includes(formData.propertyType) && <span className="text-red-500">*</span>}
                </label>
                <input type="file" accept=".pdf,image/*" onChange={e => { setBuildingPlanFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, buildingPlanFile: undefined})) }} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.buildingPlanFile && <p className="text-red-500 text-xs mt-1">{errors.buildingPlanFile}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Tax Paid Receipt (Optional)</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setTaxReceiptFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Khata Certificate <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf,image/*" onChange={e => { setKhataFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, khataFile: undefined})) }} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.khataFile && <p className="text-red-500 text-xs mt-1">{errors.khataFile}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Property Photos (Min 1) <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*" onChange={e => { setPropertyPhotosFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, propertyPhotosFile: undefined})) }} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.propertyPhotosFile && <p className="text-red-500 text-xs mt-1">{errors.propertyPhotosFile}</p>}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic hidden print:block">All documents must be attached separately along with this application form.</p>
          </div>

          {/* CO-APPLICANT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-slate-600 px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-slate-800 print:border print:border-slate-800 print:px-2 uppercase tracking-wider">Co-Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2"><InputField label="Co-Applicant Name" name="coName" value={formData.coName} onChange={handleChange} required={true} error={errors.coName} /></div>
              <InputField label="Relationship" name="coRel" value={formData.coRel} onChange={handleChange} required={true} error={errors.coRel} />
              <InputField label="Mobile Number" name="coMobile" value={formData.coMobile} onChange={handleChange} required={true} error={errors.coMobile} />
              
              <div className="lg:col-span-2"><SelectField label="Occupation" name="coOccupation" value={formData.coOccupation} onChange={handleChange} options={occupationOptions} required={true} error={errors.coOccupation} /></div>
              <div className="lg:col-span-2"><InputField label="Monthly Income (₹)" name="coMonthlyIncome" type="number" value={formData.coMonthlyIncome} onChange={handleChange} required={true} error={errors.coMonthlyIncome} /></div>
              
              <InputField label="Aadhaar Number" name="coAadhaar" value={formData.coAadhaar} onChange={handleChange} error={errors.coAadhaar} />
              <InputField label="PAN Number" name="coPan" value={formData.coPan} onChange={handleChange} error={errors.coPan} />
              <div className="lg:col-span-2"><InputField label="Address Details" name="coAddress" value={formData.coAddress} onChange={handleChange} /></div>
            </div>
          </div>

          {/* NOMINEE DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Nominee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2"><InputField label="Nominee Name" name="nomName" value={formData.nomName} onChange={handleChange} required={true} error={errors.nomName} /></div>
              <InputField label="Relationship" name="nomRel" value={formData.nomRel} onChange={handleChange} required={true} error={errors.nomRel} />
              <InputField label="Date of Birth" name="nomDob" type="date" value={formData.nomDob} onChange={handleChange} />
              <InputField label="Mobile Number" name="nomMobile" value={formData.nomMobile} onChange={handleChange} error={errors.nomMobile} />
              <div className="lg:col-span-3"><InputField label="Address" name="nomAddress" value={formData.nomAddress} onChange={handleChange} /></div>
              
              {showGuardian && (
                <>
                  <div className="lg:col-span-2"><InputField label="Guardian Name (For Minor)" name="guardianName" value={formData.guardianName} onChange={handleChange} required={true} error={errors.guardianName} /></div>
                  <div className="lg:col-span-2"><InputField label="Guardian Relationship" name="guardianRel" value={formData.guardianRel} onChange={handleChange} required={true} error={errors.guardianRel} /></div>
                </>
              )}
            </div>
          </div>

          {/* DECLARATION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-blue-50/50 print:bg-transparent text-justify">
            <h3 className="text-xs font-black text-[#0F4C81] mb-2 uppercase tracking-wider">Declaration</h3>
            <p className="text-xs text-slate-700 leading-relaxed print:text-slate-900 font-medium italic">
              "I hereby declare that the information provided by me is true and correct. I agree to abide by the rules and regulations of ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD I authorize the society to conduct legal and technical verifications of the property."
            </p>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-4 uppercase tracking-wider">Applicant Signature</h3>
              <div className="space-y-4">
                <InputField label="Place" name="appPlace" value={formData.appPlace} onChange={handleChange} />
                <InputField label="Date" name="appDate" type="date" value={formData.appDate} onChange={handleChange} />
                <div className="mt-4">

                </div>
                <div className="flex justify-start items-end h-16">
                  <div className="w-48 border-t border-slate-800 pt-2 text-[10px] font-bold uppercase">Signature</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-4 uppercase tracking-wider">Co-Applicant Signature</h3>
              <div className="space-y-4">
                <div className="mt-4">

                </div>
                <div className="flex justify-start items-end h-32">
                  <div className="w-48 border-t border-slate-800 pt-2 text-[10px] font-bold uppercase">Signature</div>
                </div>
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
              {isSubmitting ? 'Submitting Application...' : 'Submit Housing Loan Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
