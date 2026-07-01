import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle, Clock, AlertTriangle, FileText, CreditCard } from 'lucide-react';
import api from '../services/api';

export const LoanDetailsPage = ({ appId, setCurrentTab }: { appId: string, setCurrentTab: (tab: string) => void }) => {
  const { user } = useAuth();
  const [loanData, setLoanData] = useState<any>(null);
  const [emis, setEmis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [signature, setSignature] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const fetchLoan = async () => {
    try {
      const res = await api.get(`/loans/details/${appId}`);
      if (res.data.success) {
        setLoanData(res.data.data.loan);
        setEmis(res.data.data.emis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [appId]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0F4C81';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const rect = canvas.getBoundingClientRect();
    let x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    let y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    let y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(false);
  };

  const handleAcceptOffer = async (accepted: boolean) => {
    if (accepted && !signature) {
      alert("Please provide your digital signature to accept the loan offer.");
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        action: accepted ? 'accept' : 'decline',
        digitalSignature: accepted ? canvasRef.current?.toDataURL() : undefined
      };
      const res = await api.post(`/loans/accept/${loanData._id}`, payload);
      if (res.data.success) {
        alert(`Loan offer ${accepted ? 'accepted' : 'declined'} successfully!`);
        fetchLoan();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayEmi = async (emiId: string) => {
    if (window.confirm("Pay this EMI from your linked Savings Account?")) {
      setActionLoading(true);
      try {
        const res = await api.post(`/loans/pay-emi/${emiId}`, { paymentMode: 'Transfer from Linked Savings Account' });
        if (res.data.success) {
          alert("EMI Paid Successfully!");
          fetchLoan();
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to pay EMI.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-[#0F4C81]">Loading Loan Details...</div>;
  }

  if (!loanData) {
    return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-[#0F4C81] mb-4">Loan Account not found</h2>
      <button onClick={() => setCurrentTab('dashboard')} className="px-6 py-2 bg-[#0F4C81] text-white rounded-lg">Return to Dashboard</button>
    </div>;
  }

  const renderStatusBanner = () => {
    switch (loanData.status) {
      case 'Pending Branch Verification':
        return <div className="bg-amber-100 text-amber-800 p-4 rounded-xl flex items-center gap-3 font-bold mb-6"><Clock className="w-6 h-6" /> Please visit your nearest branch with original documents to verify your loan application.</div>;
      case 'Branch Verification Completed':
        return <div className="bg-amber-100 text-amber-800 p-4 rounded-xl flex items-center gap-3 font-bold mb-6"><CheckCircle className="w-6 h-6" /> Branch verification completed. Your loan application is currently under review by our team.</div>;
      case 'Pending Review':
        return <div className="bg-amber-100 text-amber-800 p-4 rounded-xl flex items-center gap-3 font-bold mb-6"><Clock className="w-6 h-6" /> Your loan application is currently under review by our team.</div>;
      case 'Rejected':
        return <div className="bg-red-100 text-red-800 p-4 rounded-xl flex items-center gap-3 font-bold mb-6"><AlertTriangle className="w-6 h-6" /> Your loan application was rejected. Reason: {loanData.rejectionReason}</div>;
      case 'Sanctioned':
        return <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl flex items-center gap-3 font-bold mb-6"><CheckCircle className="w-6 h-6" /> Congratulations! Your loan has been sanctioned. Please review and accept the offer below.</div>;
      case 'Loan Accepted':
      case 'Ready for Disbursement':
        return <div className="bg-blue-100 text-blue-800 p-4 rounded-xl flex items-center gap-3 font-bold mb-6"><Clock className="w-6 h-6" /> You have accepted the loan offer. Waiting for final disbursement from the admin team.</div>;
      case 'Active Loan':
        return <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl flex items-center gap-3 font-bold mb-6"><CheckCircle className="w-6 h-6" /> Your loan is active. Please track your EMI schedule below.</div>;
      case 'Closed':
        return <div className="bg-slate-200 text-slate-800 p-4 rounded-xl flex items-center gap-3 font-bold mb-6"><CheckCircle className="w-6 h-6" /> This loan account has been successfully closed.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentTab('dashboard')} className="text-sm font-bold text-slate-500 hover:text-[#0F4C81]">← Back to Dashboard</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-sm font-bold hover:bg-[#0A315C] transition-colors">
            <Printer className="w-4 h-4" /> Print Details
          </button>
        </div>

        {renderStatusBanner()}

        <div className="bg-white p-8 shadow-lg border border-slate-200 rounded-3xl mb-8">
          <div className="flex justify-between items-start border-b-2 border-[#0F4C81] pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wide text-[#0F4C81]">{loanData.loanType}</h1>
              <p className="text-sm font-semibold text-slate-500">App ID: {loanData.loanApplicationId}</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold uppercase rounded-full">{loanData.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Requested Amount</p>
              <p className="font-bold text-slate-800">₹{loanData.requestedAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Requested Tenure</p>
              <p className="font-bold text-slate-800">{loanData.requestedTenure} Months</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Applied Date</p>
              <p className="font-bold text-slate-800">{new Date(loanData.appliedDate).toLocaleDateString()}</p>
            </div>
            {loanData.loanAccountNumber && (
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Loan Account No</p>
                <p className="font-black text-[#0F4C81]">{loanData.loanAccountNumber}</p>
              </div>
            )}
          </div>

          {(loanData.status === 'Sanctioned' || loanData.status === 'Loan Accepted' || loanData.status === 'Ready for Disbursement' || loanData.status === 'Active Loan' || loanData.status === 'Closed') && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-black uppercase text-[#0F4C81] mb-4 flex items-center gap-2"><FileText className="w-4 h-4"/> Sanction & Offer Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                <div><span className="text-slate-500 text-xs block">Sanctioned Amount</span><span className="font-black text-slate-900">₹{loanData.sanctionedAmount?.toLocaleString('en-IN')}</span></div>
                <div><span className="text-slate-500 text-xs block">Interest Rate</span><span className="font-black text-slate-900">{loanData.interestRate}% p.a.</span></div>
                <div><span className="text-slate-500 text-xs block">Tenure</span><span className="font-black text-slate-900">{loanData.loanTenure} Months</span></div>
                <div><span className="text-slate-500 text-xs block">Processing Fee</span><span className="font-black text-slate-900">₹{loanData.processingFee?.toLocaleString('en-IN')}</span></div>
                <div><span className="text-slate-500 text-xs block">Monthly EMI</span><span className="font-black text-[#0F4C81] text-lg">₹{loanData.emiAmount?.toLocaleString('en-IN')}</span></div>
                <div><span className="text-slate-500 text-xs block">Total Interest</span><span className="font-black text-slate-900">₹{loanData.totalInterest?.toLocaleString('en-IN')}</span></div>
                <div><span className="text-slate-500 text-xs block">Total Repayment</span><span className="font-black text-slate-900">₹{loanData.totalRepaymentAmount?.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          )}

          {loanData.status === 'Sanctioned' && (
            <div className="border border-[#0F4C81] rounded-2xl p-6 bg-blue-50/30">
              <h3 className="text-sm font-black uppercase text-[#0F4C81] mb-4">Accept Loan Offer</h3>
              <p className="text-xs text-slate-600 mb-4 font-semibold italic">I have read the terms and conditions and I accept the loan offer details presented above. I authorize Odiyooru Souharda to process this loan and deduct EMIs from my linked savings account.</p>
              
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Provide Digital Signature</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white">
                    <canvas ref={canvasRef} width={300} height={100} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="cursor-crosshair block" />
                  </div>
                  <button onClick={clearSignature} className="text-xs font-bold text-slate-500 underline hover:text-[#0F4C81]">Clear Signature</button>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => handleAcceptOffer(true)} disabled={actionLoading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg transition-colors">Accept Offer & Sign</button>
                <button onClick={() => handleAcceptOffer(false)} disabled={actionLoading} className="px-6 py-2.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl font-bold text-sm transition-colors">Decline Offer</button>
              </div>
            </div>
          )}

          {(loanData.status === 'Active Loan' || loanData.status === 'Closed') && emis.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4 mt-8">
                <h3 className="text-sm font-black uppercase text-[#0F4C81] flex items-center gap-2"><CreditCard className="w-4 h-4"/> Repayment Schedule</h3>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Outstanding Balance</span>
                  <span className="text-lg font-black text-red-600">₹{loanData.outstandingBalance?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <th className="p-3 font-bold uppercase">EMI No</th>
                      <th className="p-3 font-bold uppercase">Due Date</th>
                      <th className="p-3 font-bold uppercase">Amount</th>
                      <th className="p-3 font-bold uppercase">Principal</th>
                      <th className="p-3 font-bold uppercase">Interest</th>
                      <th className="p-3 font-bold uppercase">Penalty</th>
                      <th className="p-3 font-bold uppercase">Status</th>
                      <th className="p-3 font-bold uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emis.map((emi: any, idx: number) => (
                      <tr key={emi._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="p-3 font-bold">#{emi.emiNumber}</td>
                        <td className="p-3 font-semibold">{new Date(emi.dueDate).toLocaleDateString()}</td>
                        <td className="p-3 font-black text-[#0F4C81]">₹{emi.emiAmount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-slate-600">₹{emi.principalComponent.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-slate-600">₹{emi.interestComponent.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-red-500 font-bold">₹{emi.latePenalty}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${emi.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : emi.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {emi.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          {emi.paymentStatus !== 'Paid' && loanData.status === 'Active Loan' && (
                            <button onClick={() => handlePayEmi(emi._id)} disabled={actionLoading} className="px-3 py-1.5 bg-[#0F4C81] text-white rounded text-[10px] font-bold hover:bg-[#0A315C] transition-colors">Pay Now</button>
                          )}
                          {emi.paymentStatus === 'Paid' && <span className="text-[10px] font-bold text-slate-400">Paid on {new Date(emi.paidDate).toLocaleDateString()}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
