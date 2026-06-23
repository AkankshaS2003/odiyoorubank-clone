import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, Download, CheckCircle, ShieldCheck, FileText, DownloadCloud, Landmark, User, FileImage, CreditCard } from 'lucide-react';

export const FDDetailsPage = ({ appId, setCurrentTab }: { appId: string, setCurrentTab: (tab: string) => void }) => {
  const { getUserServiceApplications, systemSettings, user } = useAuth();
  const [fdData, setFdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const apps = await getUserServiceApplications();
        const found = apps.find(a => a._id === appId);
        if (found) {
          setFdData(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [appId, getUserServiceApplications]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-[#0F4C81]">Loading FD Details...</div>;
  }

  if (!fdData) {
    return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">FD Account not found</h2>
      <button onClick={() => setCurrentTab('dashboard')} className="px-6 py-2 bg-[#0F4C81] text-white rounded-lg">Return to Dashboard</button>
    </div>;
  }

  // Simulated Computations
  const fdAccountNumber = `FD-${fdData._id.substring(0, 8).toUpperCase()}`;
  const transactionRef = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
  const receiptNumber = `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;
  const employeeId = `EMP${Math.floor(1000 + Math.random() * 9000)}`;
  
  const principalAmount = Number(fdData.formData?.amount) || 0;
  const depositPeriod = Number(fdData.formData?.depositPeriod) || 12; // assuming months
  
  // Base logic for rates
  const interestRate = systemSettings?.fdRate || 8.50;

  const startDateStr = new Date(fdData.submittedAt).toLocaleDateString();
  const maturityDateObj = new Date(fdData.submittedAt);
  maturityDateObj.setMonth(maturityDateObj.getMonth() + depositPeriod);
  const maturityDateStr = maturityDateObj.toLocaleDateString();

  // Simple maturity calculation (compound interest annually, approximated for months)
  const ratePerPeriod = interestRate / 100;
  const maturityAmount = Math.round(principalAmount * Math.pow((1 + ratePerPeriod), depositPeriod / 12));
  const interestEarned = maturityAmount - principalAmount;

  // Today progress
  const today = new Date();
  const start = new Date(fdData.submittedAt);
  const totalDays = Math.ceil((maturityDateObj.getTime() - start.getTime()) / (1000 * 3600 * 24));
  const daysPassed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const remainingDays = Math.max(0, totalDays - daysPassed);
  
  const interestEarnedTillDate = Math.round((interestEarned * daysPassed) / totalDays) || 0;

  const SectionTitle = ({ title, icon: Icon }: any) => (
    <h3 className="text-xs font-black text-white bg-[#0F4C81] px-4 py-2 inline-flex items-center gap-2 rounded-t-lg mt-6 mb-0 uppercase tracking-wider print:text-[#0F4C81] print:bg-transparent print:border-b-2 print:border-[#0F4C81] w-full border-b-2 border-[#0F4C81]">
      <Icon className="w-4 h-4 print:hidden" /> {title}
    </h3>
  );

  const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <div className="flex flex-col sm:flex-row justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-sm font-bold text-[#0F4C81] text-right">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white text-slate-800">
      <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button onClick={() => setCurrentTab('dashboard')} className="text-sm font-bold text-slate-500 hover:text-[#0F4C81]">← Back to Dashboard</button>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0F4C81] border border-[#0F4C81] rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
              <Printer className="w-4 h-4" /> Print Details
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-[#0F4C81]/20">
              <DownloadCloud className="w-4 h-4" /> Download Certificate
            </button>
          </div>
        </div>

        {/* Paper Document Container */}
        <div className="bg-white p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100 rounded-3xl print:rounded-none print:shadow-none print:border-none print:p-2">
          
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
                        value={fdData.formData?.app1MemberNo || 'CUST-XXXX'} 
                        readOnly
                        className="w-32 bg-white/20 rounded px-2 py-1 outline-none text-center text-white border border-white/10 placeholder-white/60 font-bold tracking-wide transition-colors focus:bg-white/30" 
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right pr-3 opacity-90">Application No:</td>
                    <td className="text-left">
                      <input type="text" value={fdData.formData?.applicationNo || '— — — —'} readOnly className="w-32 border-b border-white/40 outline-none bg-transparent text-center text-white placeholder-white/60 focus:border-white transition-colors tracking-widest font-bold" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FD SUMMARY CARD */}
          <div className="bg-[#EAF6FF] rounded-2xl p-6 border border-blue-100 mb-8 print:border-slate-300 print:bg-transparent">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">FD Account Number</p>
                <p className="text-lg font-black text-[#0F4C81]">{fdAccountNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Application No</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{fdData.formData?.applicationNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Customer ID</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{fdData.formData?.app1MemberNo || 'CUST-XXXX'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Deposit Date</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{startDateStr}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DEPOSITOR DETAILS */}
            <div>
              <SectionTitle title="Depositor Details" icon={User} />
              <div className="border border-t-0 border-[#0F4C81] p-5 rounded-b-lg space-y-1">
                <InfoRow label="Full Name" value={fdData.formData?.app1Name} />
                <InfoRow label="Mobile Number" value={fdData.formData?.app1Mobile} />
                <InfoRow label="Aadhaar Number" value={(fdData.formData?.app1Aadhaar || user?.aadharNumber) ? 'XXXX XXXX ' + String(fdData.formData?.app1Aadhaar || user?.aadharNumber).slice(-4) : 'XXXX XXXX 1234'} />
                <InfoRow label="PAN Number" value={(fdData.formData?.app1Pan || user?.panNumber) ? 'XXXXXX' + String(fdData.formData?.app1Pan || user?.panNumber).slice(-4) : 'XXXXXX1234'} />
                <InfoRow label="Address" value={fdData.formData?.app1Address} />
              </div>
            </div>

            {/* FD DETAILS */}
            <div>
              <SectionTitle title="Deposit Information" icon={FileText} />
              <div className="border border-t-0 border-[#0F4C81] p-5 rounded-b-lg space-y-1 bg-slate-50/50">
                <InfoRow label="Deposit Type" value={fdData.applicationType} />
                <InfoRow label="Principal Amount" value={`₹${principalAmount.toLocaleString('en-IN')}`} />
                <InfoRow label="Interest Rate" value={`${interestRate}% p.a.`} />
                <InfoRow label="Tenure" value={`${depositPeriod} Months`} />
                <InfoRow label="Maturity Date" value={maturityDateStr} />
                <InfoRow label="Maturity Amount" value={`₹${maturityAmount.toLocaleString('en-IN')}`} />
              </div>
            </div>

            {/* NOMINEE DETAILS */}
            <div>
              <SectionTitle title="Nominee Details" icon={ShieldCheck} />
              <div className="border border-t-0 border-[#0F4C81] p-5 rounded-b-lg space-y-1">
                <InfoRow label="Nominee Name" value={fdData.formData?.nomineeName} />
                <InfoRow label="Relationship" value={fdData.formData?.nomineeRelationship} />
                <InfoRow label="Date of Birth" value={fdData.formData?.minorDob || 'Not Specified'} />
                <InfoRow label="Address" value={fdData.formData?.nomineeAddress} />
              </div>
            </div>

            {/* PAYMENT & OPERATIONS */}
            <div>
              <SectionTitle title="Payment & Operation" icon={CreditCard} />
              <div className="border border-t-0 border-[#0F4C81] p-5 rounded-b-lg space-y-1">
                <InfoRow label="Mode of Operation" value={fdData.formData?.modeOfOperation || 'Self'} />
                <InfoRow label="Auto Renewal" value={fdData.formData?.standingInstructions ? 'Yes' : 'No'} />
                <InfoRow label="Transaction Ref" value={transactionRef} />
                <InfoRow label="Receipt Number" value={receiptNumber} />
              </div>
            </div>
          </div>

          {/* INTEREST INFORMATION CARD */}
          <SectionTitle title="Interest & Growth Tracking" icon={Landmark} />
          <div className="border border-t-0 border-[#0F4C81] p-6 rounded-b-lg bg-gradient-to-br from-[#0F4C81] to-blue-900 text-white print:border-slate-300 print:bg-white print:text-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-[10px] text-blue-200 font-bold uppercase mb-1 print:text-slate-500">Principal</p>
                <p className="text-xl font-black">₹{principalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-200 font-bold uppercase mb-1 print:text-slate-500">Earned Till Date</p>
                <p className="text-xl font-black text-emerald-400 print:text-slate-800">+₹{interestEarnedTillDate.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-200 font-bold uppercase mb-1 print:text-slate-500">Days Remaining</p>
                <p className="text-xl font-black">{remainingDays} Days</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-200 font-bold uppercase mb-1 print:text-slate-500">Maturity Value</p>
                <p className="text-xl font-black">₹{maturityAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-6 bg-slate-800/50 h-2 rounded-full overflow-hidden print:bg-slate-200">
              <div className="bg-emerald-400 h-full rounded-full print:bg-[#0F4C81]" style={{ width: `${Math.min(100, (daysPassed / totalDays) * 100)}%` }}></div>
            </div>
          </div>

          {/* DOCUMENTS SECTION */}
          {fdData.images && Object.keys(fdData.images).length > 0 && (
            <>
              <SectionTitle title="Attached Documents" icon={FileImage} />
              <div className="border border-t-0 border-[#0F4C81] p-5 rounded-b-lg grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.keys(fdData.images).map(key => (
                  <div key={key} className="border border-slate-200 rounded-lg p-3 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <FileImage className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-[#0F4C81] transition-colors" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">{key}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* FD CERTIFICATE VISUAL RENDERING */}
          <div className="mt-16 mb-8 p-8 border-[12px] border-double border-[#0F4C81]/20 bg-[#fffdf5] rounded-xl relative overflow-hidden print:break-inside-avoid shadow-inner">
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
              <Landmark className="w-96 h-96 text-[#0F4C81]" />
            </div>
            
            <div className="text-center relative z-10">
              <div className="flex items-center justify-center space-x-3 md:space-x-4 mx-auto mb-8 text-[#ED7F1E]">
                <img src="/logo-bg.png" alt="Odiyooru Souharda Logo" className="h-20 w-20 md:h-24 md:w-24 object-contain shrink-0" />
                <div className="leading-tight text-left">
                  <span className="text-2xl md:text-3xl font-black tracking-tight uppercase block leading-none font-heading">
                    Odiyooru Souharda
                  </span>
                  <span className="text-base md:text-lg font-bold uppercase tracking-widest leading-none block mt-1.5">
                    Cooperative Society Ltd
                  </span>
                  <span className="text-xs font-bold block mt-1.5 font-mono leading-none">
                    DRP:S.9:88:RGN:520:2010-11 <span className="mx-2 text-slate-300">|</span> <span className="text-slate-500">Certificate of Fixed Deposit</span>
                  </span>
                </div>
              </div>
              
              <div className="text-sm font-medium text-slate-800 leading-loose max-w-2xl mx-auto mb-12 text-justify italic">
                This is to certify that a sum of <span className="font-bold text-[#0F4C81] border-b border-slate-400 px-2 not-italic">₹{principalAmount.toLocaleString('en-IN')}</span> has been received from 
                <span className="font-bold text-[#0F4C81] border-b border-slate-400 px-2 not-italic">{fdData.formData?.app1Name?.toUpperCase()}</span> 
                on <span className="font-bold text-[#0F4C81] border-b border-slate-400 px-2 not-italic">{startDateStr}</span> as a Fixed Deposit 
                bearing Account Number <span className="font-bold text-[#0F4C81] border-b border-slate-400 px-2 not-italic">{fdAccountNumber}</span>. 
                The deposit will earn interest at the rate of <span className="font-bold text-[#0F4C81] border-b border-slate-400 px-2 not-italic">{interestRate}% p.a.</span> 
                and will mature on <span className="font-bold text-[#0F4C81] border-b border-slate-400 px-2 not-italic">{maturityDateStr}</span> 
                with a maturity value of <span className="font-bold text-[#0F4C81] border-b border-slate-400 px-2 not-italic">₹{maturityAmount.toLocaleString('en-IN')}</span>.
              </div>

              <div className="flex justify-between items-end mt-16 px-12">
                <div className="text-center">
                  <div className="w-40 border-b border-slate-800 mb-2"></div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Clerk / Cashier</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 border-2 border-slate-300 rounded-full flex items-center justify-center mx-auto mb-2 text-[10px] text-slate-400 rotate-12">BANK SEAL</div>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-800 mb-2"></div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Manager / Secretary</p>
                </div>
              </div>
            </div>
          </div>

          {/* APPROVAL DETAILS */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-between items-center print:hidden">
            <div className="text-xs text-slate-500 font-medium">
              <p>Approved By: <span className="font-bold text-slate-800">Admin</span> (Emp ID: {employeeId})</p>
              <p>Approval Date: <span className="font-bold text-slate-800">{new Date(fdData.updatedAt || fdData.submittedAt).toLocaleDateString()}</span></p>
            </div>
            <div className="text-right text-xs text-slate-500 font-medium">
              <p>Remarks: <span className="font-bold text-slate-800 italic">"Verified and Approved"</span></p>
            </div>
          </div>

          {/* FUTURE ENHANCEMENTS PLACEHOLDER */}
          <div className="mt-8 pt-8 border-t border-slate-200 flex flex-wrap gap-4 justify-center print:hidden">
            <button onClick={() => alert('FD Renewal History will be available soon.')} className="px-4 py-2 border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">FD Renewal History</button>
            <button onClick={() => alert('Premature Closure requests will be available soon.')} className="px-4 py-2 bg-rose-50 border border-rose-200 rounded text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors">Request Premature Closure</button>
          </div>

        </div>
      </div>
    </div>
  );
};
