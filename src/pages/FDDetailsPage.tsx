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
    element.classList.remove('hidden');
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FD_Certificate_${data?.fd?.fdNumber || 'Doc'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF');
    } finally {
      element.classList.add('hidden');
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
            className="p-2 bg-white border border-slate-200 text-slate-500 rounded-full hover:bg-slate-50"
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
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          {fd.status === 'Active' && (
            <button 
              onClick={handleDownloadPdf}
              className="flex-1 md:flex-none px-6 py-3 bg-[#0F4C81] text-white hover:bg-blue-900 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8 print:space-y-4">
        
        {/* SECTION 1: COMPLETE APPLICATION DETAILS */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 print:rounded-none print:border-none print:shadow-none print:p-0">
          <h2 className="text-lg font-black text-[#0F4C81] uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-5 h-5" /> Complete FD Application Details
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">Customer Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                <LabelValue label="Customer ID" value={user.customerId} />
                <LabelValue label="Customer Name" value={user.fullName} />
                <LabelValue label="CIF Number" value={user.customerId} />
                <LabelValue label="Branch Name" value="Main Branch" />
                <LabelValue label="Account Status" value={user.kycStatus === 'Verified' ? 'Active' : 'Pending KYC'} />
                <LabelValue label="Application No" value={application._id ? application._id.toString().substring(0, 10).toUpperCase() : 'N/A'} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">Personal Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                <LabelValue label="Full Name" value={formData.fullName} />
                <LabelValue label="Father/Husband Name" value={formData.fatherHusbandName} />
                <LabelValue label="Date of Birth" value={formData.dob} />
                <LabelValue label="Gender" value={formData.gender} />
                <LabelValue label="Marital Status" value={formData.maritalStatus} />
                <LabelValue label="Nationality" value={formData.nationality} />
                <LabelValue label="Aadhaar Number" value={formData.aadhaar} />
                <LabelValue label="PAN Number" value={formData.pan} />
                <LabelValue label="Mobile Number" value={formData.mobile} />
                <LabelValue label="Email Address" value={formData.email} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                <LabelValue label="Address Line 1" value={formData.address1} />
                <LabelValue label="Address Line 2" value={formData.address2} />
                <LabelValue label="Village/City" value={formData.villageCity} />
                <LabelValue label="Taluk" value={formData.taluk} />
                <LabelValue label="District" value={formData.district} />
                <LabelValue label="State" value={formData.state} />
                <LabelValue label="PIN Code" value={formData.pinCode} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">Occupation Details</h3>
                <div className="grid grid-cols-2 gap-6 px-2">
                  <LabelValue label="Occupation" value={formData.occupation} />
                  <LabelValue label="Employer Name" value={formData.employerName} />
                  <LabelValue label="Monthly Income" value={formData.monthlyIncome} />
                  <LabelValue label="Annual Income" value={formData.annualIncome} />
                  <LabelValue label="Source of Income" value={formData.sourceOfIncome} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">Nominee Details</h3>
                <div className="grid grid-cols-2 gap-6 px-2">
                  <LabelValue label="Nominee Name" value={fd.nomineeDetails?.name || formData.nomineeName} />
                  <LabelValue label="Relationship" value={fd.nomineeDetails?.relation || formData.nomineeRelationship} />
                  <LabelValue label="Date of Birth" value={formData.nomineeDob} />
                  <LabelValue label="Mobile Number" value={formData.nomineeMobile} />
                  <LabelValue label="Address" value={formData.nomineeAddress} />
                  <LabelValue label="Nominee Percentage" value={formData.nomineePercentage ? `${formData.nomineePercentage}%` : '100%'} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded-lg inline-block px-4">KYC Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 px-2">
                <LabelValue label="Aadhaar Verification" value={user.isKycVerified ? 'Verified' : 'Pending'} />
                <LabelValue label="PAN Verification" value={user.isKycVerified ? 'Verified' : 'Pending'} />
                <LabelValue label="Face Verification" value={user.isKycVerified ? 'Verified' : 'Pending'} />
                <LabelValue label="KYC Status" value={user.kycStatus} />
                <LabelValue label="Verification Date" value={user.isKycVerified ? new Date(application.processedAt || fd.depositDate).toLocaleDateString() : 'N/A'} />
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
              <LabelValue label="Interest Type" value={fd.compoundingFrequency || 'Quarterly'} />
              <LabelValue label="Tenure" value={`${fd.tenureMonths} Months`} />
              <LabelValue label="Maturity Date" value={new Date(fd.maturityDate).toLocaleDateString()} />
              <LabelValue label="Maturity Amount" value={`₹${fd.maturityAmount?.toLocaleString('en-IN')}`} />
              <LabelValue label="Interest Earned" value={`₹${fd.interestEarned?.toLocaleString('en-IN')}`} />
              <LabelValue label="Auto Renewal" value={fd.autoRenewal ? 'Yes' : 'No'} />
              <LabelValue label="Maturity Instruction" value={formData.interestPayout || 'Credit to Account'} />
              <LabelValue label="FD Status" value={fd.status} />
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 print:rounded-none print:border-none print:shadow-none print:p-0">
            <h2 className="text-lg font-black text-[#0F4C81] uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <FileText className="w-5 h-5" /> Transaction Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <LabelValue label="Transaction ID" value={mainTxn.referenceNumber || 'N/A'} />
              <LabelValue label="Reference Number" value={fd.fdNumber} />
              <LabelValue label="Payment Date" value={mainTxn.date ? new Date(mainTxn.date).toLocaleDateString() : new Date(fd.depositDate).toLocaleDateString()} />
              <LabelValue label="Payment Time" value={mainTxn.date ? new Date(mainTxn.date).toLocaleTimeString() : new Date(fd.depositDate).toLocaleTimeString()} />
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
          <section className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-slate-200 mt-8 relative overflow-hidden print:p-0 print:border-none print:shadow-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0F4C81]/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none"></div>
            
            <div ref={certificateRef} className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-[#0F4C81] pb-6 mb-8 gap-4 text-center md:text-left">
                <div className="flex items-center gap-4">
                  <img src="/logo-bg.png" alt="Odiyooru Souharda" className="w-20 h-20 object-contain" />
                  <div>
                    <h1 className="text-2xl font-black text-[#0F4C81] uppercase tracking-tight">Odiyooru Souharda</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cooperative Society Ltd</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Fixed Deposit Certificate</h2>
                  <p className="text-sm font-bold text-slate-500 mt-1">CERTIFICATE NO: <span className="text-slate-800">{fd.fdNumber}</span></p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm leading-relaxed text-slate-700 font-medium text-justify">
                  This is to certify that the below-mentioned customer has invested the specified amount under the Fixed Deposit Scheme of Odiyooru Souharda Cooperative Society Ltd. The deposit shall earn interest according to the applicable rate and shall mature on the maturity date mentioned below.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-12">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {[
                      ['Certificate Number', fd.fdNumber, 'Deposit Date', new Date(fd.depositDate).toLocaleDateString()],
                      ['Customer Name', user.fullName, 'Interest Rate', `${fd.interestRate}% p.a.`],
                      ['Customer ID', user.customerId, 'Interest Type', fd.compoundingFrequency || 'Quarterly'],
                      ['FD Account Number', fd.fdNumber, 'Tenure', `${fd.tenureMonths} Months`],
                      ['Savings Account', formData.savingsAccount || 'Linked', 'Maturity Date', new Date(fd.maturityDate).toLocaleDateString()],
                      ['Deposit Amount', `₹${fd.principalAmount?.toLocaleString('en-IN')}`, 'Maturity Amount', `₹${fd.maturityAmount?.toLocaleString('en-IN')}`],
                      ['Nominee Name', fd.nomineeDetails?.name || formData.nomineeName || 'N/A', 'Maturity Instr.', formData.interestPayout || 'Credit to Account'],
                      ['Branch Name', 'Main Branch', 'Issue Date', new Date(fd.depositDate).toLocaleDateString()]
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase bg-white/50 w-1/4">{row[0]}</th>
                        <td className="py-3 px-4 text-sm font-bold text-slate-900 w-1/4 border-r border-slate-100">{row[1]}</td>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase bg-white/50 w-1/4">{row[2]}</th>
                        <td className="py-3 px-4 text-sm font-bold text-slate-900 w-1/4">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end mt-16 pt-8 border-t border-slate-100">
                <div className="text-center w-48">
                  {signature ? (
                    <img src={signature} alt="Customer Signature" className="h-12 object-contain mx-auto mb-2" />
                  ) : (
                    <div className="h-12 border-b border-dashed border-slate-300 mb-2"></div>
                  )}
                  <p className="text-xs font-bold text-slate-800 uppercase border-t border-slate-200 pt-2">Customer Signature</p>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-indigo-200 flex items-center justify-center opacity-30 mx-auto mb-2 relative">
                    <div className="absolute inset-2 border-2 border-dashed border-indigo-200 rounded-full flex items-center justify-center text-[8px] font-bold text-indigo-800 rotate-[-15deg] uppercase text-center leading-tight">
                      Odiyooru<br/>Souharda<br/>Seal
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-800 uppercase pt-2">Official Bank Seal</p>
                </div>

                <div className="text-center w-48">
                  <div className="h-12 flex items-end justify-center mb-2">
                    <span className="font-['Brush_Script_MT',cursive] text-2xl text-blue-900">System Approved</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 uppercase border-t border-slate-200 pt-2">Authorized Signatory</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-400 font-medium italic">
                  This certificate is computer generated and is issued subject to the rules and regulations of Odiyooru Souharda Cooperative Society Ltd.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Hidden PDF Clone Element (Used by html2canvas so it renders perfectly without UI scrollbars) */}
      <div ref={pdfRef} className="hidden w-[800px] p-8 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center mb-8 border-b-4 border-[#0F4C81] pb-6">
           <img src="/logo-bg.png" alt="Logo" className="h-20 mx-auto mb-4" />
           <h1 className="text-3xl font-black text-[#0F4C81] uppercase tracking-tighter">Odiyooru Souharda</h1>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Cooperative Society Ltd</p>
           <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest mt-6">Fixed Deposit Certificate</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-sm leading-relaxed text-slate-800 font-medium text-justify">
            This is to certify that the below-mentioned customer has invested the specified amount under the Fixed Deposit Scheme of Odiyooru Souharda Cooperative Society Ltd. The deposit shall earn interest according to the applicable rate and shall mature on the maturity date mentioned below.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-300 rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <tbody>
              {[
                ['Certificate Number', fd?.fdNumber, 'Deposit Date', fd?.depositDate ? new Date(fd.depositDate).toLocaleDateString() : ''],
                ['Customer Name', user?.fullName, 'Interest Rate', `${fd?.interestRate}% p.a.`],
                ['Customer ID', user?.customerId, 'Interest Type', fd?.compoundingFrequency || 'Quarterly'],
                ['FD Account Number', fd?.fdNumber, 'Tenure', `${fd?.tenureMonths} Months`],
                ['Savings Account', formData?.savingsAccount || 'Linked', 'Maturity Date', fd?.maturityDate ? new Date(fd.maturityDate).toLocaleDateString() : ''],
                ['Deposit Amount', `Rs. ${fd?.principalAmount?.toLocaleString('en-IN')}`, 'Maturity Amount', `Rs. ${fd?.maturityAmount?.toLocaleString('en-IN')}`],
                ['Nominee Name', fd?.nomineeDetails?.name || formData?.nomineeName || 'N/A', 'Maturity Instr.', formData?.interestPayout || 'Credit to Account'],
                ['Branch Name', 'Main Branch', 'Issue Date', fd?.depositDate ? new Date(fd.depositDate).toLocaleDateString() : '']
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-200 last:border-0">
                  <th className="py-2 px-3 text-xs font-bold text-slate-600 bg-slate-100 w-1/4 border-r border-slate-200">{row[0]}</th>
                  <td className="py-2 px-3 text-sm font-bold text-slate-900 w-1/4 border-r border-slate-200">{row[1]}</td>
                  <th className="py-2 px-3 text-xs font-bold text-slate-600 bg-slate-100 w-1/4 border-r border-slate-200">{row[2]}</th>
                  <td className="py-2 px-3 text-sm font-bold text-slate-900 w-1/4">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-800 bg-slate-100 p-2 border border-slate-300 rounded-t-lg">Personal Details</h3>
          <div className="border border-t-0 border-slate-300 rounded-b-lg p-4 grid grid-cols-2 gap-4">
            <div className="text-xs"><span className="font-bold text-slate-600">Father/Husband Name:</span> {formData?.fatherHusbandName || 'N/A'}</div>
            <div className="text-xs"><span className="font-bold text-slate-600">Date of Birth:</span> {formData?.dob || 'N/A'}</div>
            <div className="text-xs"><span className="font-bold text-slate-600">Aadhaar Number:</span> {formData?.aadhaar || 'N/A'}</div>
            <div className="text-xs"><span className="font-bold text-slate-600">PAN Number:</span> {formData?.pan || 'N/A'}</div>
            <div className="text-xs"><span className="font-bold text-slate-600">Address:</span> {formData?.address1}, {formData?.villageCity}, {formData?.state} - {formData?.pinCode}</div>
            <div className="text-xs"><span className="font-bold text-slate-600">Occupation:</span> {formData?.occupation || 'N/A'}</div>
          </div>
        </div>

        <div className="flex justify-between items-end mt-24 pt-8">
          <div className="text-center w-48">
            {signature ? (
              <img src={signature} alt="Customer Signature" className="h-12 object-contain mx-auto mb-2" />
            ) : (
              <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
            )}
            <p className="text-xs font-bold text-slate-800 uppercase border-t border-slate-400 pt-2">Customer Signature</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-2 border-indigo-200 flex items-center justify-center opacity-30 mx-auto mb-2 relative">
              <div className="absolute inset-2 border-2 border-dashed border-indigo-200 rounded-full flex items-center justify-center text-[8px] font-bold text-indigo-800 rotate-[-15deg] uppercase text-center leading-tight">
                Odiyooru<br/>Souharda<br/>Seal
              </div>
            </div>
            <p className="text-xs font-bold text-slate-800 uppercase pt-2">Official Bank Seal</p>
          </div>
          <div className="text-center w-48">
            <div className="h-12 flex items-end justify-center mb-2">
              <span className="font-['Brush_Script_MT',cursive] text-2xl text-blue-900">System Approved</span>
            </div>
            <p className="text-xs font-bold text-slate-800 uppercase border-t border-slate-400 pt-2">Authorized Signatory</p>
          </div>
        </div>

        <div className="mt-12 text-center border-t border-slate-300 pt-4">
          <p className="text-[10px] text-slate-500 font-medium italic">
            This certificate is computer generated and is issued subject to the rules and regulations of Odiyooru Souharda Cooperative Society Ltd.
          </p>
        </div>
      </div>
    </div>
  );
};
