import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ArrowRight, PlusCircle } from 'lucide-react';

export const RDDashboard = ({ setCurrentTab }: { setCurrentTab: (tab: string) => void }) => {
  const [rds, setRds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRDs = async () => {
      try {
        const res = await api.get('/rd');
        if (res.data.success) {
          setRds(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRDs();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading RDs...</div>;

  return (
    <div className="bg-slate-50 min-h-screen py-8 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-[#0F4C81] uppercase tracking-tight">My Recurring Deposits</h1>
          <button 
            onClick={() => setCurrentTab('apply-rd')}
            className="flex items-center gap-2 px-6 py-3 bg-[#ED7F1E] text-white rounded-xl font-bold shadow-lg shadow-[#ED7F1E]/20 hover:bg-[#d66a10] transition-colors"
          >
            <PlusCircle className="w-5 h-5" /> Open New RD
          </button>
        </div>

        {rds.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl shadow-sm border border-slate-200">
            <div className="text-slate-400 mb-4">You don't have any Recurring Deposits yet.</div>
            <button 
              onClick={() => setCurrentTab('apply-rd')}
              className="text-[#0F4C81] font-bold hover:underline"
            >
              Start saving today!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rds.map(rd => (
              <div key={rd._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  rd.status === 'Active' ? 'bg-emerald-500' :
                  rd.status === 'Pending Approval' ? 'bg-amber-500' :
                  rd.status === 'Matured' ? 'bg-blue-500' :
                  rd.status === 'Inactive' ? 'bg-red-500' : 'bg-slate-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">RD Number</div>
                    <div className="font-bold text-lg">{rd.rdNumber || 'Pending'}</div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    rd.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    rd.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' :
                    rd.status === 'Matured' ? 'bg-blue-100 text-blue-700' :
                    rd.status === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {rd.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Amount</div>
                    <div className="font-bold text-[#0F4C81]">₹{rd.monthlyAmount.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Deposited</div>
                    <div className="font-bold text-[#0F4C81]">₹{rd.totalDeposited.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Interest Rate</div>
                    <div className="font-bold">{rd.interestRate}% p.a.</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tenure</div>
                    <div className="font-bold">{rd.tenureMonths} Months</div>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentTab(`view-rd-details|${rd._id}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-[#0F4C81] font-bold rounded-xl border border-slate-200 group-hover:bg-[#0F4C81] group-hover:text-white transition-colors"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
