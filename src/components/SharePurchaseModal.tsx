import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface SharePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharePurchaseModal: React.FC<SharePurchaseModalProps> = ({ isOpen, onClose }) => {
  const { user, systemSettings, requestTpin, fetchUserProfile } = useAuth();
  
  const [shares, setShares] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setShares('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const sharePrice = systemSettings.sharePrice || 100;
  const minShares = systemSettings.minShares || 10;
  const maxShares = systemSettings.maxShares || 1000;
  const totalAmount = (shares || 0) * sharePrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shares || shares < minShares || shares > maxShares) {
      setError(`Please enter shares between ${minShares} and ${maxShares}`);
      return;
    }

    if ((user.savingsBalance || 0) < totalAmount) {
      setError(`Insufficient savings balance. You need ₹${totalAmount}`);
      return;
    }

    setError('');
    
    try {
      const tpin = await requestTpin();
      setLoading(true);

      const res = await api.post('/shares/purchase', { shares, tpin });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        await fetchUserProfile(); // Refresh user data to get updated shares and balance
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
          setShares('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10">
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Purchase Share Capital</h2>
              <p className="text-slate-500 text-center mt-2 text-xs">
                Increase your ownership in the Cooperative Society.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-start gap-3 border border-emerald-100">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Available Balance</span>
                  <span className="font-bold text-slate-800">₹{(user.savingsBalance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Price Per Share</span>
                  <span className="font-bold text-slate-800">₹{sharePrice}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Number of Shares</label>
                <input
                  type="number"
                  required
                  min={minShares}
                  max={maxShares}
                  value={shares}
                  onChange={(e) => setShares(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder={`Min: ${minShares}, Max: ${maxShares}`}
                />
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">Total Amount to Pay</span>
                  <span className="text-xl font-black text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !shares || shares < minShares || shares > maxShares || (user.savingsBalance || 0) < totalAmount}
                className="w-full py-4 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? 'Processing...' : 'Proceed to Pay'}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
