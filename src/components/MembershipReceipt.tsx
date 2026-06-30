import React from 'react';
import { Download, Printer } from 'lucide-react';

interface ReceiptProps {
  data: {
    receiptNo: string;
    customerName: string;
    customerId: string;
    savingsAccount: string;
    membershipFee: number;
    totalPaid: number;
    transactionId: string;
    paymentDate: string;
  };
}

export const MembershipReceipt: React.FC<ReceiptProps> = ({ data }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Receipt downloaded successfully!"); // In reality, implement jsPDF or window.print for PDF
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden printable-receipt">
      
      {/* Receipt Header */}
      <div className="bg-[#0F4C81] text-white p-6 border-b-[6px] border-[#ED7F1E] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/logo-bg.png" alt="Logo" className="w-14 h-14 object-contain" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest">Odiyooru Souharda</h2>
            <p className="text-xs font-bold tracking-widest opacity-90 uppercase">Cooperative Society Ltd.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Membership Fee Receipt</p>
          <p className="font-mono text-sm font-bold">{data.receiptNo}</p>
        </div>
      </div>

      {/* Receipt Body */}
      <div className="p-8 pb-4">
        <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Date & Time</p>
            <p className="font-bold text-slate-800">{new Date(data.paymentDate).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Transaction ID</p>
            <p className="font-mono font-bold text-slate-800">{data.transactionId}</p>
          </div>
          
          <div className="col-span-2 border-t border-slate-100 my-2"></div>

          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Customer Name</p>
            <p className="font-bold text-slate-800 text-base">{data.customerName}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Customer ID</p>
            <p className="font-mono font-bold text-slate-800">{data.customerId}</p>
          </div>

          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Debited From</p>
            <p className="font-mono font-bold text-slate-800">{data.savingsAccount} (Savings)</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Status</p>
            <p className="font-bold text-emerald-600 uppercase tracking-widest">Successful</p>
          </div>

          <div className="col-span-2 border-t border-slate-100 my-2"></div>

          <div className="col-span-2 flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-600 uppercase tracking-wider">Membership Fee</span>
            <span className="font-black text-slate-800 text-xl">₹{data.membershipFee.toLocaleString('en-IN')}</span>
          </div>
          
          <div className="col-span-2 flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="font-black text-emerald-800 uppercase tracking-wider">Total Amount Paid</span>
            <span className="font-black text-emerald-600 text-2xl">₹{data.totalPaid.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 flex justify-between items-end border-t border-dashed border-slate-200 pt-8">
          <div className="text-center w-32">
            <div className="border-b border-slate-300 h-10 w-full mb-2"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer Sign</p>
          </div>
          
          {/* Bank Seal Area */}
          <div className="w-24 h-24 border-2 border-blue-100 rounded-full flex items-center justify-center -rotate-12 opacity-50">
            <div className="text-center">
              <p className="text-[8px] font-black text-blue-800 uppercase tracking-tighter leading-tight">Odiyooru<br/>Souharda</p>
              <p className="text-[6px] font-bold text-blue-600 mt-1 uppercase">Paid Seal</p>
            </div>
          </div>

          <div className="text-center w-32">
            <div className="border-b border-slate-300 h-10 w-full mb-2 flex items-end justify-center pb-1">
              <span className="font-caveat text-xl text-slate-700">Digital Sign</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized Sign</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden in print) */}
      <div className="bg-slate-50 p-4 flex gap-4 justify-end border-t border-slate-200 no-print">
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        <button 
          onClick={handleDownload}
          className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-md"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          .printable-receipt, .printable-receipt * { visibility: visible; }
          .printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};
