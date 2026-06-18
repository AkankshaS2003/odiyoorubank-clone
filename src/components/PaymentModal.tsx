import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface PaymentModalProps {
  amount: number;
  type: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ amount, type, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>(amount);

  const handlePayment = async () => {
    if (type === 'Initial Deposit' && (!currentAmount || currentAmount < 500)) {
      setError('Minimum deposit amount is ₹500');
      return;
    }
    const finalAmount = type === 'Initial Deposit' ? Number(currentAmount) : amount;

    setLoading(true);
    setError('');
    
    try {
      // Mock Create Order
      const orderRes = await api.post('/payments/create-order', { amount: finalAmount, type }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!orderRes.data.success) {
        throw new Error('Failed to initiate payment');
      }

      // Simulate a small delay for "Razorpay" modal to process
      setTimeout(async () => {
        try {
          // Mock Verify Payment
          const verifyRes = await api.post('/payments/verify', {
            razorpayOrderId: orderRes.data.data.id,
            razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(7),
            amount: finalAmount,
            type
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (verifyRes.data.success) {
            setStep(2);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          }
        } catch (err) {
          setError('Payment verification failed');
          setLoading(false);
        }
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

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
          disabled={loading || step === 2}
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Secure Payment</h3>
                <p className="text-sm text-slate-500">Powered by Razorpay</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500 font-medium">Payment For</span>
                <span className="text-sm font-bold text-slate-900">{type}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-sm text-slate-500 font-medium">Total Amount</span>
                {type === 'Initial Deposit' ? (
                  <div className="flex items-center text-2xl font-black text-[#ED7F1E]">
                    ₹<input 
                      type="number" 
                      value={currentAmount} 
                      onChange={(e) => setCurrentAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-24 bg-transparent outline-none text-right ml-1 border-b border-[#ED7F1E] focus:border-[#ED7F1E]"
                      min="500"
                    />
                  </div>
                ) : (
                  <span className="text-2xl font-black text-[#ED7F1E]">₹{amount.toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3.5 bg-[#0A315C] hover:bg-[#051C36] text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#ED7F1E]" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Pay ₹{type === 'Initial Deposit' ? currentAmount : amount} Now</span>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
              Test Mode Transaction
            </p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
            <p className="text-slate-500 text-sm">Your transaction has been securely processed.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
