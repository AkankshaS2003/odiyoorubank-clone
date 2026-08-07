import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Briefcase, 
  Calendar, 
  Percent, 
  CreditCard, 
  User, 
  Landmark, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  Building2, 
  FileCheck,
  Maximize2,
  Minimize2,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';

interface LoanApplicationModalProps {
  application: any;
  onClose: () => void;
  onNavigateDetails?: (tab: string) => void;
  isFullPageView?: boolean;
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({ 
  application, 
  onClose,
  onNavigateDetails,
  isFullPageView = false
}) => {
  const { user: authUser } = useAuth();
  const [fetchedProfile, setFetchedProfile] = useState<any>(null);
  const [isFullPage, setIsFullPage] = useState(isFullPageView);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setFetchedProfile(res.data.data);
        }
      } catch (e) {}
    };
    fetchUserProfile();
  }, []);

  const formData = application?.formData || {};
  const user = application?.userId || fetchedProfile || authUser || {};

  // Comprehensive User Details Merging to eliminate N/A values
  const displayFullName = formData.fullName || formData.app1Name || user.fullName || authUser?.fullName || 'N/A';
  const displayCustomerId = user.customerId || authUser?.customerId || formData.customerId || formData.headerCustomerId || 'N/A';
  const displayMemberId = user.memberId || fetchedProfile?.memberId || authUser?.memberId || formData.memberNo || formData.memberNoExisting || 'N/A';
  const displayMobile = formData.mobile || formData.app1Mobile || user.phone || fetchedProfile?.phone || authUser?.phone || 'N/A';
  const displayEmail = formData.email || formData.app1Email || user.email || fetchedProfile?.email || authUser?.email || 'N/A';
  const displayPan = formData.pan || formData.app1Pan || user.pan || user.panNumber || fetchedProfile?.pan || fetchedProfile?.panNumber || authUser?.pan || authUser?.panNumber || 'N/A';
  const displayAadhaar = formData.aadhaar || formData.app1Aadhaar || user.aadhaar || user.aadharNumber || fetchedProfile?.aadhaar || fetchedProfile?.aadharNumber || authUser?.aadhaar || authUser?.aadharNumber || 'N/A';
  const displayAddress = formData.permHouse || formData.app1Address || user.address || fetchedProfile?.address || authUser?.address || 'Address Not Provided';

  const loanAmount = Number(formData.loanAmount || formData.requestedAmount || formData.loanAmountRequired || formData.amount || application.applicationData?.amount || 0);
  const loanTenure = formData.loanTenure || formData.tenure || formData.tenureMonths || application.applicationData?.tenureMonths || '12';
  const loanPurpose = formData.loanPurpose || formData.purpose || 'General Financial Assistance';
  const loanType = application.applicationType || 'Loan';

  // Interest Rates Mapping
  const interestRateMap: Record<string, number> = {
    'Gold Loan': 8.5,
    'Vehicle Loan': 10.0,
    'Personal Loan': 11.5,
    'Educational Loan': 7.9,
    'Housing Loan': 8.25,
    'Agricultural Loan': 8.5,
    'Mortgage Loan': 9.5
  };
  const displayRate = interestRateMap[loanType] || 8.5;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    const element = printRef.current;
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#FFFFFF', 
        useCORS: true, 
        windowWidth: element.scrollWidth, 
        windowHeight: element.scrollHeight 
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Loan_Application_${application.applicationNo || application._id?.substring(0, 8)}.pdf`);
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      alert(`Failed to generate PDF: ${err?.message || String(err)}`);
    }
  };

  const handleToggleFullPage = () => {
    if (onNavigateDetails) {
      onClose();
      onNavigateDetails(`view-loan-details|${application._id}`);
    } else {
      setIsFullPage(prev => !prev);
    }
  };

  // Helper for Land Details
  const landDetails = Array.isArray(formData.landDetails) 
    ? formData.landDetails 
    : typeof formData.landDetails === 'string' && formData.landDetails.startsWith('[')
    ? (() => { try { return JSON.parse(formData.landDetails); } catch (e) { return []; } })()
    : [];

  // Helper for Crop Details
  const cropDetails = Array.isArray(formData.cropDetails) 
    ? formData.cropDetails 
    : typeof formData.cropDetails === 'string' && formData.cropDetails.startsWith('[')
    ? (() => { try { return JSON.parse(formData.cropDetails); } catch (e) { return []; } })()
    : [];

  return (
    <div className={isFullPage || isFullPageView ? "min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white" : "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white"}>
      <div className={`bg-white rounded-3xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col print:max-h-full print:shadow-none print:border-none print:rounded-none ${isFullPage || isFullPageView ? 'max-w-6xl mx-auto min-h-screen' : 'max-w-4xl max-h-[92vh]'}`}>
        
        {/* Header Bar with Gradient Accent Line */}
        <div className="bg-[#0A2540] text-white p-6 flex justify-between items-center relative print:hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-[#0F4C81]"></div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F4C81] rounded-2xl shadow-inner">
              <Briefcase className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                {loanType} Application Details
              </h2>
              <p className="text-xs text-slate-300 font-bold mt-0.5 tracking-wider">
                APP ID: <span className="text-amber-400 font-mono font-black">{application.applicationNo || application._id?.substring(0, 10).toUpperCase()}</span> | SUBMITTED: {new Date(application.submittedAt || Date.now()).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleToggleFullPage} 
              title={isFullPage ? "Exit Full Page View" : "Full Page View"}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Full Page View</span>
            </button>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">User Loan Application</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" /> Download Application (PDF)
            </button>

            <button
              onClick={handleToggleFullPage}
              className="px-3 py-2 bg-[#0F4C81] text-white hover:bg-blue-900 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              Full Page View
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div ref={printRef} className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 print:hidden ${
            application.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            application.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-900' :
            'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {application.status === 'Approved' ? <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" /> :
               application.status === 'Rejected' ? <XCircle className="w-8 h-8 text-rose-600 shrink-0" /> :
               <Clock className="w-8 h-8 text-amber-600 shrink-0" />}
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Status: {application.status}</h3>
                <p className="text-xs font-medium opacity-90 mt-0.5">
                  {application.status === 'Approved' 
                    ? 'Your loan application has been verified and sanctioned.' 
                    : application.status === 'Rejected'
                    ? 'This loan application was not approved.'
                    : 'Your loan application is currently under review by our credit assessment team.'}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#0F4C81] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              <FileCheck className="w-3.5 h-3.5 text-amber-300" /> Verified Record
            </span>
          </div>

          {/* Highlights Grid */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0F4C81]" /> Loan Summary Highlights
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#0F4C81]" /> Requested Loan Amount
                </span>
                <div className="font-black text-[#0F4C81] text-xl">₹{loanAmount.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" /> Interest Rate
                </span>
                <div className="font-black text-emerald-600 text-xl">{displayRate}% <span className="text-xs text-emerald-700/70 font-semibold">p.a.</span></div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Tenure
                </span>
                <div className="font-black text-slate-800 text-xl">{loanTenure} <span className="text-xs text-slate-500">Months</span></div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Landmark className="w-3.5 h-3.5 text-purple-600" /> Loan Purpose
                </span>
                <div className="font-bold text-slate-900 text-xs md:text-sm line-clamp-2">{loanPurpose}</div>
              </div>
            </div>
          </div>

          {/* CUSTOMER & BORROWER INFORMATION CARD */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-[#0F4C81] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-3">
              <User className="w-4 h-4 text-[#0F4C81]" /> Customer & Borrower Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Borrower Name</span>
                <span className="text-sm font-extrabold text-slate-900">{displayFullName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Customer ID</span>
                <span className="text-sm font-black font-mono text-[#0F4C81]">{displayCustomerId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Member ID</span>
                <span className="text-sm font-extrabold text-slate-800">{displayMemberId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Mobile Number</span>
                <span className="text-sm font-semibold text-slate-800">{displayMobile}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Email Address</span>
                <span className="text-sm font-semibold text-slate-800">{displayEmail}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">PAN Number</span>
                <span className="text-sm font-mono font-bold text-slate-800">{displayPan}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Aadhaar Number</span>
                <span className="text-sm font-mono font-bold text-slate-800">{displayAadhaar}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Residential Address</span>
                <span className="text-sm font-medium text-slate-800">{displayAddress}</span>
              </div>
            </div>
          </div>

          {/* LOAN PARTICULARS & BANKING TERMS CARD */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-[#0F4C81] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-3">
              <Landmark className="w-4 h-4 text-[#0F4C81]" /> Loan Particulars & Banking Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Loan Category</span>
                <span className="text-sm font-extrabold text-slate-900">{loanType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Loan Amount</span>
                <span className="text-sm font-black text-[#0F4C81]">₹{loanAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Repayment Schedule</span>
                <span className="text-sm font-semibold text-slate-800">Monthly Equated Installments (EMI)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Application Date</span>
                <span className="text-sm font-semibold text-slate-800">{new Date(application.submittedAt || Date.now()).toLocaleDateString('en-GB')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Servicing Branch</span>
                <span className="text-sm font-semibold text-slate-800">Odiyooru Head Branch</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">IFSC Code</span>
                <span className="text-sm font-mono font-bold text-slate-800">ODIY0001234</span>
              </div>
            </div>
          </div>

          {/* LAND DETAILS TABLE IF PRESENT */}
          {landDetails.length > 0 && (
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-[#0F4C81] uppercase tracking-widest mb-4 border-b border-slate-200/80 pb-3">
                Land Holdings Particulars
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <thead className="bg-[#0F4C81] text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Survey No</th>
                      <th className="px-3 py-2.5">Hissa No</th>
                      <th className="px-3 py-2.5">Village</th>
                      <th className="px-3 py-2.5">Land Type</th>
                      <th className="px-3 py-2.5">Acreage</th>
                      <th className="px-3 py-2.5">Irrigation</th>
                      <th className="px-3 py-2.5">Ownership</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {landDetails.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 text-slate-800">
                        <td className="px-3 py-2 font-bold text-[#0F4C81]">{idx + 1}</td>
                        <td className="px-3 py-2 font-bold">{row.surveyNo || '-'}</td>
                        <td className="px-3 py-2">{row.hissaNo || '-'}</td>
                        <td className="px-3 py-2">{row.village || '-'}</td>
                        <td className="px-3 py-2">{row.landType || '-'}</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">{row.acreage ? `${row.acreage} Acres` : '-'}</td>
                        <td className="px-3 py-2">{row.irrigation || '-'}</td>
                        <td className="px-3 py-2">{row.ownership || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CROP DETAILS TABLE IF PRESENT */}
          {cropDetails.length > 0 && (
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-[#0F4C81] uppercase tracking-widest mb-4 border-b border-slate-200/80 pb-3">
                Crop Cultivation Particulars
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <thead className="bg-[#0F4C81] text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Crop Name</th>
                      <th className="px-3 py-2.5">Cultivated Area</th>
                      <th className="px-3 py-2.5">Season</th>
                      <th className="px-3 py-2.5">Expected Annual Income</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cropDetails.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 text-slate-800">
                        <td className="px-3 py-2 font-bold text-[#0F4C81]">{idx + 1}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{row.cropName || '-'}</td>
                        <td className="px-3 py-2 font-bold text-blue-700">{row.area ? `${row.area} Acres` : '-'}</td>
                        <td className="px-3 py-2">{row.season || '-'}</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">
                          {row.expectedIncome ? `₹${Number(row.expectedIncome).toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CO-APPLICANT & NOMINEE CARD IF PRESENT */}
          {(formData.nomName || formData.coName || formData.fatherHusbandName) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.nomName && (
                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-200/80 pb-2">
                    Nominee Details
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Nominee Name</span>
                      <span className="font-extrabold text-slate-900">{formData.nomName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Relationship</span>
                      <span className="font-semibold text-slate-800">{formData.nomRel || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Address</span>
                      <span className="font-semibold text-slate-800">{formData.nomAddress || displayAddress}</span>
                    </div>
                  </div>
                </div>
              )}

              {formData.coName && (
                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-200/80 pb-2">
                    Co-Applicant Details
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Co-Applicant Name</span>
                      <span className="font-extrabold text-slate-900">{formData.coName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Relationship</span>
                      <span className="font-semibold text-slate-800">{formData.coRelation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Mobile</span>
                      <span className="font-semibold text-slate-800">{formData.coMobile || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ATTACHED DOCUMENTS & SIGNATURES */}
          {application.images && Object.keys(application.images).length > 0 && (
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-200/80 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F4C81]" /> Attached Documents & Signatures
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(application.images).map(([key, base64Url]: any) => (
                  <div key={key} className="flex flex-col items-center p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <span className="text-[10px] uppercase font-black text-slate-600 tracking-wider mb-2 w-full text-center border-b border-slate-100 pb-1.5">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {base64Url && typeof base64Url === 'string' && base64Url.startsWith('data:image') ? (
                      <img src={base64Url} alt={key} className="max-w-full h-auto max-h-36 object-contain rounded" />
                    ) : base64Url && typeof base64Url === 'string' && base64Url.startsWith('data:application/pdf') ? (
                      <a href={base64Url} download={`${key}.pdf`} className="text-blue-600 hover:underline font-bold text-xs flex items-center gap-1.5 py-4">
                        <FileText className="w-4 h-4" /> Download PDF
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic py-4">Uploaded File</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
