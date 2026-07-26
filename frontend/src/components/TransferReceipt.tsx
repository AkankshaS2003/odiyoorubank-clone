import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';

interface TransferReceiptProps {
  data: any;
}

export const TransferReceipt: React.FC<TransferReceiptProps> = ({ data }) => {
  return (
    <div id="transfer-receipt" className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden shadow-sm w-full mx-auto">
      {/* Background Bank Logo / Seal */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
        <ShieldCheck className="w-96 h-96" />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-8 pb-8 border-b border-dashed border-slate-300">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Transaction Successful</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Odiyooru Souharda Cooperative Society Ltd</p>
          <div className="mt-4 inline-block px-4 py-1.5 bg-slate-100 rounded-lg">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Ref No:</span>
            <span className="text-sm font-mono font-bold text-slate-800">{data.referenceNumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
            <p className="text-sm font-bold text-slate-800">{new Date(data.date).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transfer Type</p>
            <p className="text-sm font-bold text-primary">{data.transferType}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From Account</p>
            <p className="text-sm font-mono font-bold text-slate-800">{data.fromAccount}</p>
          </div>
          {data.toAccount && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To Account</p>
              <p className="text-sm font-mono font-bold text-slate-800">{data.toAccount}</p>
            </div>
          )}
          {data.beneficiaryName && (
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Beneficiary Name</p>
              <p className="text-sm font-bold text-slate-800">{data.beneficiaryName}</p>
            </div>
          )}
          {data.bankName && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Name / IFSC</p>
              <p className="text-sm font-bold text-slate-800">{data.bankName} ({data.ifscCode})</p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 flex justify-between items-center border border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
            <p className="text-3xl font-black text-slate-800">₹{Number(data.amount).toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-lg">
              {data.status}
            </span>
          </div>
        </div>

        {data.remarks && (
          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remarks</p>
            <p className="text-sm text-slate-600 font-medium italic">"{data.remarks}"</p>
          </div>
        )}

        <div className="flex justify-between items-end pt-8 border-t border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Digital Bank Seal</p>
            <div className="mt-2 flex items-center gap-2 text-primary opacity-80">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Verified Transfer</span>
            </div>
          </div>
          <div className="text-center">
            <div className="w-32 h-10 border-b border-slate-300 mb-2 bg-[url('https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg')] bg-contain bg-no-repeat bg-center opacity-30"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Signatory</p>
          </div>
        </div>
      </div>
      
      {/* Hide print button in print view */}
      <div className="absolute top-4 right-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};
