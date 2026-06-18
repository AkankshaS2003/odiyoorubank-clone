import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, FileCheck } from 'lucide-react';

interface EducationalLoanApplicationProps {
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

export const EducationalLoanApplication: React.FC<EducationalLoanApplicationProps> = ({ setCurrentTab }) => {
  const { user, submitServiceApplication } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Files
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [admissionLetterFile, setAdmissionLetterFile] = useState<File | null>(null);
  const [seatAllotmentFile, setSeatAllotmentFile] = useState<File | null>(null);
  const [feeStructureFile, setFeeStructureFile] = useState<File | null>(null);
  const [marksCardsFile, setMarksCardsFile] = useState<File | null>(null);
  const [identityProofFile, setIdentityProofFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [coSignatureFile, setCoSignatureFile] = useState<File | null>(null);

  const generateAppNo = () => `EL-${Math.floor(100000 + Math.random() * 900000)}`;

  const [formData, setFormData] = useState({
    // Header
    applicationNo: generateAppNo(),
    date: new Date().toISOString().split('T')[0],

    // Student Details
    memberNo: '',
    fullName: '',
    dob: '',
    age: '',
    gender: '',
    aadhaar: '',
    pan: '',
    mobile: '',
    email: '',

    // Student Address
    permHouse: '',
    permCity: '',
    permDistrict: '',
    permState: '',
    permPin: '',

    // Educational Details
    courseName: '',
    stream: '',
    institutionName: '',
    universityName: '',
    courseType: '',
    courseDuration: '',
    academicYear: '',
    expectedCompletion: '',

    // Admission Proof
    admissionConfirmed: false,

    // Co-Applicant Details
    coName: '',
    coRel: '',
    coMobile: '',
    coAadhaar: '',
    coPan: '',
    coOccupation: '',
    coEmployer: '',
    coMonthlyIncome: '',
    coAnnualIncome: '',
    coAddress: '',

    // Course Expenses
    tuitionFee: 0,
    hostelFee: 0,
    examFee: 0,
    booksFee: 0,
    otherFee: 0,

    // Loan Requirements
    scholarship: 0,
    familyContribution: 0,

    // Share Membership
    existingMember: 'No',
    memberNoExisting: '',
    applyMember: 'Yes',
    sharesToPurchase: '',
    shareAmount: '',

    // Bank Account
    accName: '',
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
    coAppPlace: '',
    coAppDate: new Date().toISOString().split('T')[0],
  });

  // Calculate totals
  const totalCourseCost = Number(formData.tuitionFee) + Number(formData.hostelFee) + Number(formData.examFee) + Number(formData.booksFee) + Number(formData.otherFee);
  const loanAmountRequired = Math.max(0, totalCourseCost - Number(formData.scholarship) - Number(formData.familyContribution));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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
    if (!photoFile) {
      alert("Please upload the required photo.");
      return;
    }
    if (!formData.courseName || !formData.institutionName || !formData.coName) {
      alert("Please fill in Course Name, Institution Name, and Co-Applicant Details.");
      return;
    }

    if (!formData.admissionConfirmed) {
      alert("Please confirm admission by checking the 'Admission Confirmed' box.");
      return;
    }
    
    setIsSubmitting(true);
    
    const images: any = {};
    try {
      if (photoFile) images.studentPhoto = await fileToBase64(photoFile);
      if (admissionLetterFile) images.admissionLetter = await fileToBase64(admissionLetterFile);
      if (seatAllotmentFile) images.seatAllotment = await fileToBase64(seatAllotmentFile);
      if (feeStructureFile) images.feeStructure = await fileToBase64(feeStructureFile);
      if (marksCardsFile) images.marksCards = await fileToBase64(marksCardsFile);
      if (identityProofFile) images.identityProof = await fileToBase64(identityProofFile);
      if (signatureFile) images.studentSignature = await fileToBase64(signatureFile);
      if (coSignatureFile) images.coApplicantSignature = await fileToBase64(coSignatureFile);
    } catch (err) {
      console.error('Failed to convert images to base64', err);
    }

    const payload = {
      ...formData,
      totalCourseCost,
      loanAmountRequired
    };

    const res = await submitServiceApplication('Educational Loan', payload, images);
    
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
            Your Educational Loan Application (No: {formData.applicationNo}) for ₹{loanAmountRequired.toLocaleString('en-IN')} has been successfully received.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">Application Progress</h3>
            <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span>Application Received</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span>Institution Verification</span>
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
          <div className="bg-[#ED7F1E] rounded-t-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 -mt-8 md:-mt-12 -mx-8 md:-mx-12 print:m-0 print:p-4 print:rounded-none gap-4 md:gap-0">
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
            
            <div className="text-right text-white text-[10px] md:text-xs font-bold space-y-2 w-full md:w-48 shrink-0 flex flex-col items-end">
              <div className="flex justify-end items-center gap-2">
                <span className="opacity-90">Branch:</span> 
                <input type="text" value="Main Branch" readOnly className="w-24 border-b border-white/40 outline-none bg-transparent text-right text-white placeholder-white/60 focus:border-white transition-colors" />
              </div>
              <div className="flex justify-end items-center gap-2">
                <span className="opacity-90">Customer ID:</span> 
                <input type="text" value={user?.customerId || ''} readOnly className="w-24 border-b border-white/40 outline-none bg-transparent text-right text-white placeholder-white/60 focus:border-white transition-colors" />
              </div>
              <div className="flex justify-end items-center gap-2">
                <span className="opacity-90">Account No:</span> 
                <input type="text" value={user?.accountNumber || 'Not Assigned'} readOnly className="w-24 border-b border-white/40 outline-none bg-transparent text-right text-white placeholder-white/60 focus:border-white transition-colors" />
              </div>
            </div>
          </div>

          {/* STUDENT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Student Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-2"><InputField label="Customer ID" name="customerId" value={user?.customerId || ''} readOnly /></div>
              <div className="lg:col-span-2"><InputField label="Membership Number" name="memberNo" value={formData.memberNo} onChange={handleChange} placeholder="Enter to Auto-fill" /></div>
              <div className="lg:col-span-4"><InputField label="Student Full Name" name="fullName" value={formData.fullName} onChange={handleChange} /></div>
              <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
              <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
              <InputField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
              <InputField label="PAN Number (Optional)" name="pan" value={formData.pan} onChange={handleChange} />
              <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} />
              <div className="lg:col-span-2"><InputField label="Email ID" name="email" value={formData.email} onChange={handleChange} type="email" /></div>
            </div>
            
            <div className="mb-6 print:hidden">
              <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Passport Size Photo Upload</label>
              <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#EAF6FF] file:text-[#0F4C81]" />
            </div>

            <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Student Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><InputField label="Permanent Address" name="permHouse" value={formData.permHouse} onChange={handleChange} /></div>
              <InputField label="City" name="permCity" value={formData.permCity} onChange={handleChange} />
              <InputField label="District" name="permDistrict" value={formData.permDistrict} onChange={handleChange} />
              <InputField label="State" name="permState" value={formData.permState} onChange={handleChange} />
              <InputField label="PIN Code" name="permPin" value={formData.permPin} onChange={handleChange} />
            </div>
          </div>

          {/* EDUCATIONAL DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Educational Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Course Name" name="courseName" value={formData.courseName} onChange={handleChange} />
              <InputField label="Stream" name="stream" value={formData.stream} onChange={handleChange} />
              <InputField label="Institution / College Name" name="institutionName" value={formData.institutionName} onChange={handleChange} />
              <InputField label="University Name" name="universityName" value={formData.universityName} onChange={handleChange} />
              <SelectField label="Course Type" name="courseType" value={formData.courseType} onChange={handleChange} options={['Diploma', 'Undergraduate', 'Postgraduate', 'Professional Course', 'Doctorate']} />
              <InputField label="Course Duration" name="courseDuration" value={formData.courseDuration} onChange={handleChange} />
              <InputField label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange} />
              <InputField label="Expected Completion Year" name="expectedCompletion" type="number" value={formData.expectedCompletion} onChange={handleChange} />
            </div>
          </div>

          {/* ADMISSION PROOF SECTION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Admission Proof (Mandatory)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6 print:hidden">
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Admission Letter</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setAdmissionLetterFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Seat Allotment Letter</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setSeatAllotmentFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Fee Structure Document</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setFeeStructureFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Previous Marks Cards</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setMarksCardsFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#0F4C81] mb-1 uppercase block">Identity Proof</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setIdentityProofFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#EAF6FF] file:text-[#0F4C81]" />
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 print:border-none print:bg-transparent">
              <CheckboxField label="Admission Confirmed" name="admissionConfirmed" checked={formData.admissionConfirmed} onChange={handleChange} />
            </div>
          </div>

          {/* CO-APPLICANT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-2 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Co-Applicant Details (Mandatory)</h3>
            <p className="text-xs text-slate-500 mb-4 italic print:text-slate-800">Educational loans must be jointly applied for by the student and parent/guardian.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2"><InputField label="Parent / Guardian Name" name="coName" value={formData.coName} onChange={handleChange} /></div>
              <InputField label="Relationship with Student" name="coRel" value={formData.coRel} onChange={handleChange} />
              <InputField label="Mobile Number" name="coMobile" value={formData.coMobile} onChange={handleChange} />
              <InputField label="Aadhaar Number" name="coAadhaar" value={formData.coAadhaar} onChange={handleChange} />
              <InputField label="PAN Number" name="coPan" value={formData.coPan} onChange={handleChange} />
              <InputField label="Occupation" name="coOccupation" value={formData.coOccupation} onChange={handleChange} />
              <InputField label="Employer / Business Name" name="coEmployer" value={formData.coEmployer} onChange={handleChange} />
              <InputField label="Monthly Income (₹)" name="coMonthlyIncome" type="number" value={formData.coMonthlyIncome} onChange={handleChange} />
              <InputField label="Annual Income (₹)" name="coAnnualIncome" type="number" value={formData.coAnnualIncome} onChange={handleChange} />
              <div className="lg:col-span-2"><InputField label="Address Details" name="coAddress" value={formData.coAddress} onChange={handleChange} /></div>
            </div>
          </div>

          {/* COURSE EXPENSE DETAILS & LOAN REQUIREMENT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="border border-slate-200 rounded-xl p-5 print:border-slate-400">
              <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Course Expense Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Tuition Fee" name="tuitionFee" type="number" value={formData.tuitionFee} onChange={handleChange} />
                <InputField label="Hostel Fee" name="hostelFee" type="number" value={formData.hostelFee} onChange={handleChange} />
                <InputField label="Examination Fee" name="examFee" type="number" value={formData.examFee} onChange={handleChange} />
                <InputField label="Books & Equipment" name="booksFee" type="number" value={formData.booksFee} onChange={handleChange} />
                <InputField label="Other Expenses" name="otherFee" type="number" value={formData.otherFee} onChange={handleChange} />
                <div className="bg-slate-100 p-2 rounded-lg border border-slate-200">
                  <span className="block text-[10px] font-bold text-[#0F4C81] uppercase">Total Cost</span>
                  <span className="text-lg font-black text-slate-800">₹{totalCourseCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-xl p-5 print:border-slate-400">
              <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Loan Requirement Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <InputField label="Total Course Cost" name="totalCostDummy" type="number" value={totalCourseCost} readOnly />
                <InputField label="Scholarship Amount (-)" name="scholarship" type="number" value={formData.scholarship} onChange={handleChange} />
                <InputField label="Family Contribution (-)" name="familyContribution" type="number" value={formData.familyContribution} onChange={handleChange} />
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <span className="block text-xs font-bold text-emerald-800 uppercase">Loan Amount Required</span>
                  <span className="text-2xl font-black text-emerald-600">₹{loanAmountRequired.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SHARE MEMBERSHIP REQUIREMENT */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Share Membership Requirement</h3>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 mb-4 font-medium print:border-slate-400 print:text-slate-800">
              Membership in ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD is mandatory for availing an educational loan. Applicants may be required to purchase the prescribed number of society shares.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RadioGroup label="Existing Member?" name="existingMember" value={formData.existingMember} onChange={handleChange} options={['Yes', 'No']} />
                {formData.existingMember === 'Yes' && (
                  <InputField label="Membership Number" name="memberNoExisting" value={formData.memberNoExisting} onChange={handleChange} />
                )}
              </div>
              <div>
                {formData.existingMember === 'No' && (
                  <>
                    <RadioGroup label="Apply for Membership?" name="applyMember" value={formData.applyMember} onChange={handleChange} options={['Yes', 'No']} />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <InputField label="Number of Shares to Purchase" name="sharesToPurchase" type="number" value={formData.sharesToPurchase} onChange={handleChange} />
                      <InputField label="Share Amount (₹)" name="shareAmount" type="number" value={formData.shareAmount} onChange={handleChange} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* BANK ACCOUNT DETAILS */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 print:bg-transparent print:text-[#0F4C81] print:border print:border-[#0F4C81] print:px-2 uppercase tracking-wider">Bank Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField label="Account Holder Name" name="accName" value={formData.accName} onChange={handleChange} />
              <InputField label="Account Number" name="accNumber" value={formData.accNumber} onChange={handleChange} />
              <InputField label="Branch Name" name="accBranch" value={formData.accBranch} onChange={handleChange} />
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

          {/* DECLARATION */}
          <div className="mb-8 border border-slate-200 rounded-xl p-5 print:border-slate-400 bg-blue-50/50 print:bg-transparent text-justify">
            <h3 className="text-xs font-black text-[#0F4C81] mb-2 uppercase tracking-wider">Declaration</h3>
            <p className="text-xs text-slate-700 leading-relaxed print:text-slate-900 font-medium italic">
              "I hereby certify that all information furnished in this application is true and correct. I agree to comply with the rules and regulations of ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD and understand that educational loans are subject to membership requirements, eligibility verification, and document validation."
            </p>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-4 uppercase tracking-wider">Student Signature</h3>
              <div className="space-y-4">
                <InputField label="Place" name="appPlace" value={formData.appPlace} onChange={handleChange} />
                <InputField label="Date" name="appDate" type="date" value={formData.appDate} onChange={handleChange} />
                <div className="mt-4">
                  <label className="block text-[10px] font-bold text-[#0F4C81] mb-2 uppercase tracking-wider print:hidden">Upload Signature</label>
                  <input type="file" accept="image/*" onChange={e => setSignatureFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EAF6FF] file:text-[#0F4C81] hover:file:bg-[#d6efff] transition-all cursor-pointer print:hidden"/>
                </div>
                <div className="flex justify-start items-end h-16">
                  <div className="w-48 border-t border-slate-800 pt-2 text-[10px] font-bold uppercase">Signature</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#0F4C81] border-b border-slate-200 pb-1 mb-4 uppercase tracking-wider">Parent / Guardian Signature</h3>
              <div className="space-y-4">
                <InputField label="Place" name="coAppPlace" value={formData.coAppPlace} onChange={handleChange} />
                <InputField label="Date" name="coAppDate" type="date" value={formData.coAppDate} onChange={handleChange} />
                <div className="mt-4">
                  <label className="block text-[10px] font-bold text-[#0F4C81] mb-2 uppercase tracking-wider print:hidden">Upload Signature</label>
                  <input type="file" accept="image/*" onChange={e => setCoSignatureFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EAF6FF] file:text-[#0F4C81] hover:file:bg-[#d6efff] transition-all cursor-pointer print:hidden"/>
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
              disabled={isSubmitting}
              className={`px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Educational Loan Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
