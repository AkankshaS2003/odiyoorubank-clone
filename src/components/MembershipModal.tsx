import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MembershipCard } from './MembershipCard';
import { PaymentGatewayModal } from './PaymentGatewayModal';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentTab?: (tab: string) => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose, setCurrentTab }) => {
  const { user, becomeMember } = useAuth();
  const [address, setAddress] = useState(user?.address || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [customerId, setCustomerId] = useState('');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [hasPrefilledAddress, setHasPrefilledAddress] = useState(false);
  const [hasPrefilledDob, setHasPrefilledDob] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(user?.membershipStatus === 'pending');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  React.useEffect(() => {
    if (isOpen && user?.membershipStatus === 'pending') {
      setIsSubmitted(true);
    }
  }, [isOpen, user?.membershipStatus]);

  if (!isOpen || !user) return null;

  const handleVerify = async () => {
    if (!customerId) return;
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/account/verify-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ customerId })
      });
      const data = await res.json();
      if (data.success) {
        setAddress(data.data.address || '');
        setHasPrefilledAddress(!!data.data.address);
        setDob(data.data.dob || '');
        setHasPrefilledDob(!!data.data.dob);
        setAccountNumber(data.data.accountNumber || '');
        setIsVerified(true);
      } else {
        setVerifyError(data.error || 'Failed to verify Customer ID');
      }
    } catch (err) {
      setVerifyError('Network error while verifying Customer ID');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified && address && dob) {
      setShowPaymentGateway(true);
    }
  };

  const handlePaymentSuccess = () => {
    becomeMember(address, dob);
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isSubmitted ? 'Application Pending' : 'Shareholder Membership Application'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isSubmitted ? 'Pending Admin Approval' : 'Complete details to generate your digital ID card'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8">
            {user.membershipStatus === 'approved' ? (
              <div className="flex flex-col items-center py-4">
                <div className="w-full max-w-md mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Your application is approved</h3>
                  <p className="text-sm text-slate-500 mb-6">You are now an official shareholder. You can access your digital membership card from your dashboard.</p>
                  <button
                    onClick={() => {
                      if (setCurrentTab) {
                        setCurrentTab('dashboard');
                      }
                      onClose();
                    }}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-colors"
                  >
                    Visit Dashboard
                  </button>
                </div>
              </div>
            ) : isSubmitted ? (
              <div className="flex flex-col items-center py-4">
                <div className="w-full max-w-md mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Application Under Review</h3>
                  <p className="text-sm text-slate-500">Your membership application has been submitted and is currently pending admin approval. You will be able to access your digital ID card once approved.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer ID */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Customer ID</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        required
                        value={customerId}
                        onChange={(e) => {
                          setCustomerId(e.target.value);
                          setIsVerified(false);
                        }}
                        placeholder="Enter your Customer ID (e.g. CUST123456)"
                        className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                      <button 
                        type="button" 
                        onClick={handleVerify}
                        disabled={!customerId || verifyLoading}
                        className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50"
                      >
                        {verifyLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {verifyError && <p className="text-red-500 text-sm mt-1">{verifyError}</p>}
                  </div>

                  {isVerified && (
                    <>
                      {/* Name */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            required
                            readOnly
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-medium outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Account Number */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Number</label>
                        <input
                          type="text"
                          readOnly
                          value={accountNumber}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-medium outline-none cursor-not-allowed"
                        />
                      </div>

                      {/* DOB */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</label>
                        <input
                          type="date"
                          readOnly={hasPrefilledDob}
                          value={dob}
                          onChange={(e) => !hasPrefilledDob && setDob(e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-medium outline-none ${hasPrefilledDob ? 'cursor-not-allowed' : 'bg-white'}`}
                        />
                      </div>

                      {/* Address */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Communication Address</label>
                        <textarea
                          readOnly={hasPrefilledAddress}
                          rows={3}
                          value={address}
                          onChange={(e) => !hasPrefilledAddress && setAddress(e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-medium outline-none resize-none ${hasPrefilledAddress ? 'cursor-not-allowed' : 'bg-white'}`}
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">
                    By submitting this form, you agree to apply to become a registered shareholder of Odiyooru Souharda Cooperative Society. 
                    Your application will be sent for admin approval.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isVerified}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay ₹200 & Apply for Membership
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
      
      <PaymentGatewayModal 
        isOpen={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        amount={200}
        purpose="Membership Application Fee"
        onSuccess={handlePaymentSuccess}
      />
    </AnimatePresence>
  );
};
