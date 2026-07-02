import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, ShieldCheck, Download, Eye, IndianRupee } from 'lucide-react';
import { SharePurchaseModal } from '../components/SharePurchaseModal';
import api from '../services/api';

export const ShareCapital: React.FC = () => {
  const { user, systemSettings } = useAuth();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  if (!user) return null;

  const isActiveMember = user.membershipStatus === 'approved';

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const res = await api.get(`/shares/certificate/${certificateId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Share_Certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading certificate', error);
      alert('Failed to download certificate.');
    }
  };

  const handleViewCertificate = async (certificateId: string) => {
    try {
      const res = await api.get(`/shares/certificate/${certificateId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing certificate', error);
      alert('Failed to view certificate.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Main Actions */}
      <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Briefcase className="h-8 w-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Shareholder Dashboard</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Share Capital</h2>
            <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-slate-500 font-semibold">
              <span>Membership Status: {isActiveMember ? <span className="text-emerald-600">Active</span> : <span className="text-amber-600">Pending/None</span>}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          {isActiveMember ? (
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
            >
              Purchase Shares
            </button>
          ) : (
            <div className="text-xs text-rose-600 font-bold bg-rose-50 px-4 py-2 rounded-lg">
              You must become an active member before purchasing share capital.
            </div>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Share Price</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-black text-slate-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1 text-slate-400" />
              {systemSettings.sharePrice || 100}
            </h3>
          </div>
        </div>
        <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Shares Owned</p>
          <h3 className="text-2xl font-black text-slate-900">
            {user.sharesOwned || 0}
          </h3>
        </div>
        <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Total Investment</p>
          <div className="flex items-end gap-2 relative z-10">
            <h3 className="text-2xl font-black text-primary flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" />
              {(user.shareCapitalInvested || 0).toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
        <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Dividend Earned</p>
          <div className="flex items-end gap-2 relative z-10">
            <h3 className="text-2xl font-black text-emerald-600 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" />
              {(user.totalDividendEarned || 0).toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Share Purchase History */}
      <div className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>Share Purchase History</span>
          </h4>
        </div>
        
        {(!user.sharePurchases || user.sharePurchases.length === 0) ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-700">No Shares Purchased</h3>
            <p className="text-xs text-slate-500 mt-1">You haven't invested in share capital yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction ID</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Shares</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Price</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {user.sharePurchases.slice().reverse().map((purchase: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium whitespace-nowrap">
                      {new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {purchase.transactionId}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-800 text-right">
                      {purchase.shares}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-600 text-right">
                      ₹{purchase.price}
                    </td>
                    <td className="py-4 px-6 text-xs font-black text-primary text-right">
                      ₹{purchase.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewCertificate(purchase.certificateNo)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadCertificate(purchase.certificateNo)}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Download Certificate"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dividend History */}
      <div className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Dividend History</span>
          </h4>
        </div>
        
        {(!user.dividendHistory || user.dividendHistory.length === 0) ? (
          <div className="p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-700">No Dividends Earned</h3>
            <p className="text-xs text-slate-500 mt-1">Dividends will appear here when declared by the society.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Date</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Year</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction ID</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Investment</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Rate</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Dividend Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {user.dividendHistory.slice().reverse().map((div: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium whitespace-nowrap">
                      {new Date(div.paymentDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-800">
                      {div.year}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {div.transactionId}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-600 text-right">
                      ₹{div.investment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-emerald-600 text-right">
                      {div.rate}%
                    </td>
                    <td className="py-4 px-6 text-xs font-black text-emerald-600 text-right">
                      ₹{div.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SharePurchaseModal 
        isOpen={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)} 
      />
    </div>
  );
};
