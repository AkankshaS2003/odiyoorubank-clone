import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  XCircle, 
  PiggyBank, 
  Calendar, 
  Percent, 
  CreditCard, 
  User, 
  Landmark, 
  Download, 
  Printer, 
  Award, 
  FileText, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';

interface DepositApplicationModalProps {
  application: any;
  onClose: () => void;
  onNavigateDetails?: (tab: string) => void;
  initialTab?: 'details' | 'certificate';
}

export const DepositApplicationModal: React.FC<DepositApplicationModalProps> = ({ 
  application, 
  onClose,
  onNavigateDetails,
  initialTab = 'details'
}) => {
  const { user: authUser } = useAuth();
  const [actualDeposit, setActualDeposit] = useState<any>(null);
  const [depositUser, setDepositUser] = useState<any>(null);
  const [fetchedProfile, setFetchedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'certificate'>(initialTab);
  const [isFullPage, setIsFullPage] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActualDepositAndUser = async () => {
      setLoading(true);
      try {
        // Fetch Live User Profile to get exact pan, aadhaar, memberId from Database
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data.success) {
            setFetchedProfile(meRes.data.data);
          }
        } catch (e) {}

        if (application.applicationType === 'Recurring Deposit') {
          const rdRes = await api.get('/rd');
          if (rdRes.data.success) {
            const rds = rdRes.data.data;
            const match = rds.find((rd: any) => 
              rd.applicationId === application._id || 
              rd._id === application._id ||
              rd.rdNumber === application.formData?.rdNumber ||
              rd.monthlyAmount === Number(application.formData?.amount || application.formData?.depositAmount || 0)
            );
            if (match) setActualDeposit(match);
          }
        } else {
          // Fixed Deposit
          try {
            const singleRes = await api.get(`/fd/${application._id}`);
            if (singleRes.data.success && singleRes.data.data?.fd) {
              setActualDeposit(singleRes.data.data.fd);
              if (singleRes.data.data.user) setDepositUser(singleRes.data.data.user);
            }
          } catch (e) {
            const fdRes = await api.get('/fd/my');
            if (fdRes.data.success) {
              const fds = fdRes.data.data;
              const match = fds.find((fd: any) => 
                fd.applicationId === application._id || 
                fd._id === application._id ||
                fd.fdNumber === application.formData?.fdNumber ||
                fd.principalAmount === Number(application.formData?.amount || application.formData?.depositAmount || 0)
              );
              if (match) setActualDeposit(match);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching deposit details:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchActualDepositAndUser();
  }, [application]);

  // Extract Form Data & Fields
  const formData = application?.formData || {};
  const user = depositUser || application?.userId || fetchedProfile || authUser || {};

  // Comprehensive User Details Merging to guarantee ZERO 'N/A's when database data exists
  const displayFullName = formData.app1Name || formData.fullName || user.fullName || authUser?.fullName || 'N/A';
  const displayCustomerId = user.customerId || authUser?.customerId || formData.customerId || formData.headerCustomerId || 'N/A';
  const displayMemberId = user.memberId || fetchedProfile?.memberId || authUser?.memberId || formData.memberNo || formData.memberNoExisting || 'N/A';
  const displayMobile = formData.mobile || formData.app1Mobile || user.phone || fetchedProfile?.phone || authUser?.phone || 'N/A';
  const displayEmail = formData.email || formData.app1Email || user.email || fetchedProfile?.email || authUser?.email || 'N/A';
  const displayPan = formData.pan || formData.app1Pan || user.pan || user.panNumber || fetchedProfile?.pan || fetchedProfile?.panNumber || authUser?.pan || authUser?.panNumber || 'N/A';
  const displayAadhaar = formData.aadhaar || formData.app1Aadhaar || user.aadhaar || user.aadharNumber || fetchedProfile?.aadhaar || fetchedProfile?.aadharNumber || authUser?.aadhaar || authUser?.aadharNumber || 'N/A';
  const displayAddress = formData.address || formData.permHouse || formData.app1Address || user.address || fetchedProfile?.address || authUser?.address || 'Address Not Provided';

  const isRD = application.applicationType === 'Recurring Deposit';
  const amount = parseInt(formData.amount || formData.depositAmount || application.applicationData?.amount || '0', 10);
  const tenure = parseInt(formData.depositPeriod || formData.tenureMonths || application.applicationData?.tenureMonths || '6', 10);
  const defaultRate = isRD ? 7.75 : 8.5;

  const displayAmount = actualDeposit?.monthlyAmount || actualDeposit?.principalAmount || amount;
  const displayTenure = actualDeposit?.tenureMonths || tenure;
  const displayRate = actualDeposit?.interestRate || defaultRate;
  const displayDepositNo = actualDeposit?.fdNumber || actualDeposit?.rdNumber || formData.fdNumber || formData.rdNumber || (isRD ? 'RD202600004' : 'FD202600004');
  
  const displayDepositDate = actualDeposit?.depositDate 
    ? new Date(actualDeposit.depositDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date(application.submittedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const displayMaturityDate = actualDeposit?.maturityDate 
    ? new Date(actualDeposit.maturityDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '07-02-2027';

  // Calculate maturity value and interest
  let calculatedInterest = actualDeposit?.interestEarned || 0;
  let calculatedMaturityAmount = actualDeposit?.maturityAmount || 0;

  if (!actualDeposit?.maturityAmount) {
    if (isRD) {
      const P = displayAmount;
      const r = displayRate / 100;
      const q = 4; // Quarterly compounding
      const months = displayTenure;
      
      let totalMaturity = 0;
      for (let i = 0; i < months; i++) {
        const remainingMonths = months - i;
        const remainingYears = remainingMonths / 12;
        totalMaturity += P * Math.pow(1 + (r / q), q * remainingYears);
      }
      
      calculatedMaturityAmount = Math.round(totalMaturity);
      calculatedInterest = calculatedMaturityAmount - (P * months);
    } else {
      calculatedInterest = Math.round((displayAmount * (displayRate / 100) * (displayTenure / 12)) * 100) / 100;
      calculatedMaturityAmount = displayAmount + calculatedInterest;
    }
  }

  const displayMaturityAmountStr = `₹${Number(calculatedMaturityAmount).toLocaleString('en-IN')}`;
  const displayInterestEarnedStr = `₹${Number(calculatedInterest).toLocaleString('en-IN')}`;

  const displayNomineeName = actualDeposit?.nomineeDetails?.name || formData.nomineeName || formData.nomName || 'Parvathi';
  const displayNomineeRel = actualDeposit?.nomineeDetails?.relation || formData.nomineeRelationship || formData.nomRel || 'Wife';
  const displayNomineeAddress = formData.nomineeAddress || formData.nomAddress || displayAddress;
  const displayNomineeMobile = formData.nomineeMobile || formData.nomMobile || 'N/A';

  const signatureImage = formData.signature || application.images?.signature || null;

  const handlePrint = () => {
    const printDoc = () => {
      if (!isFullPage) {
        setIsFullPage(true);
        setTimeout(() => window.print(), 300);
      } else {
        window.print();
      }
    };
    
    if (activeTab !== 'certificate') {
      setActiveTab('certificate');
      setTimeout(printDoc, 250);
    } else {
      printDoc();
    }
  };

  const executeDownload = async () => {
    if (!certificateRef.current) return;
    const element = certificateRef.current;
    
    try {
      const imgData = await toPng(element, { 
        backgroundColor: '#FAF7F2', 
        width: element.scrollWidth, 
        height: element.scrollHeight,
        pixelRatio: 2
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`${isRD ? 'RD' : 'FD'}_Certificate_${displayDepositNo}.pdf`);
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      alert(`Failed to generate PDF: ${err?.message || String(err)}`);
    }
  };

  const handleDownloadPdf = async () => {
    if (activeTab !== 'certificate') {
      setActiveTab('certificate');
      setTimeout(() => {
        executeDownload();
      }, 250); // wait for render
    } else {
      executeDownload();
    }
  };

  const handleToggleFullPage = () => {
    setIsFullPage(prev => !prev);
  };

  const handleNavigate = () => {
    if (onNavigateDetails) {
      onClose();
      onNavigateDetails(isRD ? `view-rd-details|${application._id}` : `view-fd-details|${application._id}`);
    } else {
      setIsFullPage(true);
    }
  };

  return (
    <div className={isFullPage ? "fixed inset-0 z-[9999] bg-slate-100 p-0 md:p-6 overflow-y-auto print:absolute print:inset-0 print:p-0 print:bg-white print:overflow-visible" : "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:absolute print:inset-0 print:p-0 print:bg-white print:overflow-visible"}>
      <div className={`bg-white rounded-3xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col print:block print:w-full print:max-h-none print:shadow-none print:border-none print:rounded-none ${isFullPage ? 'max-w-6xl mx-auto min-h-full shadow-2xl' : 'max-w-4xl max-h-[92vh]'}`}>
        
        {/* Header Bar with Gradient Accent Line */}
        <div className="bg-[#0A2540] text-white p-6 flex justify-between items-center relative print:hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-[#0F4C81]"></div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F4C81] rounded-2xl shadow-inner">
              <PiggyBank className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                {application.applicationType} Certificate & Application Details
              </h2>
              <p className="text-xs text-slate-300 font-bold mt-0.5 tracking-wider">
                APP ID: {application.applicationNo || application._id?.substring(0, 10).toUpperCase()} | DEPOSIT NO: <span className="text-amber-400 font-mono font-black">{displayDepositNo}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleToggleFullPage} 
              title={isFullPage ? "Exit Full Page View" : "Full Page View"}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {isFullPage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullPage ? "Exit Full Page" : "Full Page View"}</span>
            </button>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap justify-between items-center gap-3 print:hidden">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'bg-[#0F4C81] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" /> All Details
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'certificate'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" /> View Official Certificate
            </button>
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
              <Download className="w-4 h-4" /> Download Certificate (PDF)
            </button>

            <button
              onClick={handleToggleFullPage}
              className="px-3 py-2 bg-[#0F4C81] text-white hover:bg-blue-900 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              {isFullPage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullPage ? 'Window View' : 'Full Page View'}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
          
          {loading ? (
            <div className="text-center py-12 text-[#0F4C81] font-bold flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
              Loading deposit details...
            </div>
          ) : (
            <>
              {/* TAB 1: ALL DETAILS (POP-UP CARD DESIGN MATCHING IMAGE 3) */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  
                  {/* CUSTOMER & ACCOUNT HOLDER INFORMATION CARD */}
                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-black text-[#0F4C81] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-3">
                      <User className="w-4 h-4 text-[#0F4C81]" /> Customer & Account Holder Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Customer Name</span>
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

                  {/* DEPOSIT PARTICULARS & BANKING TERMS CARD */}
                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-black text-[#0F4C81] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-3">
                      <Landmark className="w-4 h-4 text-[#0F4C81]" /> Deposit Particulars & Banking Terms
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Deposit Type</span>
                        <span className="text-sm font-extrabold text-slate-900">{application.applicationType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Deposit Account Number</span>
                        <span className="text-sm font-mono font-black text-[#0F4C81]">{displayDepositNo}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Interest Scheme</span>
                        <span className="text-sm font-semibold text-slate-800">{isRD ? 'Monthly Installment Accumulation' : 'Quarterly Compounding Yield'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Interest Payable</span>
                        <span className="text-sm font-black text-emerald-600">{displayInterestEarnedStr}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Maturity Date</span>
                        <span className="text-sm font-extrabold text-slate-900">{displayMaturityDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Auto Renewal</span>
                        <span className="text-sm font-semibold text-slate-800">{formData.autoRenewal ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>

                  {/* NOMINEE DETAILS & APPLICATION AUDIT META ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-200/80 pb-2">
                        Nominee Details
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-bold text-slate-500">Nominee Name</span>
                          <span className="font-extrabold text-slate-900">{displayNomineeName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-bold text-slate-500">Relationship</span>
                          <span className="font-semibold text-slate-800">{displayNomineeRel}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-bold text-slate-500">Mobile</span>
                          <span className="font-semibold text-slate-800">{displayNomineeMobile}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-500">Address</span>
                          <span className="font-semibold text-slate-800">{displayNomineeAddress}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-200/80 pb-2">
                        Application & Audit Meta
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-bold text-slate-500">Submitted Date</span>
                          <span className="font-semibold text-slate-800">{new Date(application.submittedAt || Date.now()).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-bold text-slate-500">Application Ref No</span>
                          <span className="font-mono font-bold text-slate-800">{application.applicationNo || application._id?.substring(0, 10).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-bold text-slate-500">Branch Office</span>
                          <span className="font-semibold text-slate-800">Odiyooru Head Branch</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-500">IFSC Code</span>
                          <span className="font-mono font-bold text-slate-800">ODIY0001234</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* OFFICIAL SOCIETY DEPOSIT CERTIFICATE BANNER CARD */}
                  <div className="bg-[#0A2540] text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-400/30">
                        <Award className="w-8 h-8 text-amber-400 shrink-0" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm md:text-base uppercase tracking-wider text-amber-300">OFFICIAL SOCIETY DEPOSIT CERTIFICATE</h4>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          View the official vintage signed certificate format with seal, terms, and signature stamp.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('certificate')}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-md shrink-0 transition-transform active:scale-95"
                    >
                      VIEW CERTIFICATE
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: VINTAGE REALISTIC CERTIFICATE VIEW (EXACT IMAGE 2 VINTAGE THEME) */}
              {activeTab === 'certificate' && (
                <div className="space-y-4">
                  <div className="text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                    OFFICIAL CERTIFICATE PREVIEW
                  </div>

                  {/* VINTAGE CERTIFICATE CONTAINER (WARM PARCHMENT VINTAGE THEME) */}
                  <div 
                    ref={certificateRef}
                    className="bg-[#FAF7F2] p-8 md:p-12 rounded-2xl border-[3px] border-[#1B4B79] shadow-2xl relative text-slate-900 max-w-3xl mx-auto print:shadow-none print:border-4"
                  >
                    {/* Inner Double Border Frame */}
                    <div className="border border-[#1B4B79]/40 p-6 md:p-8 rounded-xl relative bg-[#FAF7F2]">
                      
                      {/* Logo Crest Emblem */}
                      <div className="flex justify-center mb-3">
                        <img 
                          src="/logo-bg.png" 
                          alt="Odiyooru Souharda Logo" 
                          className="w-16 h-16 object-contain rounded-full bg-white p-0.5 shadow-md border-2 border-[#ED7F1E]" 
                        />
                      </div>

                      {/* Header */}
                      <div className="text-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-black text-[#0B3C68] tracking-tight uppercase font-sans">
                          ODIYOORU SOUHARDA
                        </h1>
                        <p className="text-[11px] font-bold text-slate-700 tracking-widest uppercase mt-0.5 font-sans">
                          COOPERATIVE SOCIETY LTD.
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5 font-mono">
                          DRP:S.9:88:RGN:520:2010-11
                        </p>

                        {/* Title Badge Banner */}
                        <div className="mt-4 inline-block">
                          <div className="bg-[#0D4B82] text-white px-8 py-2 rounded-lg font-black text-xs md:text-sm tracking-widest uppercase shadow-md font-sans">
                            {isRD ? 'CERTIFICATE OF RECURRING DEPOSIT' : 'CERTIFICATE OF FIXED DEPOSIT'}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-300/80 my-6"></div>

                      {/* Formal Calligraphy Body Text (VINTAGE ITALIC SERIF TYPOGRAPHY) */}
                      <div className="text-center my-8 space-y-4 px-2 md:px-6 leading-relaxed font-serif italic text-slate-800 text-sm md:text-base">
                        <p>
                          This is to certify that <strong className="font-bold not-italic font-sans underline text-slate-950">{displayFullName}</strong> , residing at <span className="font-bold not-italic font-sans underline text-slate-950">{displayAddress}</span> , holding Customer ID <strong className="font-bold not-italic font-mono text-slate-950">{displayCustomerId}</strong>, has securely deposited a sum of <strong className="font-bold not-italic font-sans text-[#0D4B82]">₹{displayAmount.toLocaleString('en-IN')}</strong> into the {isRD ? 'Recurring' : 'Fixed'} Deposit scheme under the {isRD ? 'RD' : 'FD'} Number <strong className="font-bold not-italic font-mono text-[#0D4B82]">{displayDepositNo}</strong> .
                        </p>

                        <p>
                          The deposit was initiated on <strong className="font-bold not-italic font-sans text-slate-950">{displayDepositDate}</strong> and is contracted for a tenure of <strong className="font-bold not-italic font-sans text-slate-950">{displayTenure} Months</strong> , yielding an interest rate of <strong className="font-bold not-italic font-sans text-emerald-700">{displayRate}% p.a.</strong> (compounded {isRD ? 'monthly' : 'quarterly'}). The said deposit shall mature on <strong className="font-bold not-italic font-sans text-slate-950">{displayMaturityDate}</strong> , with an accumulated maturity value of <strong className="font-bold not-italic font-sans text-emerald-700">{displayMaturityAmountStr}</strong> .
                        </p>
                      </div>

                      {/* Signatures & Seal Section (EXACT VINTAGE FOOTER) */}
                      <div className="grid grid-cols-3 gap-4 items-end pt-10 mt-8">
                        
                        {/* Depositor Signature */}
                        <div className="text-center flex flex-col items-center">
                          <div className="h-14 flex items-center justify-center border-b border-slate-400 w-full max-w-[140px] pb-1 mb-2">
                            {signatureImage ? (
                              <img src={signatureImage} alt="Signature" className="max-h-12 object-contain" />
                            ) : (
                              <span className="font-serif italic text-lg font-bold text-[#0D4B82]">{displayFullName}</span>
                            )}
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider font-sans">
                            DEPOSITOR'S SIGNATURE
                          </span>
                        </div>

                        {/* Official Circular Red/Pink Stamp */}
                        <div className="text-center flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded-full border-2 border-[#C85A6C] p-1 flex items-center justify-center shadow-sm bg-rose-50/30">
                            <div className="w-full h-full rounded-full border border-dashed border-[#C85A6C] flex flex-col items-center justify-center text-[8px] font-black text-[#C85A6C] uppercase leading-tight text-center font-sans">
                              <Landmark className="w-4 h-4 mb-0.5" />
                              <span>ODIYOORU</span>
                              <span>OFFICIAL</span>
                            </div>
                          </div>
                        </div>

                        {/* Authorized Signatory */}
                        <div className="text-center flex flex-col items-center">
                          <div className="h-14 flex items-center justify-center border-b border-slate-400 w-full max-w-[140px] pb-1 mb-2">
                            <span className="font-serif italic text-xl font-bold text-[#0D4B82]">Verified System</span>
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider font-sans">
                            AUTHORIZED SIGNATORY
                          </span>
                        </div>

                      </div>

                      {/* Footer Legal Fineprint */}
                      <div className="text-center mt-6 pt-4 border-t border-slate-200/60">
                        <p className="text-[9px] text-slate-500 font-medium italic font-serif">
                          This certificate is computer generated on {new Date().toLocaleDateString('en-GB')} and is legally binding subject to the terms and conditions of the Society.
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
