import React, { useState, useEffect } from 'react';
import { Briefcase, Loader2, Save, Download, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

export const AdminShareCapital: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    sharePrice: 100,
    minShares: 10,
    maxShares: 1000
  });

  const [dividendRate, setDividendRate] = useState('');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [dividends, setDividends] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'purchases' | 'dividends'>('purchases');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [setRes, purRes, divRes] = await Promise.all([
        api.get('/shares/settings'),
        api.get('/shares/purchases'),
        api.get('/shares/dividend-history')
      ]);
      
      if (setRes.data.success) setSettings(setRes.data.data);
      if (purRes.data.success) setPurchases(purRes.data.data);
      if (divRes.data.success) setDividends(divRes.data.data);
    } catch (err: any) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/shares/settings', settings);
      if (res.data.success) {
        setSuccess('Settings updated successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareDividend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to declare a ${dividendRate}% dividend? This will credit accounts immediately.`)) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/shares/declare-dividend', { dividendRate });
      if (res.data.success) {
        setSuccess(res.data.message);
        setDividendRate('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to declare dividend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Share Capital Management</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">Manage share price, dividends, and view shareholder ledger.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-start gap-3 border border-emerald-100">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Share Capital Settings
          </h3>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Price Per Share (₹)</label>
              <input
                type="number"
                value={settings.sharePrice}
                onChange={(e) => setSettings({ ...settings, sharePrice: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Min Shares</label>
                <input
                  type="number"
                  value={settings.minShares}
                  onChange={(e) => setSettings({ ...settings, minShares: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Shares</label>
                <input
                  type="number"
                  value={settings.maxShares}
                  onChange={(e) => setSettings({ ...settings, maxShares: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0A315C] text-white font-bold rounded-xl hover:bg-[#082545] transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </form>
        </div>

        {/* Declare Dividend Panel */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Declare Dividend
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Enter the dividend rate to declare for the current financial year. This will automatically calculate and credit dividends to the savings accounts of all shareholders.
          </p>
          <form onSubmit={handleDeclareDividend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dividend Rate (%)</label>
              <input
                type="number"
                step="0.01"
                required
                value={dividendRate}
                onChange={(e) => setDividendRate(e.target.value)}
                placeholder="e.g., 10.5"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !dividendRate}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Process & Distribute Dividend
            </button>
          </form>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'purchases' ? 'bg-[#0A315C] text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Share Purchases
          </button>
          <button 
            onClick={() => setActiveTab('dividends')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'dividends' ? 'bg-[#0A315C] text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Dividend History
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'purchases' ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Cert No.</th>
                  <th className="p-4 text-right">Shares</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-xs text-slate-500 italic">No share purchases found.</td></tr>
                ) : purchases.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{p.fullName}</p>
                      <p className="text-[10px] text-slate-500">{p.customerId} | {p.memberId}</p>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                    <td className="p-4 text-xs font-mono font-bold text-slate-500">{p.certificateNo}</td>
                    <td className="p-4 text-xs font-bold text-slate-800 text-right">{p.shares}</td>
                    <td className="p-4 text-xs font-black text-primary text-right">₹{p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Rate</th>
                  <th className="p-4 text-right">Investment</th>
                  <th className="p-4 text-right">Dividend Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dividends.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-xs text-slate-500 italic">No dividend history found.</td></tr>
                ) : dividends.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{d.fullName}</p>
                      <p className="text-[10px] text-slate-500">{d.customerId} | {d.memberId}</p>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600">{new Date(d.paymentDate).toLocaleDateString()}</td>
                    <td className="p-4 text-xs font-bold text-emerald-600 text-right">{d.rate}%</td>
                    <td className="p-4 text-xs font-bold text-slate-600 text-right">₹{d.investment.toLocaleString()}</td>
                    <td className="p-4 text-xs font-black text-emerald-600 text-right">₹{d.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
