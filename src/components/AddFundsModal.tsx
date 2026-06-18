import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, X, DollarSign } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface AddFundsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [showPayment, setShowPayment] = useState(false);

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && amount > 0) {
      setShowPayment(true);
    }
  };

  if (showPayment && amount) {
    return (
      <PaymentModal 
        amount={Number(amount)} 
        type="Account Deposit" 
        onClose={onClose} 
        onSuccess={onSuccess} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Add Funds</h3>
              <p className="text-sm text-slate-500">Deposit into Savings Balance</p>
            </div>
          </div>

          <form onSubmit={handleProceed}>
            <div className="mb-6 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Amount (₹)</label>
              <input
                type="number"
                min="100"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount (Min ₹100)"
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!amount || amount < 100}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <span>Proceed to Pay</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
