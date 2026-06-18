import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, FileCheck, Plus, Trash2 } from 'lucide-react';

interface AgriculturalLoanApplicationProps {
  setCurrentTab?: (tab: string) => void;
}

const InputField = ({ label, name, type = "text", value, onChange, placeholder = "", width = "w-full", readOnly = false }: any) => (
  <div className={`${width} mb-3`}>
    <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] capitalize bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent ${readOnly ? 'bg-slate-50' : ''}`}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, width = "w-full" }: any) => (
  <div className={`${width} mb-3`}>
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

export const AgriculturalLoanApplication: React.FC<AgriculturalLoanApplicationProps> = ({ setCurrentTab }) => {
  const { user, submitServiceApplication, getCustomerByCustomerId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Files
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [rtcFile, setRtcFile] = useState<File | null>(null);
  const [mutationFile, setMutationFile] = useState<File | null>(null);
  const [noDueFile, setNoDueFile] = useState<File | null>(null);
  const [shareCertFile, setShareCertFile] = useState<File | null>(null);
  const [passbookFile, setPassbookFile] = useState<File | null>(null);
  const [taxReceiptFile, setTaxReceiptFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const generateAppNo = () => `AL-${Math.floor(100000 + Math.random() * 900000)}`;

  
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
        aadhaar: customer.aadharNumber || prev.aadhaar,
        pan: customer.panNumber || prev.pan,
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
    fullName: '',
    fatherHusbandName: '',
    dob: '',
    age: '',
    gender: '',
    maritalStatus: '',

    // Contact
    mobile: '',
    altMobile: '',
    email: '',

    // Address
    permHouse: '',
    commHouse: '',
    village: '',
    taluk: '',
    district: '',
    state: '',
    pinCode: '',

    // ID
    aadhaar: '',
    pan: '',

    // Agricultural Assets
    tractorAvailable: 'No',
    irrigationFacility: 'No',
    farmEquipment: '',
    livestock: '',

    // Loan Details
    loanType: '',
    loanAmount: '',
    loanPurpose: '',
    loanTenure: '',

    // Bank Membership
    existingMember: 'Yes',
    memberNoExisting: '',
    shareCapitalCert: '',
    applyMember: 'No',
    sharesToPurchase: '',

    // Bank Account
    accNumber: '',
    accBranch: '',
    accIfsc: '',

    // Nominee
    nomName: '',
    nomRel: '',
    nomMobile: '',
    nomAddress: '',

    // Signatures
    appPlace: '',
    appDate: new Date().toISOString().split('T')[0],
  });

  // Table Data
  const [landDetails, setLandDetails] = useState([{ id: Date.now(), surveyNo: '', village: '', landType: '', acreage: '', irrigation: '' }]);
  const [cropDetails, setCropDetails] = useState([{ id: Date.now(), cropName: '', area: '', season: '', yield: '' }]);

  const handleLandChange = (id: number, field: string, value: string) => {
    setLandDetails(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };
  const addLandRow = () => setLandDetails(prev => [...prev, { id: Date.now(), surveyNo: '', village: '', landType: '', acreage: '', irrigation: '' }]);
  const removeLandRow = (id: number) => setLandDetails(prev => prev.filter(row => row.id !== id));

  const handleCropChange = (id: number, field: string, value: string) => {
    setCropDetails(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };
  const addCropRow = () => setCropDetails(prev => [...prev, { id: Date.now(), cropName: '', area: '', season: '', yield: '' }]);
  const removeCropRow = (id: number) => setCropDetails(prev => prev.filter(row => row.id !== id));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
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
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      alert("Please upload the Passport Size Photograph.");
      return;
    }
    if (!formData.loanType || !formData.loanAmount || !formData.loanTenure) {
      alert("Please fill in Loan Type, Required Loan Amount, and Tenure.");
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
      if (shareCertFile) images.shareCert = await fileToBase64(shareCertFile);
      if (passbookFile) images.passbook = await fileToBase64(passbookFile);
      if (taxReceiptFile) images.taxReceipt = await fileToBase64(taxReceiptFile);
      if (signatureFile) images.signature = await fileToBase64(signatureFile);
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
            Your Agricultural Loan Application (No: {formData.applicationNo}) for ₹{Number(formData.loanAmount).toLocaleString('en-IN')} has been successfully received.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">Application Progress</h3>
            <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span>Application Received</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Field Officer Verification</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Loan Disbursement</span>
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

          {/* APPLICANT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-2"><InputField label="Customer ID" name="customerId" value={user?.customerId || ''} readOnly /></div>
              <div className="lg:col-span-2"><InputField label="Membership Number" name="memberNo" value={formData.memberNo} onChange={handleChange} placeholder="Enter to Auto-fill" /></div>
              <div className="lg:col-span-4"><InputField label="Applicant Full Name" name="fullName" value={formData.fullName} onChange={handleChange} /></div>
              <div className="lg:col-span-4"><InputField label="Father's / Husband's Name" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} /></div>
              <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
              <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
              <SelectField label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={['Single', 'Married', 'Divorced', 'Widowed']} />
            </div>

            <div className="mb-2 print:hidden">
              <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Photo Upload</label>
              <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
            </div>
          </div>

          {/* CONTACT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} />
              <InputField label="Alternate Mobile Number" name="altMobile" value={formData.altMobile} onChange={handleChange} />
              <InputField label="Email ID" name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>
          </div>

          {/* ADDRESS DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Permanent Address" name="permHouse" value={formData.permHouse} onChange={handleChange} />
              <InputField label="Communication Address" name="commHouse" value={formData.commHouse} onChange={handleChange} />
              <InputField label="Village" name="village" value={formData.village} onChange={handleChange} />
              <InputField label="Taluk" name="taluk" value={formData.taluk} onChange={handleChange} />
              <InputField label="District" name="district" value={formData.district} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-2">
                <InputField label="State" name="state" value={formData.state} onChange={handleChange} />
                <InputField label="PIN Code" name="pinCode" value={formData.pinCode} onChange={handleChange} />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-300 print:hidden">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Aadhaar Card Upload</label>
                <input type="file" accept="image/*,.pdf" onChange={e => setAadhaarFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">PAN Card Upload</label>
                <input type="file" accept="image/*,.pdf" onChange={e => setPanFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
            </div>
          </div>

          {/* LAND DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Land Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/5">Survey Number</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/5">Village Name</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/5">Land Type</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/5">Total Acreage</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/5">Irrigation Status</th>
                    <th className="border-b border-slate-300 pb-2 print:hidden w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {landDetails.map((row, index) => (
                    <tr key={row.id}>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.surveyNo} onChange={(e) => handleLandChange(row.id, 'surveyNo', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] capitalize bg-white print:border-none print:p-0 print:bg-transparent" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.village} onChange={(e) => handleLandChange(row.id, 'village', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] capitalize bg-white print:border-none print:p-0 print:bg-transparent" />
                      </td>
                      <td className="py-2 pr-2">
                        <select value={row.landType} onChange={(e) => handleLandChange(row.id, 'landType', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] bg-white print:border-none print:p-0 print:appearance-none print:bg-transparent">
                          <option value="">Select Type</option>
                          <option value="Agricultural Land">Agricultural Land</option>
                          <option value="Plantation Land">Plantation Land</option>
                          <option value="Horticulture Land">Horticulture Land</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" value={row.acreage} onChange={(e) => handleLandChange(row.id, 'acreage', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] capitalize bg-white print:border-none print:p-0 print:bg-transparent" />
                      </td>
                      <td className="py-2 pr-2">
                        <select value={row.irrigation} onChange={(e) => handleLandChange(row.id, 'irrigation', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] bg-white print:border-none print:p-0 print:appearance-none print:bg-transparent">
                          <option value="">Select Status</option>
                          <option value="Wet Land">Wet Land</option>
                          <option value="Dry Land">Dry Land</option>
                          <option value="Irrigated">Irrigated</option>
                          <option value="Rain-fed">Rain-fed</option>
                        </select>
                      </td>
                      <td className="py-2 text-right print:hidden">
                        {index > 0 && (
                          <button onClick={() => removeLandRow(row.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addLandRow} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#0F4C81] hover:underline print:hidden">
                <Plus className="w-3 h-3" /> Add Land Entry
              </button>
            </div>
          </div>

          {/* CROP DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Crop Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/4">Crop Name</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/4">Area Cultivated</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/4">Season</th>
                    <th className="border-b border-slate-300 pb-2 text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider w-1/4">Expected Yield</th>
                    <th className="border-b border-slate-300 pb-2 print:hidden w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {cropDetails.map((row, index) => (
                    <tr key={row.id}>
                      <td className="py-2 pr-2">
                        <select value={row.cropName} onChange={(e) => handleCropChange(row.id, 'cropName', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] bg-white print:border-none print:p-0 print:appearance-none print:bg-transparent">
                          <option value="">Select Crop</option>
                          <option value="Arecanut">Arecanut</option>
                          <option value="Paddy">Paddy</option>
                          <option value="Coconut">Coconut</option>
                          <option value="Banana">Banana</option>
                          <option value="Rubber">Rubber</option>
                          <option value="Pepper">Pepper</option>
                          <option value="Cashew">Cashew</option>
                          <option value="Sugarcane">Sugarcane</option>
                          <option value="Vegetables">Vegetables</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.area} onChange={(e) => handleCropChange(row.id, 'area', e.target.value)} placeholder="in Acres" className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] capitalize bg-white print:border-none print:p-0 print:bg-transparent" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.season} onChange={(e) => handleCropChange(row.id, 'season', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] capitalize bg-white print:border-none print:p-0 print:bg-transparent" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={row.yield} onChange={(e) => handleCropChange(row.id, 'yield', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#0F4C81] outline-none text-sm font-medium text-[#0F4C81] capitalize bg-white print:border-none print:p-0 print:bg-transparent" />
                      </td>
                      <td className="py-2 text-right print:hidden">
                        {index > 0 && (
                          <button onClick={() => removeCropRow(row.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addCropRow} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#0F4C81] hover:underline print:hidden">
                <Plus className="w-3 h-3" /> Add Crop Entry
              </button>
            </div>
          </div>

          {/* AGRICULTURAL ASSETS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Agricultural Assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RadioGroup label="Tractor Available?" name="tractorAvailable" value={formData.tractorAvailable} onChange={handleChange} options={['Yes', 'No']} />
                <InputField label="Farm Equipment Details" name="farmEquipment" value={formData.farmEquipment} onChange={handleChange} />
              </div>
              <div>
                <RadioGroup label="Irrigation Facility Available?" name="irrigationFacility" value={formData.irrigationFacility} onChange={handleChange} options={['Yes', 'No']} />
                <InputField label="Livestock Details (Cattle, Poultry, etc.)" name="livestock" value={formData.livestock} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* LOAN DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-slate-50 print:bg-transparent">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Type of Agricultural Loan" name="loanType" value={formData.loanType} onChange={handleChange} options={['Crop Loan', 'Plantation Loan', 'Irrigation Loan', 'Farm Mechanization Loan', 'Dairy Loan', 'Horticulture Loan', 'Agricultural Term Loan']} />
              <InputField label="Loan Amount Required (₹)" name="loanAmount" type="number" value={formData.loanAmount} onChange={handleChange} />
              <InputField label="Purpose of Loan" name="loanPurpose" value={formData.loanPurpose} onChange={handleChange} />
              <SelectField label="Loan Tenure" name="loanTenure" value={formData.loanTenure} onChange={handleChange} options={['6 Months', '12 Months', '24 Months', '36 Months', '60 Months']} />
            </div>
          </div>

          {/* BANK MEMBERSHIP DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Bank Membership Details</h3>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 mb-4 font-medium print:border-slate-400 print:text-slate-800">
              Agricultural loan applicants must be active members of the cooperative society.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RadioGroup label="Existing Member?" name="existingMember" value={formData.existingMember} onChange={handleChange} options={['Yes', 'No']} />
                {formData.existingMember === 'Yes' && (
                  <div className="space-y-3 mt-3">
                    <InputField label="Membership Number" name="memberNoExisting" value={formData.memberNoExisting} onChange={handleChange} />
                    <InputField label="Share Capital Certificate Number" name="shareCapitalCert" value={formData.shareCapitalCert} onChange={handleChange} />
                  </div>
                )}
              </div>
              <div>
                {formData.existingMember === 'No' && (
                  <>
                    <RadioGroup label="Apply for Membership?" name="applyMember" value={formData.applyMember} onChange={handleChange} options={['Yes', 'No']} />
                    <div className="mt-3">
                      <InputField label="Number of Shares to Purchase" name="sharesToPurchase" type="number" value={formData.sharesToPurchase} onChange={handleChange} />
                    </div>
                  </>
                )}
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField label="Nominee Name" name="nomName" value={formData.nomName} onChange={handleChange} />
              <InputField label="Relationship" name="nomRel" value={formData.nomRel} onChange={handleChange} />
              <InputField label="Mobile Number" name="nomMobile" value={formData.nomMobile} onChange={handleChange} />
              <InputField label="Address" name="nomAddress" value={formData.nomAddress} onChange={handleChange} />
            </div>
          </div>

          {/* DOCUMENT UPLOAD SECTION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Document Upload Section</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 print:hidden">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">RTC / Pahani</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setRtcFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81] w-full" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Mutation Extract</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setMutationFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81] w-full" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">No Due Certificate</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setNoDueFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81] w-full" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Share Capital Certificate</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setShareCertFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81] w-full" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Bank Passbook Copy</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setPassbookFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81] w-full" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Land Tax Receipt</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setTaxReceiptFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81] w-full" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic hidden print:block">All documents must be attached separately along with this application form.</p>
          </div>

          {/* DECLARATION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-blue-50/50 print:bg-transparent text-justify">
            <h3 className="text-xs font-black text-[#0F4C81] mb-2 uppercase tracking-wider">Declaration</h3>
            <p className="text-xs text-slate-700 leading-relaxed print:text-slate-900 font-medium italic">
              "I hereby declare that the information furnished above is true and correct. I agree to abide by the rules and regulations of ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD and authorize the society to verify all land and loan-related records."
            </p>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="mb-12">
            <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-4 uppercase tracking-wider">Applicant Signature</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <InputField label="Place" name="appPlace" value={formData.appPlace} onChange={handleChange} />
                <InputField label="Date" name="appDate" type="date" value={formData.appDate} onChange={handleChange} />
              </div>
              <div className="space-y-4">
                <div className="mt-1">
                  <label className="block text-[10px] font-bold text-[#0F4C81] mb-2 uppercase tracking-wider print:hidden">Upload Signature</label>
                  <input type="file" accept="image/*" onChange={e => setSignatureFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EAF6FF] file:text-[#0F4C81] hover:file:bg-[#d6efff] transition-all cursor-pointer print:hidden"/>
                </div>
                <div className="flex justify-start items-end h-16">
                  <div className="w-48 border-t border-slate-800 pt-2 text-[10px] font-bold uppercase">Applicant Signature</div>
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
              {isSubmitting ? 'Submitting Application...' : 'Submit Agricultural Loan Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
