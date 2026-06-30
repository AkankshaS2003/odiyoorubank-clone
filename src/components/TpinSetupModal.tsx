import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, CheckCircle, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TpinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isChangeMode?: boolean;
}

export const TpinSetupModal: React.FC<TpinSetupModalProps> = ({ isOpen, onClose, onSuccess, isChangeMode = false }) => {
  const { user, fetchUserProfile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(isChangeMode ? 3 : 1);
  const [otp, setOtp] = useState('');
  const [currentTpin, setCurrentTpin] = useState('');
  const [tpin, setTpin] = useState('');
  const [confirmTpin, setConfirmTpin] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/tpin/send-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        setSuccessMsg('OTP sent to your email.');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/tpin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
        setSuccessMsg('OTP Verified! Create your TPIN.');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isChangeMode ? '/api/tpin/change' : (user?.tpinLocked ? '/api/tpin/unlock' : '/api/tpin/setup');
      const payload = isChangeMode 
        ? { currentTpin, newTpin: tpin, confirmTpin } 
        : (user?.tpinLocked ? { newTpin: tpin, confirmTpin } : { tpin, confirmTpin });

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        await fetchUserProfile();
        setSuccessMsg(data.message);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
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
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                {isChangeMode ? 'Change Transaction PIN' : (user?.tpinLocked ? 'Unlock Transaction PIN' : 'Set Transaction PIN')}
              </h2>
              <p className="text-slate-500 text-center mt-2">
                Your 6-digit TPIN secures all your financial transactions.
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

            {step === 1 && (
              <div className="space-y-6">
                <p className="text-slate-600 text-sm text-center">
                  To ensure security, we need to verify your identity via email OTP before you can set your TPIN.
                </p>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Enter Email OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {isChangeMode && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current TPIN</label>
                    <input
                      type="password"
                      value={currentTpin}
                      onChange={(e) => setCurrentTpin(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500"
                      maxLength={6}
                      placeholder="••••••"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New 6-Digit TPIN</label>
                  <input
                    type="password"
                    value={tpin}
                    onChange={(e) => setTpin(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                    placeholder="••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm 6-Digit TPIN</label>
                  <input
                    type="password"
                    value={confirmTpin}
                    onChange={(e) => setConfirmTpin(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                    placeholder="••••••"
                  />
                </div>
                <ul className="text-xs text-slate-500 list-disc pl-5 space-y-1 mt-2">
                  <li>Must be exactly 6 digits</li>
                  <li>Cannot be sequential (e.g., 123456) or repeating (e.g., 000000)</li>
                  <li>Cannot match DOB, Phone, or Aadhaar</li>
                </ul>
                <button
                  onClick={handleSetup}
                  disabled={loading || tpin.length !== 6 || confirmTpin.length !== 6}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? 'Processing...' : 'Confirm Security PIN'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
