import React, { useState, useEffect } from 'react';
import { getMyFDs, transferToSavings, renewFD, renewPrincipal } from '../services/fdApi';
import { ArrowLeft, Clock, RefreshCw, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MyFixedDeposits: React.FC<{ setCurrentTab: (tab: string) => void, setFdReceiptData: (data: any) => void }> = ({ setCurrentTab, setFdReceiptData }) => {
  const [fds, setFds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchFDs();
  }, []);

  const fetchFDs = async () => {
    try {
      const res = await getMyFDs();
      if (res.success) {
        setFds(res.data);
      }
    } catch (err: any) {
      setError('Failed to load fixed deposits');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await action();
      if (res.success) {
        setSuccess(successMsg);
        fetchFDs();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const onTransfer = (id: string) => handleAction(() => transferToSavings(id), 'Settlement request submitted to admin.');
  const onRenew = (id: string) => handleAction(() => renewFD(id), 'FD successfully renewed with principal and interest.');
  const onRenewPrincipal = (id: string) => handleAction(() => renewPrincipal(id), 'FD renewed with principal. Interest credited to savings.');

  const viewReceipt = (fd: any) => {
    setFdReceiptData(fd);
    setCurrentTab('fd_receipt');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading fixed deposits...</div>;
  }

  return (
    <div className="bg-transparent text-slate-800">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8 hidden">
          <button onClick={() => setCurrentTab('dashboard')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">My Fixed Deposits</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Manage your active and matured term deposits</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-3 text-xs shadow-sm">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start space-x-3 text-xs shadow-sm">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {fds.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Fixed Deposits Found</h3>
            <p className="text-sm text-slate-500 mt-2">You don't have any active or matured fixed deposits.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {fds.map(fd => (
              <div key={fd._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg">
                      {fd.fdNumber}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                      fd.status === 'Active' ? 'bg-blue-50 text-blue-700' :
                      fd.status === 'Matured' ? 'bg-emerald-50 text-emerald-700' :
                      fd.status === 'Closed' ? 'bg-slate-100 text-slate-500' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {fd.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Principal</p>
                      <p className="text-sm font-bold text-slate-900">₹{(fd.principalAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Interest Rate</p>
                      <p className="text-sm font-bold text-slate-900">{fd.interestRate}% <span className="text-[10px] font-normal text-slate-500">p.a.</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tenure</p>
                      <p className="text-sm font-bold text-slate-900">{fd.tenureMonths} Months</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Maturity Amt</p>
                      <p className="text-sm font-bold text-emerald-700">₹{(fd.maturityAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>


                </div>

                {/* Actions Section */}
                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center gap-3 shrink-0">
                  {fd.status === 'Matured' && (
                    <>
                      <button 
                        onClick={() => onTransfer(fd._id)}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-[#ED7F1E] hover:bg-[#d66b12] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        Transfer to Savings
                      </button>
                      <button 
                        onClick={() => onRenew(fd._id)}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-[#0F4C81] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" /> Renew Full Amount
                      </button>
                      <button 
                        onClick={() => onRenewPrincipal(fd._id)}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-white border border-[#0F4C81] text-[#0F4C81] hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                      >
                        Renew Principal Only
                      </button>
                      <button 
                        onClick={() => setCurrentTab('view-fd-details|' + fd._id)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 mt-2"
                      >
                        <FileText className="w-4 h-4" /> View Details & Certificate
                      </button>
                    </>
                  )}
                  {fd.status === 'Closed' && (
                    <button 
                      onClick={() => viewReceipt(fd)}
                      className="w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> View Closure Receipt
                    </button>
                  )}
                  {fd.status === 'Active' && (
                    <div className="text-center">
                      <button 
                        onClick={() => setCurrentTab('view-fd-details|' + fd._id)}
                        className="w-full py-2.5 bg-[#0F4C81] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 mb-2"
                      >
                        <FileText className="w-4 h-4" /> View Details & Certificate
                      </button>
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-full mb-2">
                        <Clock className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Awaiting Maturity</p>
                    </div>
                  )}
                  {fd.status === 'Pending Settlement Approval' && (
                    <div className="text-center p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider leading-tight">Settlement Requested</p>
                      <p className="text-[9px] text-amber-600 mt-1">Awaiting admin verification</p>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
