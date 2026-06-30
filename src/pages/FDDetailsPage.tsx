import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, Download, CheckCircle, ShieldCheck, FileText, ArrowLeft, Building2, User, Landmark } from 'lucide-react';
import api from '../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const FDDetailsPage = ({ appId, setCurrentTab }: { appId: string, setCurrentTab: (tab: string) => void }) => {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFD = async () => {
      try {
        const res = await api.get(`/fd/${appId}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFD();
  }, [appId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    const element = pdfRef.current;
    
    // Make visible temporarily for capture
    element.classList.remove('opacity-0', '-z-50', 'pointer-events-none');
    
    // Short delay to ensure DOM is fully painted
    await new Promise(r => setTimeout(r, 100));
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape', // Certificate looks better in landscape
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Center vertically if needed, but usually landscape fits well
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FD_Certificate_${data?.fd?.fdNumber || 'Doc'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF');
    } finally {
      element.classList.add('opacity-0', '-z-50', 'pointer-events-none');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-[#0F4C81]">Loading FD Details...</div>;
  }

  if (!data || !data.fd) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Fixed Deposit not found</h2>
        <button onClick={() => setCurrentTab('my_fds')} className="px-6 py-2 bg-[#0F4C81] text-white rounded-lg">Return to FDs</button>
      </div>
    );
  }

  const fd = data.fd;
  const user = data.user;
  const application = fd.applicationId || {};
  const formData = application.formData || {};
  const signature = application.images?.signature || null;
  const transactions = data.transactions || [];
  const mainTxn = transactions[0] || {};

  // Fallbacks for older FDs that didn't save formData
  const displayFullName = formData.app1Name || formData.fullName || user.fullName || 'N/A';
  const displayAddress = formData.app1Address || formData.address1 || user.address || 'Address Not Provided';
  const displayMobile = formData.app1Mobile || formData.mobile || user.phone || 'N/A';
  const displayEmail = formData.app1Email || formData.email || user.email || 'N/A';
  const displayDOB = formData.app1Dob || formData.dob || user.dob || 'N/A';
  const displayAadhaar = formData.app1Aadhaar || formData.aadhaar || 'Not Provided';
  const displayPan = formData.app1Pan || formData.pan || 'Not Provided';
  const displayNominee = fd.nomineeDetails?.name || formData.nomineeName || 'Not Provided';
  const displayNomineeRel = fd.nomineeDetails?.relation || formData.nomineeRelationship || 'N/A';

  const LabelValue = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{label}</span>
      <span className="text-sm font-semibold text-slate-900 break-words">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 print:p-0 print:m-0 print:max-w-full">
      {/* Action Buttons & Header (Hidden in Print) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setCurrentTab('my_fds')} 
            className="p-2 bg-white border border-slate-200 text-slate-500 rounded-full hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">FD Details</h1>
            <p className="text-sm font-medium text-slate-500">{fd.fdNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={handlePrint}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Details
          </button>
          {fd.status === 'Active' && (
            <button 
              onClick={handleDownloadPdf}
              className="flex-1 md:flex-none px-6 py-3 bg-[#0F4C81] text-white hover:bg-blue-900 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Download Certificate
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8 print:space-y-4">
        
        {/* SECTION 1: COMPLETE APPLICATION DETAILS */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 print:rounded-none print:border-none print:shadow-none print:p-0">
          <h2 className="text-lg font-black text-[#0F4C81] uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-5 h-5" /> Customer & Application Details
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">Primary Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                <LabelValue label="Customer ID" value={user.customerId} />
                <LabelValue label="Customer Name" value={displayFullName} />
                <LabelValue label="Date of Birth" value={displayDOB} />
                <LabelValue label="Account Status" value={user.kycStatus === 'Verified' ? 'Active' : 'Pending KYC'} />
                <LabelValue label="Application No" value={application._id ? application._id.toString().substring(0, 10).toUpperCase() : 'N/A'} />
                <LabelValue label="Mobile Number" value={displayMobile} />
                <LabelValue label="Email Address" value={displayEmail} />
                <LabelValue label="PAN Number" value={displayPan} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">Address Details</h3>
                <div className="grid grid-cols-1 gap-6 px-2">
                  <LabelValue label="Residential Address" value={displayAddress} />
                  {formData.villageCity && (
                    <LabelValue label="City & State" value={`${formData.villageCity}, ${formData.state} - ${formData.pinCode}`} />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">Nominee Details</h3>
                <div className="grid grid-cols-2 gap-6 px-2">
                  <LabelValue label="Nominee Name" value={displayNominee} />
                  <LabelValue label="Relationship" value={displayNomineeRel} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 & 3: FD & TRANSACTION DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-4">
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 print:rounded-none print:border-none print:shadow-none print:p-0">
            <h2 className="text-lg font-black text-[#0F4C81] uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Landmark className="w-5 h-5" /> Fixed Deposit Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <LabelValue label="FD Account Number" value={fd.fdNumber} />
              <LabelValue label="Deposit Amount" value={`₹${fd.principalAmount?.toLocaleString('en-IN')}`} />
              <LabelValue label="Deposit Date" value={new Date(fd.depositDate).toLocaleDateString()} />
              <LabelValue label="Interest Rate" value={`${fd.interestRate}% p.a.`} />
              <LabelValue label="Tenure" value={`${fd.tenureMonths} Months`} />
              <LabelValue label="Maturity Date" value={new Date(fd.maturityDate).toLocaleDateString()} />
              <LabelValue label="Maturity Amount" value={`₹${fd.maturityAmount?.toLocaleString('en-IN')}`} />
              <LabelValue label="FD Status" value={fd.status} />
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 print:rounded-none print:border-none print:shadow-none print:p-0">
            <h2 className="text-lg font-black text-[#0F4C81] uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <FileText className="w-5 h-5" /> Transaction Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <LabelValue label="Transaction ID" value={mainTxn.referenceNumber || `TXN${fd.fdNumber}`} />
              <LabelValue label="Payment Date" value={mainTxn.date ? new Date(mainTxn.date).toLocaleDateString() : new Date(fd.depositDate).toLocaleDateString()} />
              <LabelValue label="Amount Debited" value={`₹${fd.principalAmount?.toLocaleString('en-IN')}`} />
              <LabelValue label="Transaction Status" value={mainTxn.status || 'Completed'} />
            </div>
            
            <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Application Approved</p>
                <p className="text-xs text-emerald-700">Processed by Automated Banking System on {new Date(application.processedAt || fd.depositDate).toLocaleDateString()}</p>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION 4: OFFICIAL CERTIFICATE */}
        {fd.status === 'Active' && (
          <section className="mt-8 print:mt-16 print:break-before-page">
            <h2 className="text-lg font-black text-slate-400 uppercase tracking-wider mb-4 text-center print:hidden">
              Official Certificate Preview
            </h2>
            
            <div ref={certificateRef} className="relative mx-auto max-w-5xl shadow-2xl print:shadow-none overflow-hidden" 
                 style={{ 
                   backgroundColor: '#fdfbf7', // Vintage paper base
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
                   border: '20px solid transparent',
                   borderImage: 'repeating-linear-gradient(45deg, #0F4C81, #0F4C81 10px, transparent 10px, transparent 20px) 20',
                   padding: '40px 60px',
                   fontFamily: "'Georgia', serif"
                 }}>
                 
              {/* Inner Border */}
              <div className="absolute inset-0 border-[3px] border-[#0F4C81]/20 m-6 pointer-events-none"></div>
              <div className="absolute inset-0 border-[1px] border-[#0F4C81]/40 m-8 pointer-events-none"></div>

              {/* Header */}
              <div className="flex flex-col items-center justify-center border-b border-[#0F4C81]/20 pb-8 mb-10 text-center relative z-10 mt-8">
                <img src="/logo-bg.png" alt="Odiyooru Souharda" className="w-24 h-24 object-contain mb-4" />
                <h1 className="text-3xl md:text-4xl font-black text-[#0F4C81] uppercase tracking-tighter" style={{ fontFamily: 'Inter, sans-serif' }}>Odiyooru Souharda</h1>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-widest mt-1">Cooperative Society Ltd.</p>
                
                <div className="mt-8 bg-[#0F4C81] text-white px-8 py-2 rounded-sm shadow-md">
                  <h2 className="text-2xl font-bold uppercase tracking-[0.2em] font-serif">Certificate of Fixed Deposit</h2>
                </div>
              </div>

              {/* Certificate Body Paragraph */}
              <div className="relative z-10 px-8 text-center leading-[2.5]">
                <p className="text-lg md:text-xl text-slate-800 text-justify">
                  This is to certify that <span className="font-bold border-b border-dashed border-slate-400 px-2">{displayFullName}</span> 
                  , residing at <span className="italic border-b border-dashed border-slate-400 px-2">{displayAddress}</span>, 
                  holding Customer ID <span className="font-bold font-mono tracking-wider">{user.customerId}</span>, 
                  has securely deposited a sum of <span className="font-bold text-xl px-2">₹{fd.principalAmount?.toLocaleString('en-IN')}</span> 
                  into the Fixed Deposit scheme under the Account Number <span className="font-bold font-mono text-[#0F4C81] tracking-wider text-xl px-2">{fd.fdNumber}</span>. 
                </p>
                <p className="text-lg md:text-xl text-slate-800 text-justify mt-4">
                  The deposit was initiated on <span className="font-bold px-2">{new Date(fd.depositDate).toLocaleDateString()}</span> and is contracted for a tenure of 
                  <span className="font-bold px-2">{fd.tenureMonths} Months</span>, yielding an interest rate of <span className="font-bold px-2">{fd.interestRate}% p.a.</span> 
                  (compounded {fd.compoundingFrequency?.toLowerCase() || 'quarterly'}). The said deposit shall mature on 
                  <span className="font-bold px-2">{new Date(fd.maturityDate).toLocaleDateString()}</span>, with an accumulated maturity value of 
                  <span className="font-bold text-emerald-800 text-xl px-2">₹{fd.maturityAmount?.toLocaleString('en-IN')}</span>.
                </p>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end mt-24 mb-8 px-12 relative z-10">
                <div className="text-center w-56 flex flex-col items-center">
                  {signature ? (
                    <img src={signature} alt="Customer Signature" className="h-16 object-contain mb-2" style={{ mixBlendMode: 'multiply' }} />
                  ) : (
                    <div className="h-16 flex items-end justify-center mb-2">
                      <span className="font-['Brush_Script_MT',cursive] text-2xl text-slate-600 opacity-60">{displayFullName}</span>
                    </div>
                  )}
                  <div className="w-full border-t-2 border-slate-400 pt-2">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-widest font-sans">Depositor's Signature</p>
                  </div>
                </div>

                <div className="text-center flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-4 border-rose-900/40 flex items-center justify-center opacity-60 mx-auto mb-2 relative rotate-[-15deg]">
                    <div className="absolute inset-1 border-[1px] border-solid border-rose-900/30 rounded-full"></div>
                    <div className="absolute inset-3 border-2 border-dashed border-rose-900/60 rounded-full flex flex-col items-center justify-center text-rose-900">
                      <Landmark className="w-6 h-6 mb-1" />
                      <span className="text-[9px] font-black uppercase text-center leading-tight font-sans tracking-widest">Odiyooru<br/>Official</span>
                    </div>
                  </div>
                </div>

                <div className="text-center w-56 flex flex-col items-center">
                  <div className="h-16 flex items-end justify-center mb-2">
                    <span className="font-['Brush_Script_MT',cursive] text-3xl text-blue-900/80 -rotate-6">Verified System</span>
                  </div>
                  <div className="w-full border-t-2 border-slate-400 pt-2">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-widest font-sans">Authorized Signatory</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12 pb-4 relative z-10">
                <p className="text-xs text-slate-500 font-medium italic font-sans">
                  This certificate is computer generated on {new Date().toLocaleDateString()} and is legally binding subject to the terms and conditions of the Society.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Hidden PDF Clone Element (Used by html2canvas for Landscape High-Res generation) */}
      <div ref={pdfRef} className="absolute opacity-0 -z-50 pointer-events-none top-[-9999px] left-[-9999px] w-[1123px] h-[794px] overflow-hidden" 
           style={{ 
             backgroundColor: '#fdfbf7', // Vintage paper base
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
             border: '20px solid transparent',
             borderImage: 'repeating-linear-gradient(45deg, #0F4C81, #0F4C81 10px, transparent 10px, transparent 20px) 20',
             padding: '40px 60px',
             fontFamily: "'Georgia', serif",
             position: 'relative',
             boxSizing: 'border-box'
           }}>
           
        {/* Inner Border */}
        <div className="absolute inset-0 border-[3px] border-[#0F4C81]/20 m-6 pointer-events-none"></div>
        <div className="absolute inset-0 border-[1px] border-[#0F4C81]/40 m-8 pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col items-center justify-center border-b border-[#0F4C81]/20 pb-6 mb-8 text-center relative z-10 mt-6">
          <img src="/logo-bg.png" alt="Odiyooru Souharda" className="w-20 h-20 object-contain mb-3" />
          <h1 className="text-4xl font-black text-[#0F4C81] uppercase tracking-tighter" style={{ fontFamily: 'Inter, sans-serif' }}>Odiyooru Souharda</h1>
          <p className="text-sm font-bold text-slate-700 uppercase tracking-widest mt-1">Cooperative Society Ltd.</p>
          
          <div className="mt-6 bg-[#0F4C81] text-white px-8 py-2 rounded-sm shadow-md">
            <h2 className="text-2xl font-bold uppercase tracking-[0.2em] font-serif">Certificate of Fixed Deposit</h2>
          </div>
        </div>

        {/* Certificate Body Paragraph */}
        <div className="relative z-10 px-12 text-center leading-[2.5]">
          <p className="text-xl text-slate-800 text-justify">
            This is to certify that <span className="font-bold border-b border-dashed border-slate-400 px-2">{displayFullName}</span> 
            , residing at <span className="italic border-b border-dashed border-slate-400 px-2">{displayAddress}</span>, 
            holding Customer ID <span className="font-bold font-mono tracking-wider">{user?.customerId}</span>, 
            has securely deposited a sum of <span className="font-bold text-2xl px-2">₹{fd?.principalAmount?.toLocaleString('en-IN')}</span> 
            into the Fixed Deposit scheme under the Account Number <span className="font-bold font-mono text-[#0F4C81] tracking-wider text-2xl px-2">{fd?.fdNumber}</span>. 
          </p>
          <p className="text-xl text-slate-800 text-justify mt-4">
            The deposit was initiated on <span className="font-bold px-2">{fd?.depositDate ? new Date(fd.depositDate).toLocaleDateString() : ''}</span> and is contracted for a tenure of 
            <span className="font-bold px-2">{fd?.tenureMonths} Months</span>, yielding an interest rate of <span className="font-bold px-2">{fd?.interestRate}% p.a.</span> 
            (compounded {fd?.compoundingFrequency?.toLowerCase() || 'quarterly'}). The said deposit shall mature on 
            <span className="font-bold px-2">{fd?.maturityDate ? new Date(fd.maturityDate).toLocaleDateString() : ''}</span>, with an accumulated maturity value of 
            <span className="font-bold text-emerald-800 text-2xl px-2">₹{fd?.maturityAmount?.toLocaleString('en-IN')}</span>.
          </p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-20 mb-8 px-16 relative z-10">
          <div className="text-center w-64 flex flex-col items-center">
            {signature ? (
              <img src={signature} alt="Customer Signature" className="h-20 object-contain mb-2" style={{ mixBlendMode: 'multiply' }} />
            ) : (
              <div className="h-20 flex items-end justify-center mb-2">
                <span className="font-['Brush_Script_MT',cursive] text-3xl text-slate-600 opacity-60">{displayFullName}</span>
              </div>
            )}
            <div className="w-full border-t-2 border-slate-400 pt-2">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-widest font-sans">Depositor's Signature</p>
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-rose-900/40 flex items-center justify-center opacity-60 mx-auto mb-2 relative rotate-[-15deg]">
              <div className="absolute inset-1 border-[1px] border-solid border-rose-900/30 rounded-full"></div>
              <div className="absolute inset-3 border-2 border-dashed border-rose-900/60 rounded-full flex flex-col items-center justify-center text-rose-900">
                <Landmark className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-black uppercase text-center leading-tight font-sans tracking-widest">Odiyooru<br/>Official</span>
              </div>
            </div>
          </div>

          <div className="text-center w-64 flex flex-col items-center">
            <div className="h-20 flex items-end justify-center mb-2">
              <span className="font-['Brush_Script_MT',cursive] text-4xl text-blue-900/80 -rotate-6">Verified System</span>
            </div>
            <div className="w-full border-t-2 border-slate-400 pt-2">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-widest font-sans">Authorized Signatory</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-auto pb-4 absolute bottom-8 left-0 right-0 z-10">
          <p className="text-sm text-slate-500 font-medium italic font-sans">
            This certificate is computer generated on {new Date().toLocaleDateString()} and is legally binding subject to the terms and conditions of the Society.
          </p>
        </div>
      </div>
    </div>
  );
};
