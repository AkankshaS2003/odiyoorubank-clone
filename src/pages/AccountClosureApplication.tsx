import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { closeSavingsAccount } from '../services/savingsApi';

export const AccountClosureApplication: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const { user } = useAuth();
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCloseAccount = async () => {
    if (!window.confirm('Are you sure you want to close your savings account? This action cannot be undone.')) {
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const res = await closeSavingsAccount();
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to close account');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during account closure');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden text-center p-12 border border-slate-100">
          <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Account Closed Successfully</h2>
          <p className="text-slate-600 font-medium mb-8">Your savings account has been closed. Any remaining funds must have been withdrawn prior to this action.</p>
          <button onClick={() => setCurrentTab('profile')} className="px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#0A315C] transition-colors shadow-lg shadow-blue-200">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 p-8">
        <div className="text-center mb-8">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Close Savings Account</h2>
          <p className="text-slate-500 mt-2 font-medium">Please review the details below before proceeding with account closure.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 mr-3 shrink-0" />
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Account Number</span>
            <span className="text-lg font-black text-slate-900">{user?.accountNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Customer Name</span>
            <span className="text-lg font-bold text-slate-800">{user?.fullName}</span>
          </div>
          <div className="flex justify-between items-center pb-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Balance</span>
            <span className="text-xl font-black text-rose-600">₹{user?.savingsBalance?.toLocaleString('en-IN') || 0}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            Important: You must withdraw your entire balance (₹{user?.savingsBalance || 0}) before closing your account. If your balance is not zero, the closure request will be rejected.
          </p>
        </div>

        <div className="flex justify-between items-center gap-4">
          <button 
            onClick={() => setCurrentTab('profile')}
            className="w-full px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCloseAccount}
            disabled={isSubmitting || (user?.savingsBalance || 0) > 0}
            className="w-full px-6 py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors shadow-lg shadow-rose-200"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Closure'}
          </button>
        </div>

      </div>
    </div>
  );
};
