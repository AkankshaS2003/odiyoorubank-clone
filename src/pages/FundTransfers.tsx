import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRightLeft, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { TransferReceipt } from '../components/TransferReceipt';
import { TpinPromptModal } from '../components/TpinPromptModal';

export const FundTransfers: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'own' | 'internal' | 'external'>('own');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showTpinModal, setShowTpinModal] = useState(false);

  const [formData, setFormData] = useState({
    fromAccount: user?.accountNumber || '',
    toAccount: '',
    beneficiaryName: '',
    ifscCode: '',
    bankName: '',
    amount: '',
    remarks: '',
    transferMode: 'NEFT'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const initiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tpinActive) {
      setError('You must set up your Transaction PIN before transferring funds. Please go to Account section.');
      return;
    }
    if (user?.tpinLocked) {
      setError('Your Transaction PIN is locked. Please unlock it in the Account section.');
      return;
    }
    setShowTpinModal(true);
  };

  const handleVerifyTpin = async (tpin: string) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'own' ? '/api/transfers/own-account' 
                     : activeTab === 'internal' ? '/api/transfers/internal' 
                     : '/api/transfers/external';

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, tpin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Transfer failed');

      setSuccess(true);
      setReceiptData({
        ...formData,
        transactionId: data.transactionId,
        referenceNumber: data.referenceNumber,
        date: new Date().toISOString(),
        transferType: activeTab === 'own' ? 'Own Account Transfer' : activeTab === 'internal' ? 'Internal Fund Transfer' : `${formData.transferMode} Transfer`,
        status: 'Completed'
      });
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw so TpinPromptModal catches it
    } finally {
      setLoading(false);
    }
  };

  if (success && receiptData) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-150 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
        <div className="relative flex flex-col items-center">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Transfer Successful</h2>
          <p className="text-slate-500 mb-8 font-medium">Your funds have been transferred securely.</p>
          <div className="w-full max-w-2xl">
            <TransferReceipt data={receiptData} />
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({ ...formData, toAccount: '', amount: '', remarks: '' });
            }}
            className="mt-8 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md transition-colors"
          >
            Make Another Transfer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-150 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Fund Transfers</h2>
          <p className="text-xs text-slate-500 font-medium">Securely transfer money anywhere.</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
        <button
          onClick={() => setActiveTab('own')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'own' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Own Account
        </button>
        <button
          onClick={() => setActiveTab('internal')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'internal' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Internal Transfer
        </button>
        <button
          onClick={() => setActiveTab('external')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'external' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          NEFT / IMPS
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={initiateTransfer} className="space-y-6 max-w-2xl mx-auto">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Account</label>
          <input
            type="text"
            name="fromAccount"
            value={formData.fromAccount}
            readOnly
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {activeTab === 'own' ? 'To Account Number' : 'Beneficiary Account Number'}
          </label>
          <input
            type="text"
            name="toAccount"
            value={formData.toAccount}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
            placeholder="Enter Account Number"
          />
        </div>

        {activeTab === 'external' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Beneficiary Name</label>
              <input
                type="text"
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                placeholder="Name as per bank"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transfer Mode</label>
              <select
                name="transferMode"
                value={formData.transferMode}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none appearance-none"
              >
                <option value="NEFT">NEFT (Simulated)</option>
                <option value="IMPS">IMPS (Simulated)</option>
                <option value="RTGS">RTGS (Simulated)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                placeholder="e.g. SBIN0001234"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                placeholder="e.g. State Bank of India"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks</label>
          <input
            type="text"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
            placeholder="e.g. Rent Payment"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-black uppercase tracking-wider shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? 'Processing...' : `Transfer ₹${formData.amount || '0'}`}
        </button>
      </form>

      <TpinPromptModal
        isOpen={showTpinModal}
        onClose={() => setShowTpinModal(false)}
        onSubmit={handleVerifyTpin}
        title="Authorize Transfer"
        description={`Enter your 6-digit TPIN to securely transfer ₹${formData.amount} to ${activeTab === 'own' ? formData.toAccount : formData.beneficiaryName || formData.toAccount}.`}
      />
    </div>
  );
};
