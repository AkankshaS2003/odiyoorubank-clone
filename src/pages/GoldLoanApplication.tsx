import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, FileCheck, Plus, Trash2 } from 'lucide-react';

interface GoldLoanApplicationProps {
  setCurrentTab: (tab: string) => void;
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

export const GoldLoanApplication: React.FC<GoldLoanApplicationProps> = ({ setCurrentTab }) => {
  const { user, systemSettings, submitServiceApplication } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const generateAppNo = () => `GL-${Math.floor(100000 + Math.random() * 900000)}`;

  const [formData, setFormData] = useState({
    // Header
    applicationNo: generateAppNo(),
    date: new Date().toISOString().split('T')[0],

    // Applicant Details
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
    permStreet: '',
    permCity: '',
    permDistrict: '',
    permState: '',
    permPin: '',

    sameAsPerm: false,
    commHouse: '',
    commStreet: '',
    commCity: '',
    commDistrict: '',
    commState: '',
    commPin: '',

    // ID
    aadhaar: '',
    pan: '',
    voterId: '',
    dl: '',

    // Occupation
    occupation: '',
    employer: '',
    monthlyIncome: '',
    annualIncome: '',
    yearsEmployed: '',

    // Gold Items Array
    goldItems: [{ type: '', qty: '', grossWt: '', netWt: '', purity: '' }],

    // Loan Details
    requestedAmount: '',
    purpose: '',
    tenure: '',

    // Nominee
    nomName: '',
    nomRel: '',
    nomMobile: '',
    nomAddress: '',
    nomDob: '',
    guardianName: '',
    guardianRel: '',

    // Guarantor
    guarName: '',
    guarMemberNo: '',
    guarMobile: '',
    guarAddress: '',

    // App Signature
    appPlace: '',
    appDate: new Date().toISOString().split('T')[0],
  });

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
            newData.permStreet = user.address;
          }
        }
        
        return newData;
      });
    }
  };

  const handleGoldItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.goldItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, goldItems: newItems });
  };

  const addGoldItem = () => {
    setFormData({ ...formData, goldItems: [...formData.goldItems, { type: '', qty: '', grossWt: '', netWt: '', purity: '' }] });
  };

  const removeGoldItem = (index: number) => {
    const newItems = formData.goldItems.filter((_, i) => i !== index);
    setFormData({ ...formData, goldItems: newItems });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      alert("Please upload the required photo.");
      return;
    }
    if (!formData.requestedAmount || !formData.tenure || !formData.purpose) {
      alert("Please fill in the Requested Loan Amount, Purpose, and Tenure.");
      return;
    }
    
    setIsSubmitting(true);
    
    const images: any = {};
    try {
      if (aadhaarFile) images.aadhaar = await fileToBase64(aadhaarFile);
      if (panFile) images.pan = await fileToBase64(panFile);
      if (photoFile) images.photo = await fileToBase64(photoFile);
      if (signatureFile) images.signature = await fileToBase64(signatureFile);
    } catch (err) {
      console.error('Failed to convert images to base64', err);
    }

    const res = await submitServiceApplication('Gold Loan', formData, images);
    
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
            Your Gold Loan Application (No: {formData.applicationNo}) for ₹{Number(formData.requestedAmount).toLocaleString('en-IN')} has been successfully received.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">Application Progress</h3>
            <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span>Application Received</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Gold Appraisal</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Loan Disbursement</span>
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
        <div className="flex justify-end items-center mb-6 print:hidden">
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-[#0F4C81]/20">
            <Printer className="w-4 h-4" /> Print Form
          </button>
        </div>

        {/* Paper Document Container */}
        <div className="bg-white p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-300 print:shadow-none print:border-none print:p-2">
          
          {/* HEADER SECTION */}
          <div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-8">
            <div className="w-48 shrink-0 hidden md:block"></div>
            <div className="flex-grow px-4 text-[#ED7F1E]">
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
              <div className="text-right text-[10px] font-bold space-y-2 w-48 shrink-0">
              <div className="flex justify-end items-center gap-2"><span>Branch:</span> <input type="text" value="Main Branch" readOnly className="w-24 border-b border-slate-400 outline-none print:border-slate-800 bg-transparent text-right text-slate-600"/></div>
              <div className="flex justify-end items-center gap-2"><span>App No:</span> <input type="text" value={formData.applicationNo} readOnly className="w-24 border-b border-slate-400 outline-none print:border-slate-800 bg-transparent text-right text-slate-600"/></div>
              <div className="flex justify-end items-center gap-2"><span>Date:</span> <input type="text" value={formData.date} readOnly className="w-24 border-b border-slate-400 outline-none print:border-slate-800 bg-transparent text-right text-slate-600"/></div>
            </div>
          </div>

          {/* APPLICANT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Personal Information</h3>
            
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

            <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} />
              <InputField label="Alternate Mobile" name="altMobile" value={formData.altMobile} onChange={handleChange} />
              <InputField label="Email ID" name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Permanent Address</h3>
                <InputField label="House Number / Name" name="permHouse" value={formData.permHouse} onChange={handleChange} />
                <InputField label="Street" name="permStreet" value={formData.permStreet} onChange={handleChange} />
                <InputField label="Village / City" name="permCity" value={formData.permCity} onChange={handleChange} />
                <InputField label="District" name="permDistrict" value={formData.permDistrict} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="State" name="permState" value={formData.permState} onChange={handleChange} />
                  <InputField label="PIN Code" name="permPin" value={formData.permPin} onChange={handleChange} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end border-b border-slate-200 pb-1 mb-3">
                  <h3 className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider">Communication Address</h3>
                  <CheckboxField label="Same as Permanent" name="sameAsPerm" checked={formData.sameAsPerm} onChange={handleChange} />
                </div>
                <InputField label="House Number / Name" name="commHouse" value={formData.commHouse} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Street" name="commStreet" value={formData.commStreet} onChange={handleChange} readOnly={formData.sameAsPerm} />
                <InputField label="Village / City" name="commCity" value={formData.commCity} onChange={handleChange} readOnly={formData.sameAsPerm} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <InputField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
              <InputField label="PAN Number" name="pan" value={formData.pan} onChange={handleChange} />
              <InputField label="Voter ID Number" name="voterId" value={formData.voterId} onChange={handleChange} />
              <InputField label="Driving License Number" name="dl" value={formData.dl} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-300 print:hidden">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Aadhaar Upload</label>
                <input type="file" accept="image/*,.pdf" onChange={e => setAadhaarFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">PAN Upload</label>
                <input type="file" accept="image/*,.pdf" onChange={e => setPanFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Photo Upload</label>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
            </div>
          </div>

          {/* OCCUPATION DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Occupation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2"><InputField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} /></div>
              <div className="lg:col-span-3"><InputField label="Employer / Business Name" name="employer" value={formData.employer} onChange={handleChange} /></div>
              <div className="lg:col-span-2"><InputField label="Monthly Income (₹)" name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleChange} /></div>
              <div className="lg:col-span-2"><InputField label="Annual Income (₹)" name="annualIncome" type="number" value={formData.annualIncome} onChange={handleChange} /></div>
              <InputField label="Years of Employment" name="yearsEmployed" type="number" value={formData.yearsEmployed} onChange={handleChange} />
            </div>
          </div>

          {/* GOLD DETAILS TABLE */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Gold Pledged Information</h3>
              <button type="button" onClick={addGoldItem} className="flex items-center gap-1 text-[10px] font-bold bg-[#EAF6FF] text-[#0F4C81] px-2 py-1 rounded hover:bg-blue-100 transition-colors print:hidden">
                <Plus className="w-3 h-3" /> Add Ornament
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[#0F4C81] text-[10px] uppercase tracking-wider print:bg-transparent print:border-slate-800">
                    <th className="p-2 font-bold w-12 text-center border-r border-slate-200">Sl No</th>
                    <th className="p-2 font-bold border-r border-slate-200">Ornament Type</th>
                    <th className="p-2 font-bold w-24 text-center border-r border-slate-200">Quantity</th>
                    <th className="p-2 font-bold w-32 text-right border-r border-slate-200">Gross Wt (g)</th>
                    <th className="p-2 font-bold w-32 text-right border-r border-slate-200">Net Wt (g)</th>
                    <th className="p-2 font-bold w-24 text-center">Purity (K)</th>
                    <th className="p-2 w-10 print:hidden"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.goldItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-300 print:border-slate-400">
                      <td className="p-2 text-center text-xs font-medium border-r border-slate-300">{index + 1}</td>
                      <td className="p-1 border-r border-slate-300"><input type="text" value={item.type} onChange={e => handleGoldItemChange(index, 'type', e.target.value)} placeholder="e.g. Chain, Bangle" className="w-full p-1 text-sm outline-none bg-transparent" /></td>
                      <td className="p-1 border-r border-slate-300"><input type="number" value={item.qty} onChange={e => handleGoldItemChange(index, 'qty', e.target.value)} className="w-full p-1 text-sm text-center outline-none bg-transparent" /></td>
                      <td className="p-1 border-r border-slate-300"><input type="number" step="0.01" value={item.grossWt} onChange={e => handleGoldItemChange(index, 'grossWt', e.target.value)} className="w-full p-1 text-sm text-right outline-none bg-transparent" /></td>
                      <td className="p-1 border-r border-slate-300"><input type="number" step="0.01" value={item.netWt} onChange={e => handleGoldItemChange(index, 'netWt', e.target.value)} className="w-full p-1 text-sm text-right outline-none bg-transparent" /></td>
                      <td className="p-1"><input type="number" value={item.purity} onChange={e => handleGoldItemChange(index, 'purity', e.target.value)} placeholder="22" className="w-full p-1 text-sm text-center outline-none bg-transparent" /></td>
                      <td className="p-1 text-center print:hidden">
                        {formData.goldItems.length > 1 && (
                          <button type="button" onClick={() => removeGoldItem(index)} className="text-rose-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Empty rows for print layout if list is small */}
                  {Array.from({ length: Math.max(0, 3 - formData.goldItems.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="hidden print:table-row border-b border-slate-400 h-8">
                      <td className="border-r border-slate-400"></td><td className="border-r border-slate-400"></td><td className="border-r border-slate-400"></td>
                      <td className="border-r border-slate-400"></td><td className="border-r border-slate-400"></td><td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LOAN DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-slate-50 print:bg-transparent">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Loan Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Requested Loan Amount (₹)" name="requestedAmount" type="number" value={formData.requestedAmount} onChange={handleChange} />
              
              <SelectField 
                label="Loan Purpose" 
                name="purpose" 
                value={formData.purpose} 
                onChange={handleChange} 
                options={['Agriculture', 'Education', 'Business', 'Medical', 'Marriage', 'House Repair', 'Personal Requirement', 'Other']} 
              />
              
              <SelectField 
                label="Loan Tenure" 
                name="tenure" 
                value={formData.tenure} 
                onChange={handleChange} 
                options={['3 Months', '6 Months', '12 Months', '24 Months']} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pt-4 border-t border-slate-200 print:border-slate-400">
              <div className="bg-white p-3 rounded-lg border border-slate-200 print:border-none print:p-0">
                <span className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Interest Rate</span>
                <span className="text-sm font-bold text-slate-800">{systemSettings?.goldLoanRate || 8.50}% p.a.</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 print:border-none print:p-0">
                <span className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Processing Charges</span>
                <span className="text-sm font-bold text-slate-800">1.0% of Loan Amount</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 print:border-none print:p-0">
                <span className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase">Valuation Charges</span>
                <span className="text-sm font-bold text-slate-800">Actuals based on weight</span>
              </div>
            </div>
          </div>

          {/* NOMINEE DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Nominee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <InputField label="Nominee Name" name="nomName" value={formData.nomName} onChange={handleChange} />
              <InputField label="Relationship" name="nomRel" value={formData.nomRel} onChange={handleChange} />
              <InputField label="Date of Birth" name="nomDob" type="date" value={formData.nomDob} onChange={handleChange} />
              <div className="lg:col-span-2"><InputField label="Address" name="nomAddress" value={formData.nomAddress} onChange={handleChange} /></div>
              <InputField label="Mobile Number" name="nomMobile" value={formData.nomMobile} onChange={handleChange} />
            </div>
            
            <h3 className="text-[10px] font-bold text-rose-500 border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider">If Nominee is Minor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleChange} />
              <InputField label="Guardian Relationship" name="guardianRel" value={formData.guardianRel} onChange={handleChange} />
            </div>
          </div>

          {/* DECLARATION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-blue-50/50 print:bg-transparent text-justify">
            <h3 className="text-xs font-black text-[#0F4C81] mb-2 uppercase tracking-wider">Declaration</h3>
            <p className="text-xs text-slate-700 leading-relaxed print:text-slate-900 font-medium italic">
              "I hereby declare that the information provided by me is true and correct. I agree to abide by the rules and regulations of ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD and authorize the society to verify the submitted details. I understand that the gold ornaments pledged are subject to appraisal and valuation by the society's approved appraiser."
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

          {/* GUARANTOR DETAILS (OPTIONAL) */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-slate-600 px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-slate-800 print:border print:border-slate-800 print:px-2 uppercase tracking-wider">Guarantor Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <InputField label="Guarantor Name" name="guarName" value={formData.guarName} onChange={handleChange} />
              <InputField label="Membership Number" name="guarMemberNo" value={formData.guarMemberNo} onChange={handleChange} />
              <InputField label="Mobile Number" name="guarMobile" value={formData.guarMobile} onChange={handleChange} />
              <div className="lg:col-span-1"><InputField label="Address" name="guarAddress" value={formData.guarAddress} onChange={handleChange} /></div>
            </div>
            <div className="flex justify-end">
              <div className="w-48 border-t border-slate-800 pt-2 text-center text-[10px] font-bold uppercase">Guarantor Signature</div>
            </div>
          </div>



          {/* SUBMIT BUTTON */}
          <div className="flex justify-end mt-12 pt-8 border-t border-slate-200 print:hidden">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Gold Loan Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
