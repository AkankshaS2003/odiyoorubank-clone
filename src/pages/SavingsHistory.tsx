import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { History, ArrowLeft, Loader2, ArrowUpRight, ArrowDownLeft, Calendar, Printer } from 'lucide-react';
import { getSavingsTransactions } from '../services/savingsApi';

export const SavingsHistory: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await getSavingsTransactions();
        if (res.success) {
          setTransactions(res.transactions);
        }
      } catch (err) {
        console.error('Failed to fetch transactions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="bg-transparent">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8 hidden">
          <button 
            onClick={() => setCurrentTab('profile')}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-grow">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <History className="w-6 h-6 text-[#0F4C81]" /> Savings Transaction History
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">View all deposits, withdrawals, and interest credits</p>
          </div>
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 bg-[#0F4C81] text-white hover:bg-[#0A315C] rounded-xl text-sm font-bold transition-colors flex items-center gap-2 print:hidden"
          >
            <Printer className="w-4 h-4" /> Download Passbook
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81]" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Transactions Yet</h3>
              <p className="text-slate-500 mt-2">Your savings account transactions will appear here.</p>
              <button 
                onClick={() => setCurrentTab('apply-savings-deposit')}
                className="mt-6 px-6 py-2.5 bg-[#0F4C81] text-white rounded-xl font-bold text-sm hover:bg-[#0a315c] transition-colors"
              >
                Make a Deposit
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Date & Time</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Reference</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Type</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Amount</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((txn, index) => {
                    const isCredit = txn.creditAmount > 0;
                    return (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                              {new Date(txn.createdAt).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {txn.referenceNumber}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-slate-800 line-clamp-1">{txn.description}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {isCredit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {txn.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-black ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {!isCredit && '-'}₹{(isCredit ? txn.creditAmount : txn.debitAmount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-bold text-slate-800">
                            ₹{txn.balanceAfter.toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
