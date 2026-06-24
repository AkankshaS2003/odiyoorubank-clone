import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer } from 'lucide-react';

export const LoanDetailsPage = ({ appId, setCurrentTab }: { appId: string, setCurrentTab: (tab: string) => void }) => {
  const { getUserServiceApplications, systemSettings, user } = useAuth();
  const [loanData, setLoanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const apps = await getUserServiceApplications();
        const found = apps.find(a => a._id === appId);
        if (found) {
          setLoanData(found);
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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-[#0F4C81]">Loading Loan Details...</div>;
  }

  if (!loanData) {
    return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-[#0F4C81] mb-4">Loan Account not found</h2>
      <button onClick={() => setCurrentTab('dashboard')} className="px-6 py-2 bg-[#0F4C81] text-white rounded-lg">Return to Dashboard</button>
    </div>;
  }

  const transactionRef = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
  const receiptNumber = `LN-RCPT-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Extract loan amount safely
  let principalAmount = 0;
  const parseAmt = (val: any) => {
    if (!val) return null;
    const parsed = parseInt(String(val).replace(/,/g, ''), 10);
    return isNaN(parsed) ? null : parsed;
  };
  principalAmount = parseAmt(loanData.formData?.requestedAmount) || 
                    parseAmt(loanData.formData?.loanAmountRequired) || 
                    parseAmt(loanData.formData?.amount) || 
                    parseAmt(loanData.formData?.loanAmount) || 0;

  // Base logic for rates and tenure
  let interestRate = 10.50; // default for loans
  if (loanData.applicationType.includes('Personal')) interestRate = systemSettings?.personalLoanRate || 12.5;
  if (loanData.applicationType.includes('Educational')) interestRate = systemSettings?.educationLoanRate || 10.5;
  if (loanData.applicationType.includes('Vehicle')) interestRate = systemSettings?.vehicleLoanRate || 9.5;
  if (loanData.applicationType.includes('Mortgage')) interestRate = systemSettings?.mortgageLoanRate || 8.5;
  if (loanData.applicationType.includes('Gold')) interestRate = systemSettings?.goldLoanRate || 11.5;

  // Extract tenure safely
  let tenureMonths = 12;
  const parseTenure = (val: any) => {
    if (!val) return null;
    const strVal = String(val);
    const match = strVal.match(/(\d+)/);
    if (!match) return null;
    let num = parseInt(match[1], 10);
    if (strVal.toLowerCase().includes('year') || strVal.toLowerCase().includes('yr')) {
      num = num * 12;
    }
    return num;
  };
  
  const t1 = parseTenure(loanData.formData?.loanTenure);
  const t2 = parseTenure(loanData.formData?.tenure);
  const t3 = parseTenure(loanData.formData?.courseDuration);
  
  if (t1) tenureMonths = t1;
  else if (t2) tenureMonths = t2;
  else if (t3) tenureMonths = t3 * 12; // course duration is usually purely in years

  const validDateString = loanData.processedAt || loanData.submittedAt;
  const startDateObj = validDateString ? new Date(validDateString) : new Date();
  const startDateStr = startDateObj.toLocaleDateString('en-IN');
  
  const endDateObj = new Date(startDateObj);
  endDateObj.setMonth(endDateObj.getMonth() + tenureMonths);
  const maturityDateStr = endDateObj.toLocaleDateString('en-IN');
  
  const firstEmiDate = new Date(startDateObj);
  firstEmiDate.setMonth(firstEmiDate.getMonth() + 1);

  // EMI calculation
  const r = interestRate / 12 / 100;
  const n = tenureMonths;
  const emi = Math.round((principalAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) || 0;
  const totalAmountPayable = emi * n;

  // Prioritize DB user details
  const userFromDb = loanData.userId && typeof loanData.userId === 'object' ? loanData.userId : user;

  const applicantName = loanData.formData?.fullName || userFromDb?.fullName || 'N/A';
  const emailAddress = loanData.formData?.email || userFromDb?.email || 'N/A';
  const mobileNumber = loanData.formData?.mobile || userFromDb?.phone || 'N/A';
  const panNumber = loanData.formData?.pan || userFromDb?.panNumber || 'N/A';
  const aadharNumber = loanData.formData?.aadhar || userFromDb?.aadharNumber || 'N/A';
  const customerId = loanData.formData?.customerId || userFromDb?.customerId || 'N/A';
  const disbursementAccount = loanData.formData?.accNumber || userFromDb?.accountNumber || 'N/A';

  return (
    <div className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white text-slate-900">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button onClick={() => setCurrentTab('dashboard')} className="text-sm font-bold text-slate-500 hover:text-[#0F4C81]">← Back to Dashboard</button>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] text-white rounded-lg text-sm font-bold hover:bg-[#0A315C] transition-colors shadow-sm">
              <Printer className="w-4 h-4" /> Print Document
            </button>
          </div>
        </div>

        {/* Professional Document Container */}
        <div className="bg-white p-10 md:p-14 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 relative">
          
          {/* WATERMARK */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
            <img src="/logo-bg.png" alt="Watermark" className="w-[30rem] h-[30rem] object-contain" />
          </div>

          <div className="relative z-10">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end border-b-2 border-[#0F4C81] pb-4 mb-6">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <img src="/logo-bg.png" alt="Logo" className="w-16 h-16 object-contain" />
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wide text-[#0F4C81]">Odiyooru Souharda Cooperative Society Ltd</h1>
                  <p className="text-sm font-semibold text-slate-700">Head Office: Main Branch</p>
                  <p className="text-xs text-slate-500">Reg No: DRP:S.9:88:RGN:520:2010-11</p>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-slate-700"><strong>Date:</strong> {startDateStr}</p>
                <p className="text-sm text-slate-700"><strong>Receipt No:</strong> {receiptNumber}</p>
              </div>
            </div>

            <h3 className="text-sm font-black uppercase bg-[#0F4C81]/10 text-[#0F4C81] border border-[#0F4C81] p-1.5 px-3 mb-0">1. Applicant Details</h3>
            <table className="w-full border-collapse border border-[#0F4C81] text-sm mb-6">
              <tbody>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold w-1/4 bg-slate-50 text-slate-700">Applicant Name</td>
                  <td className="border border-[#0F4C81] p-2 w-1/4 font-semibold text-slate-900">{applicantName}</td>
                  <td className="border border-[#0F4C81] p-2 font-bold w-1/4 bg-slate-50 text-slate-700">Customer ID</td>
                  <td className="border border-[#0F4C81] p-2 w-1/4 font-mono font-bold text-slate-900">{customerId}</td>
                </tr>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Mobile Number</td>
                  <td className="border border-[#0F4C81] p-2 font-mono text-slate-900">{mobileNumber}</td>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Email Address</td>
                  <td className="border border-[#0F4C81] p-2 text-slate-900">{emailAddress}</td>
                </tr>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">PAN Number</td>
                  <td className="border border-[#0F4C81] p-2 font-mono uppercase text-slate-900">{panNumber}</td>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Aadhaar Number</td>
                  <td className="border border-[#0F4C81] p-2 font-mono text-slate-900">{aadharNumber}</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-sm font-black uppercase bg-[#0F4C81]/10 text-[#0F4C81] border border-[#0F4C81] p-1.5 px-3 mb-0 border-t-0">2. Loan & Disbursement Details</h3>
            <table className="w-full border-collapse border border-[#0F4C81] text-sm mb-6">
              <tbody>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold w-1/4 bg-slate-50 text-slate-700">Application No</td>
                  <td className="border border-[#0F4C81] p-2 w-1/4 font-mono text-slate-900">{loanData.formData?.applicationNo || loanData.applicationNo || 'N/A'}</td>
                  <td className="border border-[#0F4C81] p-2 font-bold w-1/4 bg-slate-50 text-slate-700">Disbursed To A/C</td>
                  <td className="border border-[#0F4C81] p-2 w-1/4 font-mono font-bold text-slate-900">{disbursementAccount}</td>
                </tr>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Loan Type</td>
                  <td className="border border-[#0F4C81] p-2 font-black uppercase text-[#0F4C81]">{loanData.applicationType}</td>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Principal Amount</td>
                  <td className="border border-[#0F4C81] p-2 font-black text-base text-slate-900">₹{principalAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Interest Rate</td>
                  <td className="border border-[#0F4C81] p-2 font-semibold text-slate-900">{interestRate}% p.a.</td>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Tenure</td>
                  <td className="border border-[#0F4C81] p-2 font-semibold text-slate-900">
                    {tenureMonths >= 12 && tenureMonths % 12 === 0 ? `${tenureMonths / 12} Year${tenureMonths / 12 > 1 ? 's' : ''}` : `${tenureMonths} Months`}
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-sm font-black uppercase bg-[#0F4C81]/10 text-[#0F4C81] border border-[#0F4C81] p-1.5 px-3 mb-0 border-t-0">3. Repayment Schedule</h3>
            <table className="w-full border-collapse border border-[#0F4C81] text-sm mb-6">
              <tbody>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold w-1/4 bg-slate-50 text-slate-700">Estimated EMI</td>
                  <td className="border border-[#0F4C81] p-2 w-1/4 font-black text-slate-900">₹{emi.toLocaleString('en-IN')} / month</td>
                  <td className="border border-[#0F4C81] p-2 font-bold w-1/4 bg-slate-50 text-slate-700">Total Payable</td>
                  <td className="border border-[#0F4C81] p-2 w-1/4 font-black text-slate-900">₹{totalAmountPayable.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">First EMI Date</td>
                  <td className="border border-[#0F4C81] p-2 font-semibold text-slate-900">{firstEmiDate.toLocaleDateString('en-IN')}</td>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Maturity Date</td>
                  <td className="border border-[#0F4C81] p-2 font-semibold text-slate-900">{maturityDateStr}</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-sm font-black uppercase bg-[#0F4C81]/10 text-[#0F4C81] border border-[#0F4C81] p-1.5 px-3 mb-0 border-t-0">4. Nominee Details</h3>
            <table className="w-full border-collapse border border-[#0F4C81] text-sm mb-10">
              <tbody>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold w-1/4 bg-slate-50 text-slate-700">Nominee Name</td>
                  <td className="border border-[#0F4C81] p-2 w-1/4 font-semibold text-slate-900">{loanData.formData?.nomName || loanData.formData?.nomineeName || 'N/A'}</td>
                  <td className="border border-[#0F4C81] p-2 font-bold w-1/4 bg-slate-50 text-slate-700">Relationship</td>
                  <td className="border border-[#0F4C81] p-2 w-1/4 font-semibold text-slate-900">{loanData.formData?.nomRel || loanData.formData?.nomineeRelationship || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Nominee Mobile</td>
                  <td className="border border-[#0F4C81] p-2 font-mono text-slate-900">{loanData.formData?.nomMobile || loanData.formData?.nomineeMobile || 'N/A'}</td>
                  <td className="border border-[#0F4C81] p-2 font-bold bg-slate-50 text-slate-700">Nominee Address</td>
                  <td className="border border-[#0F4C81] p-2 text-slate-900">{loanData.formData?.nomAddress || loanData.formData?.nomineeAddress || 'N/A'}</td>
                </tr>
              </tbody>
            </table>

            {/* SIGNATURES */}
            <div className="flex justify-between items-end mt-16 text-center print:mt-16">
              <div>
                <div className="h-16 mb-2 flex items-end justify-center">
                  {loanData.images?.studentSignature || loanData.images?.applicantSignature ? (
                    <img src={loanData.images.studentSignature || loanData.images.applicantSignature} alt="Applicant Signature" className="max-h-14 object-contain" />
                  ) : (
                    <span className="italic text-slate-400 text-sm">e-Signed by Applicant</span>
                  )}
                </div>
                <div className="border-t-2 border-[#0F4C81] w-48 mx-auto pt-1.5 font-bold text-sm uppercase text-[#0F4C81]">Applicant Signature</div>
              </div>
              
              <div>
                <div className="h-16 mb-2 flex flex-col items-center justify-end relative">
                  <img src="/logo-bg.png" className="w-12 h-12 opacity-20 absolute top-0" alt="Seal" />
                  <span className="font-bold relative z-10 text-sm uppercase text-[#0F4C81]">System Approved</span>
                  <span className="font-mono text-[10px] relative z-10 text-slate-500">{transactionRef}</span>
                </div>
                <div className="border-t-2 border-[#0F4C81] w-48 mx-auto pt-1.5 font-bold text-sm uppercase text-[#0F4C81]">Authorized Signatory</div>
              </div>
            </div>

            <div className="mt-14 border-t border-slate-200 pt-4 text-[10px] text-justify text-slate-500">
              <p><strong>Disclaimer:</strong> This is a computer-generated document and is valid without a physical signature if digitally approved and e-Signed. 
              The loan is sanctioned subject to the bylaws and policies of Odiyooru Souharda Cooperative Society Ltd. 
              Interest rates and EMI schedules are subject to change as per society regulations. 
              For any queries, please contact your home branch.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
