import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, FileCheck, Plus, Trash2 } from 'lucide-react';

interface AgriculturalLoanApplicationProps {
  setCurrentTab?: (tab: string) => void;
}

const InputField = ({ label, name, type = "text", value, onChange, placeholder = "", width = "w-full", readOnly = false, required = false, error, note, step }: any) => {
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
    <div className={`${width} mb-3`}>
      <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        max={type === 'date' ? "9999-12-31" : undefined}
        step={step}
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
  <div className={`${width} mb-3`}>
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

const RadioGroup = ({ label, name, value, onChange, options, required = false, error }: any) => (
  <div className="mb-3">
    <label className="block text-[10px] font-bold text-[#0F4C81] mb-2 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
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
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const CheckboxField = ({ label, name, checked, onChange, required = false, error, className = "mb-3" }: any) => (
  <div className={className}>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className={`w-4 h-4 text-[#0F4C81] rounded ${error ? 'border-red-500' : 'border-slate-300'} focus:ring-[#0F4C81] print:appearance-none print:w-4 print:h-4 print:border-2 print:border-[#0F4C81] print:rounded-sm`}
      />
      <span className="text-xs font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
    </label>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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

export const AgriculturalLoanApplication: React.FC<AgriculturalLoanApplicationProps> = ({ setCurrentTab }) => {
  const { user, submitServiceApplication, getCustomerByCustomerId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Files
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [rtcFile, setRtcFile] = useState<File | null>(null);
  const [mutationFile, setMutationFile] = useState<File | null>(null);
  const [noDueFile, setNoDueFile] = useState<File | null>(null);
  const [khataFile, setKhataFile] = useState<File | null>(null);
  const [shareCertFile, setShareCertFile] = useState<File | null>(null);
  const [passbookFile, setPassbookFile] = useState<File | null>(null);
  const [taxReceiptFile, setTaxReceiptFile] = useState<File | null>(null);


  const generateAppNo = () => `AL-${Math.floor(100000 + Math.random() * 900000)}`;

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
    permVillage: '',
    permTaluk: '',
    permDistrict: '',
    permState: '',
    permPin: '',

    sameAsPerm: false,
    commHouseNo: '',
    commStreet: '',
    commHouse: '',
    commVillage: '',
    commTaluk: '',
    commDistrict: '',
    commState: '',
    commPin: '',

    aadhaar: '',
    pan: '',

    tractorAvailable: 'No',
    tractorDetails: '',
    irrigationFacility: 'No',
    irrigationDetails: '',
    farmEquipment: '',
    livestock: '',
    farmingExperience: '',

    loanType: '',
    loanAmount: '',
    loanPurpose: '',
    loanTenure: '',

    existingMember: 'Yes',
    memberNoExisting: '',
    shareCapitalCert: '',
    applyMember: 'No',
    sharesToPurchase: '',

    accNumber: '',
    accBranch: '',
    accIfsc: '',
    aadhaarLinked: false,

    coName: '',
    coRel: '',
    coMobile: '',
    coAadhaar: '',
    coOccupation: '',
    coMonthlyIncome: '',

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

  const [landDetails, setLandDetails] = useState([{ id: Date.now(), surveyNo: '', hissaNo: '', village: '', landType: '', acreage: '', irrigation: '', ownership: '' }]);
  const [cropDetails, setCropDetails] = useState([{ id: Date.now(), cropName: '', area: '', season: '', expectedIncome: '' }]);

  const handleLandChange = (id: number, field: string, value: string) => {
    let finalValue = value;
    if (field === 'acreage' && value && Number(value) < 0) finalValue = '0';
    setLandDetails(prev => prev.map(row => row.id === id ? { ...row, [field]: finalValue } : row));
  };
  const addLandRow = () => setLandDetails(prev => [...prev, { id: Date.now(), surveyNo: '', hissaNo: '', village: '', landType: '', acreage: '', irrigation: '', ownership: '' }]);
  const removeLandRow = (id: number) => {
    if (landDetails.length > 1) {
      setLandDetails(prev => prev.filter(row => row.id !== id));
    }
  };

  const handleCropChange = (id: number, field: string, value: string) => {
    let finalValue = value;
    if (['area', 'expectedIncome'].includes(field) && value && Number(value) < 0) finalValue = '0';
    setCropDetails(prev => prev.map(row => row.id === id ? { ...row, [field]: finalValue } : row));
  };
  const addCropRow = () => setCropDetails(prev => [...prev, { id: Date.now(), cropName: '', area: '', season: '', expectedIncome: '' }]);
  const removeCropRow = (id: number) => {
    if (cropDetails.length > 1) {
      setCropDetails(prev => prev.filter(row => row.id !== id));
    }
  };

  const fetchCustomerDetails = async (id: string) => {
    if (!id) return;
    const customer = await getCustomerByCustomerId(id);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        memberNoExisting: customer.memberId || prev.memberNoExisting,
        accNumber: customer.accountNumber || prev.accNumber,
        accBranch: customer.branch || prev.accBranch,
        accIfsc: customer.ifsc || prev.accIfsc,
        fullName: customer.fullName || prev.fullName,
        permHouse: customer.address || prev.permHouse,
        mobile: customer.phone || prev.mobile,
        dob: customer.dob || prev.dob,
        aadhaar: customer.aadhaar || prev.aadhaar,
        pan: customer.pan || prev.pan,
        email: customer.email || prev.email,
      }));
    }
  };

  useEffect(() => {
    if (user) {
      setFormData((prev: any) => ({
        ...prev,
        memberNoExisting: prev.memberNoExisting || user.memberId || '',
        accNumber: prev.accNumber || user.accountNumber || '',
        accBranch: prev.accBranch || user.branch || '',
        accIfsc: prev.accIfsc || user.ifscCode || '',
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
    const draft = localStorage.getItem('draft_AgriculturalLoanApplication');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed.formData || parsed);
        if (parsed.landDetails) setLandDetails(parsed.landDetails);
        if (parsed.cropDetails) setCropDetails(parsed.cropDetails);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('draft_AgriculturalLoanApplication', JSON.stringify({ formData, landDetails, cropDetails }));
  }, [formData, landDetails, cropDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
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
          newData.commVillage = prev.permVillage;
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
        if (['loanAmount', 'coMonthlyIncome', 'farmingExperience'].includes(name) && value && Number(value) < 0) {
          finalValue = '0';
        }
        
        const newData = { ...prev, [name]: finalValue };
        
        if (name === 'existingMember' && finalValue === 'Yes' && user) {
          newData.memberNoExisting = user.memberId || '';
          newData.accNumber = user.accountNumber || '';
          newData.accBranch = user.branch || '';
          newData.accIfsc = user.ifscCode || '';
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
      'permHouse', 'permVillage', 'permTaluk', 'permDistrict', 'permState', 'permPin',
      'aadhaar', 'loanType', 'loanAmount', 'loanPurpose', 'loanTenure',
      'nomName', 'nomRel'
    ];

    reqFields.forEach(f => {
      if (!formData[f] || String(formData[f]).trim() === '') {
        newErrors[f] = "This field is required";
      }
    });

    if (formData.existingMember === 'Yes') {
      if (!formData.memberNoExisting) newErrors.memberNoExisting = "Membership number required";
      if (!formData.shareCapitalCert) newErrors.shareCapitalCert = "Share Capital Cert number required";
    }

    if (formData.coName) {
      if (!formData.coRel) newErrors.coRel = "Co-Applicant relationship required";
      if (!formData.coMobile) newErrors.coMobile = "Co-Applicant mobile required";
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Must be a 10-digit number";
    if (formData.coMobile && !/^\d{10}$/.test(formData.coMobile)) newErrors.coMobile = "Must be a 10-digit number";
    if (formData.nomMobile && formData.nomMobile.trim() !== '' && !/^\d{10}$/.test(formData.nomMobile)) newErrors.nomMobile = "Must be a 10-digit number";

    if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar)) newErrors.aadhaar = "Must be a 12-digit number";
    if (formData.coAadhaar && formData.coAadhaar.trim() !== '' && !/^\d{12}$/.test(formData.coAadhaar)) newErrors.coAadhaar = "Must be a 12-digit number";

    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan)) newErrors.pan = "Invalid PAN format";

    if (formData.permPin && !/^\d{6}$/.test(formData.permPin)) newErrors.permPin = "Must be a 6-digit number";
    if (formData.commPin && formData.commPin.trim() !== '' && !/^\d{6}$/.test(formData.commPin)) newErrors.commPin = "Must be a 6-digit number";

    if (formData.nomDob) {
      const age = (new Date().getTime() - new Date(formData.nomDob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) {
        if (!formData.guardianName) newErrors.guardianName = "Guardian name is required for minor";
        if (!formData.guardianRel) newErrors.guardianRel = "Guardian relationship is required for minor";
      }
    }

    let totalLandAcreage = 0;
    landDetails.forEach((row, index) => {
      if (!row.surveyNo) newErrors[`land_${index}_surveyNo`] = "Required";
      if (!row.village) newErrors[`land_${index}_village`] = "Required";
      if (!row.landType) newErrors[`land_${index}_landType`] = "Required";
      if (!row.acreage) newErrors[`land_${index}_acreage`] = "Required";
      if (!row.irrigation) newErrors[`land_${index}_irrigation`] = "Required";
      if (row.acreage) totalLandAcreage += Number(row.acreage) || 0;
    });

    let totalCropArea = 0;
    cropDetails.forEach((row, index) => {
      if (!row.cropName) newErrors[`crop_${index}_cropName`] = "Required";
      if (!row.area) newErrors[`crop_${index}_area`] = "Required";
      if (!row.season) newErrors[`crop_${index}_season`] = "Required";
      if (row.area) totalCropArea += Number(row.area) || 0;
    });

    if (totalCropArea > totalLandAcreage) {
      newErrors.cropAreaWarning = "Total area cultivated exceeds total land acreage.";
    }

    if (!photoFile) newErrors.photoFile = "Applicant Photo is required";
    if (!aadhaarFile) newErrors.aadhaarFile = "Aadhaar Card is required";
    if (formData.pan && !panFile) newErrors.panFile = "PAN Card upload is required if PAN is provided";
    if (!rtcFile) newErrors.rtcFile = "RTC / Pahani is required";
    if (!mutationFile) newErrors.mutationFile = "Mutation Extract is required";
    if (!noDueFile) newErrors.noDueFile = "No Due Certificate is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !newErrors.cropAreaWarning;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.existingMember === 'No') {
      alert("You must be an active member of Odiyooru Souharda Cooperative Society to apply for an agricultural loan. Please contact your branch to complete membership first.");
      return;
    }

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
      if (rtcFile) images.rtc = await fileToBase64(rtcFile);
      if (mutationFile) images.mutationExtract = await fileToBase64(mutationFile);
      if (noDueFile) images.noDueCert = await fileToBase64(noDueFile);
      if (khataFile) images.khataCert = await fileToBase64(khataFile);
      if (shareCertFile) images.shareCert = await fileToBase64(shareCertFile);
      if (passbookFile) images.passbook = await fileToBase64(passbookFile);
      if (taxReceiptFile) images.taxReceipt = await fileToBase64(taxReceiptFile);

    } catch (err) {
      console.error('Failed to convert images to base64', err);
    }

    const payload = {
      ...formData,
      landDetails,
      cropDetails
    };

    const res = await submitServiceApplication('Agricultural Loan', payload, images);
    
    setIsSubmitting(false);
    if (res) {
      localStorage.removeItem('draft_AgriculturalLoanApplication');
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
            Your agricultural loan application has been submitted successfully. Our officer will contact you within 2 working days on your registered mobile number
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

  const applicantAge = useMemo(() => {
    if (formData.dob) {
      const age = Math.floor((new Date().getTime() - new Date(formData.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      return age > 0 ? `${age} years` : '';
    }
    return '';
  }, [formData.dob]);

  let showGuardian = false;
  if (formData.nomDob) {
    const age = (new Date().getTime() - new Date(formData.nomDob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    showGuardian = age < 18;
  }
  
  const landTypeOptions = ['Dry Land (Jirayat)', 'Wet Land (Bagayat)', 'Garden Land', 'Converted Land', 'Government Leased Land', 'Other'];
  const irrigationOptions = ['Rain Fed', 'Canal Irrigated', 'Borewell', 'Open Well', 'Drip Irrigation', 'Not Irrigated'];
  const seasonOptions = ['Kharif (June–October)', 'Rabi (November–March)', 'Zaid / Summer (April–June)', 'Perennial (Year Round)'];
  const ownershipOptions = ['Owned', 'Joint Owned', 'Leased', 'Mortgaged'];

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
              <div className="lg:col-span-2"><InputField label="Occupation" name="occupation" value="Agriculturist / Farmer" readOnly /></div>
              <div className="lg:col-span-4"><InputField label="Applicant Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required={true} error={errors.fullName} /></div>
              <div className="lg:col-span-4"><InputField label="Father's / Husband's Name" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} required={true} error={errors.fatherHusbandName} /></div>
              <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required={true} error={errors.dob} />
              <InputField label="Age" name="age" value={applicantAge} readOnly />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} required={true} error={errors.gender} />
              <InputField label="Years Farming" name="farmingExperience" type="number" value={formData.farmingExperience} onChange={handleChange} />
            </div>

            <div className="mb-2 print:hidden">
              <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">
                Photo Upload <span className="text-red-500">*</span>
              </label>
              <input type="file" accept="image/*" onChange={e => { setPhotoFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, photoFile: undefined})) }} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              {errors.photoFile && <p className="text-red-500 text-xs mt-1">{errors.photoFile}</p>}
            </div>
          </div>

          {/* CONTACT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required={true} error={errors.mobile} />
              <InputField label="Email ID (Optional)" name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>
          </div>

          {/* ADDRESS DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-end border-b border-slate-200 pb-1 mb-3 min-h-[32px]">
                  <h3 className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider">Permanent Address</h3>
                </div>
                <InputField label="House Number / Name" name="permHouseNo" value={formData.permHouseNo} onChange={handleChange} />
                <InputField label="Street" name="permStreet" value={formData.permStreet} onChange={handleChange} />
                <InputField label="Address Details" name="permHouse" value={formData.permHouse} onChange={handleChange} required={true} error={errors.permHouse} />
                <InputField label="Village" name="permVillage" value={formData.permVillage} onChange={handleChange} required={true} error={errors.permVillage} />
                <InputField label="Taluk" name="permTaluk" value={formData.permTaluk} onChange={handleChange} required={true} error={errors.permTaluk} />
                <InputField label="District" name="permDistrict" value={formData.permDistrict} onChange={handleChange} required={true} error={errors.permDistrict} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="State" name="permState" value={formData.permState} onChange={handleChange} required={true} error={errors.permState} />
                  <InputField label="PIN Code" name="permPin" value={formData.permPin} onChange={handleChange} required={true} error={errors.permPin} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end border-b border-slate-200 pb-1 mb-3 min-h-[32px]">
                  <h3 className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider">Communication Address</h3>
                  <CheckboxField label="Same as Permanent" name="sameAsPerm" checked={formData.sameAsPerm} onChange={handleChange} className="mb-0" />
                </div>
                <InputField label="House Number / Name" name="commHouseNo" value={formData.commHouseNo} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Street" name="commStreet" value={formData.commStreet} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Address Details" name="commHouse" value={formData.commHouse} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Village" name="commVillage" value={formData.commVillage} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Taluk" name="commTaluk" value={formData.commTaluk} onChange={handleChange} readOnly={formData.sameAsPerm} />
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
              <InputField label="PAN Number (Optional)" name="pan" value={formData.pan} onChange={handleChange} error={errors.pan} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-300 print:hidden">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Aadhaar Card Upload <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*,.pdf" onChange={e => { setAadhaarFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, aadhaarFile: undefined})) }} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.aadhaarFile && <p className="text-red-500 text-xs mt-1">{errors.aadhaarFile}</p>}
              </div>
              {formData.pan && (
                <div className="flex flex-col animate-fade-in">
                  <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">PAN Card Upload <span className="text-red-500">*</span></label>
                  <input type="file" accept="image/*,.pdf" onChange={e => { setPanFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, panFile: undefined})) }} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                  {errors.panFile && <p className="text-red-500 text-xs mt-1">{errors.panFile}</p>}
                </div>
              )}
            </div>
          </div>

          {/* LAND DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Land Details <span className="text-red-500">*</span></h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/8">Survey No <span className="text-red-500">*</span></th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/8">Hissa No</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/6">Village Name <span className="text-red-500">*</span></th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/6">Land Type <span className="text-red-500">*</span></th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/8">Ownership</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/8">Total Acreage <span className="text-red-500">*</span></th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/6">Irrigation <span className="text-red-500">*</span></th>
                    <th className="border-b border-slate-300 pb-2 print:hidden w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {landDetails.map((row, index) => (
                    <tr key={row.id}>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.surveyNo} onChange={e => { handleLandChange(row.id, 'surveyNo', e.target.value); setErrors(prev => ({...prev, [`land_${index}_surveyNo`]: undefined})) }} className={`w-full px-2 py-1 border ${errors[`land_${index}_surveyNo`] ? 'border-red-500' : 'border-slate-300'} rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:border-none`} />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.hissaNo} onChange={e => handleLandChange(row.id, 'hissaNo', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:border-none" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.village} onChange={e => { handleLandChange(row.id, 'village', e.target.value); setErrors(prev => ({...prev, [`land_${index}_village`]: undefined})) }} className={`w-full px-2 py-1 border ${errors[`land_${index}_village`] ? 'border-red-500' : 'border-slate-300'} rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:border-none`} />
                      </td>
                      <td className="py-2 pr-2">
                        <select value={row.landType} onChange={e => { handleLandChange(row.id, 'landType', e.target.value); setErrors(prev => ({...prev, [`land_${index}_landType`]: undefined})) }} className={`w-full px-2 py-1 border ${errors[`land_${index}_landType`] ? 'border-red-500' : 'border-slate-300'} rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:appearance-none print:border-none`}>
                          <option value="">Select</option>
                          {landTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <select value={row.ownership} onChange={e => handleLandChange(row.id, 'ownership', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:appearance-none print:border-none">
                          <option value="">Select</option>
                          {ownershipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" step="0.01" value={row.acreage} onChange={e => { handleLandChange(row.id, 'acreage', e.target.value); setErrors(prev => ({...prev, [`land_${index}_acreage`]: undefined})) }} className={`w-full px-2 py-1 border ${errors[`land_${index}_acreage`] ? 'border-red-500' : 'border-slate-300'} rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:border-none`} />
                      </td>
                      <td className="py-2 pr-2">
                        <select value={row.irrigation} onChange={e => { handleLandChange(row.id, 'irrigation', e.target.value); setErrors(prev => ({...prev, [`land_${index}_irrigation`]: undefined})) }} className={`w-full px-2 py-1 border ${errors[`land_${index}_irrigation`] ? 'border-red-500' : 'border-slate-300'} rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:appearance-none print:border-none`}>
                          <option value="">Select</option>
                          {irrigationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      <td className="py-2 text-right print:hidden">
                        {landDetails.length > 1 && (
                          <button type="button" onClick={() => removeLandRow(row.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addLandRow} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#0F4C81] hover:text-blue-900 print:hidden">
              <Plus className="w-3 h-3" /> Add Land Entry
            </button>
          </div>

          {/* CROP DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Crop Details <span className="text-red-500">*</span></h3>
            
            {errors.cropAreaWarning && <p className="text-xs text-orange-600 font-bold mb-3">{errors.cropAreaWarning}</p>}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/4">Crop Name <span className="text-red-500">*</span></th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/4">Area Cultivated (Acre) <span className="text-red-500">*</span></th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/4">Season <span className="text-red-500">*</span></th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/4">Expected Income (₹)</th>
                    <th className="border-b border-slate-300 pb-2 print:hidden w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {cropDetails.map((row, index) => (
                    <tr key={row.id}>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.cropName} onChange={e => { handleCropChange(row.id, 'cropName', e.target.value); setErrors(prev => ({...prev, [`crop_${index}_cropName`]: undefined, cropAreaWarning: undefined})) }} className={`w-full px-2 py-1 border ${errors[`crop_${index}_cropName`] ? 'border-red-500' : 'border-slate-300'} rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:border-none`} />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" step="0.01" value={row.area} onChange={e => { handleCropChange(row.id, 'area', e.target.value); setErrors(prev => ({...prev, [`crop_${index}_area`]: undefined, cropAreaWarning: undefined})) }} className={`w-full px-2 py-1 border ${errors[`crop_${index}_area`] ? 'border-red-500' : 'border-slate-300'} rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:border-none`} />
                      </td>
                      <td className="py-2 pr-2">
                        <select value={row.season} onChange={e => { handleCropChange(row.id, 'season', e.target.value); setErrors(prev => ({...prev, [`crop_${index}_season`]: undefined, cropAreaWarning: undefined})) }} className={`w-full px-2 py-1 border ${errors[`crop_${index}_season`] ? 'border-red-500' : 'border-slate-300'} rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:appearance-none print:border-none`}>
                          <option value="">Select</option>
                          {seasonOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" value={row.expectedIncome} onChange={e => handleCropChange(row.id, 'expectedIncome', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-[#0F4C81] outline-none text-sm print:border-none" />
                      </td>
                      <td className="py-2 text-right print:hidden">
                        {cropDetails.length > 1 && (
                          <button type="button" onClick={() => removeCropRow(row.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addCropRow} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#0F4C81] hover:text-blue-900 print:hidden">
              <Plus className="w-3 h-3" /> Add Crop Entry
            </button>
          </div>

          {/* AGRICULTURAL ASSETS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Agricultural Assets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <RadioGroup label="Tractor Available" name="tractorAvailable" value={formData.tractorAvailable} onChange={handleChange} options={['Yes', 'No']} />
                {formData.tractorAvailable === 'Yes' && (
                  <div className="mt-2 animate-fade-in">
                    <InputField label="Tractor Details (Make, Model, Year)" name="tractorDetails" value={formData.tractorDetails} onChange={handleChange} />
                  </div>
                )}
              </div>
              <div>
                <RadioGroup label="Irrigation Facility Available" name="irrigationFacility" value={formData.irrigationFacility} onChange={handleChange} options={['Yes', 'No']} />
                {formData.irrigationFacility === 'Yes' && (
                  <div className="mt-2 animate-fade-in">
                    <InputField label="Irrigation Source Details" name="irrigationDetails" value={formData.irrigationDetails} onChange={handleChange} />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Farm Equipment Details" name="farmEquipment" value={formData.farmEquipment} onChange={handleChange} placeholder="e.g. Tractor, Pump set, Sprayer" />
              <InputField label="Livestock Details" name="livestock" value={formData.livestock} onChange={handleChange} placeholder="e.g. 2 cows, 5 goats, 10 hens" />
            </div>
          </div>

          {/* LOAN DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-slate-50 print:bg-transparent">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <SelectField label="Type of Agricultural Loan" name="loanType" value={formData.loanType} onChange={handleChange} options={['Crop Loan (Short Term)', 'Farm Equipment Loan', 'Land Development Loan', 'Irrigation Development Loan', 'Horticulture Loan', 'Animal Husbandry Loan', 'Fishery Loan', 'Allied Agricultural Activity', 'Other']} required={true} error={errors.loanType} />
              </div>
              <div className="lg:col-span-2">
                <SelectField label="Purpose of Loan" name="loanPurpose" value={formData.loanPurpose} onChange={handleChange} options={['Seeds and Fertilizers', 'Pesticides', 'Farm Labour', 'Land Development', 'Purchase of Equipment', 'Irrigation Setup', 'Livestock Purchase', 'Other']} required={true} error={errors.loanPurpose} />
              </div>
              <div className="lg:col-span-2">
                <InputField label="Loan Amount Required (₹)" name="loanAmount" type="number" value={formData.loanAmount} onChange={handleChange} required={true} error={errors.loanAmount} />
              </div>
              <div className="lg:col-span-2">
                <SelectField label="Loan Tenure" name="loanTenure" value={formData.loanTenure} onChange={handleChange} options={['6 Months', '12 Months', '18 Months', '24 Months', '36 Months', '48 Months', '60 Months']} required={true} error={errors.loanTenure} />
              </div>
            </div>
          </div>

          {/* CO-APPLICANT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-slate-600 px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-slate-800 print:border print:border-slate-800 print:px-2 uppercase tracking-wider">Co-Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2"><InputField label="Co-Applicant Name" name="coName" value={formData.coName} onChange={handleChange} /></div>
              <InputField label="Relationship" name="coRel" value={formData.coRel} onChange={handleChange} error={errors.coRel} />
              <InputField label="Mobile Number" name="coMobile" value={formData.coMobile} onChange={handleChange} error={errors.coMobile} />
              
              <InputField label="Aadhaar Number" name="coAadhaar" value={formData.coAadhaar} onChange={handleChange} error={errors.coAadhaar} />
              <InputField label="Occupation" name="coOccupation" value={formData.coOccupation} onChange={handleChange} />
              <div className="lg:col-span-2"><InputField label="Monthly Income (₹)" name="coMonthlyIncome" type="number" value={formData.coMonthlyIncome} onChange={handleChange} /></div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold italic">Note: Relationship and Mobile Number become required if Co-Applicant Name is provided.</p>
          </div>

          {/* BANK MEMBERSHIP & ACCOUNT DETAILS */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-slate-200 rounded-xl p-5 print:border-slate-400">
              <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Bank Membership</h3>
              <RadioGroup label="Existing Member of Society?" name="existingMember" value={formData.existingMember} onChange={handleChange} options={['Yes', 'No']} />
              
              {formData.existingMember === 'Yes' ? (
                <div className="grid grid-cols-1 gap-4 animate-fade-in mt-4">
                  <InputField label="Membership Number" name="memberNoExisting" value={formData.memberNoExisting} onChange={handleChange} required={true} error={errors.memberNoExisting} readOnly={!!user} />
                  <InputField label="Share Capital Certificate Number" name="shareCapitalCert" value={formData.shareCapitalCert} onChange={handleChange} required={true} error={errors.shareCapitalCert} />
                </div>
              ) : (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs font-bold text-orange-800">You must be an active member of Odiyooru Souharda Cooperative Society to apply for an agricultural loan. Please contact your branch to complete membership first.</p>
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl p-5 print:border-slate-400">
              <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Bank Account Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <InputField label="Account Number" name="accNumber" value={formData.accNumber} onChange={handleChange} readOnly={!!user} />
                <InputField label="Branch Name" name="accBranch" value={formData.accBranch} onChange={handleChange} readOnly={!!user} />
                <InputField label="IFSC Code" name="accIfsc" value={formData.accIfsc} onChange={handleChange} readOnly={!!user} />
                <div className="mt-2">
                  <CheckboxField label="I confirm my bank account is linked to my Aadhaar number" name="aadhaarLinked" checked={formData.aadhaarLinked} onChange={handleChange} />
                </div>
              </div>
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

          {/* DOCUMENT UPLOADS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Document Uploads</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:hidden">
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">RTC / Pahani <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf,image/*" onChange={e => { setRtcFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, rtcFile: undefined})) }} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.rtcFile && <p className="text-red-500 text-xs mt-1">{errors.rtcFile}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Mutation Extract <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf,image/*" onChange={e => { setMutationFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, mutationFile: undefined})) }} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.mutationFile && <p className="text-red-500 text-xs mt-1">{errors.mutationFile}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">No Due Certificate <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf,image/*" onChange={e => { setNoDueFile(e.target.files?.[0] || null); setErrors(prev => ({...prev, noDueFile: undefined})) }} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
                {errors.noDueFile && <p className="text-red-500 text-xs mt-1">{errors.noDueFile}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Khata Certificate</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setKhataFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Share Certificate Copy</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setShareCertFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Bank Passbook Copy</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setPassbookFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Land Tax Receipt</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setTaxReceiptFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
            </div>
          </div>

          {/* DECLARATION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-blue-50/50 print:bg-transparent text-justify">
            <h3 className="text-xs font-black text-[#0F4C81] mb-2 uppercase tracking-wider">Declaration</h3>
            <p className="text-xs text-slate-700 leading-relaxed print:text-slate-900 font-medium italic">
              "I hereby declare that the information provided by me is true and correct. I agree to abide by the rules and regulations of ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD. I authorize the society to verify the land records and conduct field inspections."
            </p>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="grid grid-cols-1 gap-12 mb-12">
            <div>
              <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-4 uppercase tracking-wider">Applicant Signature</h3>
              <div className="space-y-4 max-w-sm">
                <InputField label="Place" name="appPlace" value={formData.appPlace} onChange={handleChange} />
                <InputField label="Date" name="appDate" type="date" value={formData.appDate} onChange={handleChange} />
                <div className="mt-4">

                </div>
                <div className="flex justify-start items-end h-16">
                  <div className="w-48 border-t border-slate-800 pt-2 text-[10px] font-bold uppercase">Signature</div>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end mt-12 pt-8 border-t border-slate-200 print:hidden">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || formData.existingMember === 'No'}
              className={`px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all ${isSubmitting || formData.existingMember === 'No' ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Agricultural Loan Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
