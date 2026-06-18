import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Building, ShieldCheck, CheckCircle2, Loader2, Lock } from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  purpose: string;
  onSuccess: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({ isOpen, onClose, amount, purpose, onSuccess }) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setMethod('upi');
    }
  }, [isOpen]);

  const handlePay = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          {status === 'success' ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Payment Successful!</h2>
              <p className="text-slate-500 font-medium">₹{amount.toLocaleString('en-IN')} paid for {purpose}.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0F4C81]/10 p-2 rounded-xl text-[#0F4C81]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Secure Payment</h2>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> 256-bit Encrypted
                    </p>
                  </div>
                </div>
                {status === 'idle' && (
                  <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Amount Info */}
              <div className="p-6 bg-[#0F4C81] text-white text-center">
                <p className="text-sm text-blue-200 font-medium mb-1 uppercase tracking-wider">{purpose}</p>
                <h3 className="text-4xl font-black">₹{amount.toLocaleString('en-IN')}</h3>
              </div>

              {/* Payment Methods */}
              <div className="p-6 pointer-events-auto">
                <div className={`grid grid-cols-3 gap-2 mb-6 ${status === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button onClick={() => setMethod('upi')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${method === 'upi' ? 'border-[#0F4C81] bg-[#EAF6FF] text-[#0F4C81]' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    <Smartphone className="w-6 h-6" />
                    <span className="text-xs font-bold">UPI</span>
                  </button>
                  <button onClick={() => setMethod('card')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${method === 'card' ? 'border-[#0F4C81] bg-[#EAF6FF] text-[#0F4C81]' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs font-bold">Card</span>
                  </button>
                  <button onClick={() => setMethod('netbanking')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${method === 'netbanking' ? 'border-[#0F4C81] bg-[#EAF6FF] text-[#0F4C81]' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    <Building className="w-6 h-6" />
                    <span className="text-xs font-bold">Net Banking</span>
                  </button>
                </div>

                {/* Dummy Fields */}
                <div className={`mb-8 ${status === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}>
                  {method === 'upi' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">UPI ID / VPA</label>
                      <input type="text" placeholder="example@upi" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#0F4C81] outline-none text-sm font-medium" />
                    </div>
                  )}
                  {method === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Number</label>
                        <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#0F4C81] outline-none text-sm font-medium" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry</label>
                          <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#0F4C81] outline-none text-sm font-medium" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CVV</label>
                          <input type="password" placeholder="***" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#0F4C81] outline-none text-sm font-medium" />
                        </div>
                      </div>
                    </div>
                  )}
                  {method === 'netbanking' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Bank</label>
                      <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#0F4C81] outline-none text-sm font-medium bg-white">
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handlePay} 
                  disabled={status === 'processing'}
                  className="w-full py-4 bg-[#0F4C81] text-white rounded-xl font-bold shadow-lg shadow-[#0F4C81]/20 hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
                >
                  {status === 'processing' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                    </>
                  ) : (
                    `Pay ₹${amount.toLocaleString('en-IN')}`
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
