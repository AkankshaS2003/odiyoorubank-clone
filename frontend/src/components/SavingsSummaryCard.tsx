import React, { useState, useEffect } from 'react';
import { PiggyBank, History, Loader2 } from 'lucide-react';
import { getSavingsProfile } from '../services/savingsApi';

export const SavingsSummaryCard: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getSavingsProfile();
        if (res.success && res.account) {
          setAccount(res.account);
        }
      } catch (err) {
        console.error('Error fetching savings account', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!account) {
    return null; // Don't show if they don't have a savings account created yet
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-800 p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden mt-8 mb-8">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <PiggyBank className="w-32 h-32" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h4 className="font-extrabold text-xl flex items-center space-x-2 text-indigo-100">
            <PiggyBank className="h-6 w-6 text-emerald-400" />
            <span>Savings Account Summary</span>
          </h4>
          <p className="text-indigo-300 text-sm mt-1">Acct No: <span className="font-mono tracking-widest font-bold text-white ml-2">{account.accountNumber}</span></p>
        </div>
        
        <button 
          onClick={() => setCurrentTab('savings-history')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          View Transaction History
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-1">Current Balance</p>
          <p className="text-2xl font-black text-emerald-400">₹{account.balance.toLocaleString('en-IN')}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-1">Total Deposits</p>
          <p className="text-xl font-bold text-white">₹{account.totalDeposits.toLocaleString('en-IN')}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-1">Total Withdrawals</p>
          <p className="text-xl font-bold text-white">₹{account.totalWithdrawals.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-1">Account Status</p>
          <p className={`text-lg font-bold ${account.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {account.status}
          </p>
        </div>
      </div>
      
      {account.lastTransactionDate && (
        <p className="text-xs text-indigo-300 mt-6 relative z-10">
          Last Transaction: <span className="font-bold text-white">{new Date(account.lastTransactionDate).toLocaleString()}</span>
        </p>
      )}
    </div>
  );
};
