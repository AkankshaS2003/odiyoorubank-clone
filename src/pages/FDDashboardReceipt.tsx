import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

export const FDDashboardReceipt: React.FC<{ fdData: any, setCurrentTab: (tab: string) => void }> = ({ fdData, setCurrentTab }) => {
  
  const handlePrint = () => {
    window.print();
  };

  if (!fdData) {
    return <div className="p-8 text-center">No receipt data found.</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white text-slate-800">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setCurrentTab('dashboard')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F4C81] text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-[#0F4C81]/20">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>

        {/* Paper Document */}
        <div className="bg-white p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-300 print:shadow-none print:border-none print:p-0 relative overflow-hidden">
          
          <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none">
            <img src="/logo-bg.png" alt="watermark" className="w-96 h-96" />
          </div>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-slate-200 pb-6 mb-8 print:border-black">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#0A315C] rounded-2xl flex items-center justify-center shrink-0">
                <img src="/logo-bg.png" alt="Odiyooru Souharda" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight print:text-black">Odiyooru Souharda</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest print:text-black">Cooperative Society Ltd.</p>
              </div>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 print:bg-transparent print:border-black">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 print:text-black">FD Closure Receipt</p>
                <p className="text-lg font-black text-slate-800 tracking-wider font-mono print:text-black">{fdData.fdNumber}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-black text-[#0F4C81] uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 print:text-black print:border-black">Account Details</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider print:text-black">Customer Name</p>
                <p className="text-sm font-bold text-slate-900 print:text-black">{fdData.userId?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider print:text-black">Customer ID / Email</p>
                <p className="text-sm font-bold text-slate-900 print:text-black">{fdData.userId?.customerId || fdData.userId?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-black text-[#0F4C81] uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 print:text-black print:border-black">Deposit Breakdown</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 print:bg-transparent print:border-black">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600 print:text-black">Principal Amount</span>
                  <span className="text-sm font-bold text-slate-900 font-mono print:text-black">₹{(fdData.principalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600 print:text-black">Interest Earned ({fdData.interestRate}% p.a.)</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono print:text-black">+ ₹{(fdData.interestEarned || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 border-dashed flex justify-between items-center print:border-black">
                  <span className="text-base font-black text-slate-800 uppercase print:text-black">Total Maturity Amount</span>
                  <span className="text-lg font-black text-[#0A315C] font-mono print:text-black">₹{(fdData.maturityAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-sm font-black text-[#0F4C81] uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 print:text-black print:border-black">Settlement Details</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider print:text-black">Settlement Mode</p>
                <p className="text-sm font-bold text-slate-900 print:text-black">{fdData.settlementDetails?.settlementMode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider print:text-black">Settlement Date</p>
                <p className="text-sm font-bold text-slate-900 print:text-black">{fdData.settlementDetails?.settlementDate ? new Date(fdData.settlementDetails.settlementDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider print:text-black">Status</p>
                <p className="text-sm font-bold text-slate-900 print:text-black">{fdData.status}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider print:text-black">Transaction Ref</p>
                <p className="text-xs font-mono font-bold text-slate-900 print:text-black">{fdData.settlementDetails?.transactionRef || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="mt-16 pt-8 border-t-2 border-slate-200 flex justify-between items-end print:border-black">
            <div className="text-center">
              <div className="w-40 border-b border-slate-400 mb-2 print:border-black"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider print:text-black">Customer Signature</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-slate-400 mb-2 print:border-black"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider print:text-black">Authorized Signatory</p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest print:text-black">
            This is a computer generated receipt and does not require a physical signature if issued digitally.
          </div>

        </div>
      </div>
    </div>
  );
};
