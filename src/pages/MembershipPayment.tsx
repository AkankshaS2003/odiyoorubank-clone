import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle, Receipt, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { MembershipReceipt } from '../components/MembershipReceipt';
import { TpinPromptModal } from '../components/TpinPromptModal';

interface MembershipPaymentProps {
  setCurrentTab: (tab: string) => void;
}

export const MembershipPayment: React.FC<MembershipPaymentProps> = ({ setCurrentTab }) => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get('/memberships/fee-details');
        if (res.data.success) {
          setDetails(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  const handlePay = async () => {
    if (!agreed) return;
    setProcessing(true);
    setError('');
    
    if (!user?.tpinActive) {
      setError('You must set up your Transaction PIN before processing payments. Please go to Account section.');
      setProcessing(false);
      return;
    }
    if (user?.tpinLocked) {
      setError('Your Transaction PIN is locked. Please unlock it in the Account section.');
      setProcessing(false);
      return;
    }

    try {
      // Use the global submitServiceApplication just to trigger the TPIN prompt safely,
      // Wait, submitServiceApplication makes a POST to /service-applications. We don't want that!
      // I'll just write a quick wrapper to invoke the TPIN logic or I'll implement a dummy call?
      // Since I don't have direct access to tpinPromise, I will import TpinPromptModal.
      setShowTpinModal(true);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const [showTpinModal, setShowTpinModal] = useState(false);
  
  const processPaymentWithTpin = async (tpin: string) => {
    setProcessing(true);
    setError('');
    try {
      const res = await api.post('/memberships/pay-fee', { tpin });
      if (res.data.success) {
        setSuccessData(res.data.receipt);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
      throw err; // throw to let modal handle it
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (successData) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 pt-24">
        <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-slate-100">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-slate-800 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-8">Your membership fee has been securely processed.</p>
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 flex justify-center text-left">
            <MembershipReceipt data={successData} />
          </div>
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-wider"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setCurrentTab('dashboard')} className="p-2 bg-white rounded-full shadow hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Membership Fee Payment</h1>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> {error}
        </div>
      )}

      {details && (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Payment Details</h2>
              <p className="text-slate-400 text-sm">Please review your membership fee breakdown.</p>
            </div>
            <Receipt className="w-8 h-8 opacity-50" />
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customer Name</p>
                <p className="font-bold text-slate-800 text-lg">{details.fullName}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customer ID</p>
                <p className="font-bold text-slate-800 text-lg">{details.customerId}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Savings Account</p>
                <p className="font-mono text-slate-800 text-lg font-bold">{details.accountNumber}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Savings Balance</p>
                <p className="font-bold text-slate-800 text-lg">₹{details.savingsBalance.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="border-t border-b border-slate-100 py-6 my-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Membership Fee</span>
                <span className="font-bold text-slate-800">₹{details.membershipFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Share Capital Amount</span>
                <span className="font-bold text-slate-800">₹0 (Processed Separately)</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 border-dashed">
                <span className="text-lg font-black text-slate-800">Total Amount Payable</span>
                <span className="text-2xl font-black text-primary">₹{details.membershipFee.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {details.membershipPaymentStatus === 'Paid' ? (
              <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl font-bold flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6" />
                Membership Fee Already Paid
              </div>
            ) : (
              <div className="space-y-6">
                <label className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl cursor-pointer border border-slate-200 hover:border-primary transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span className="text-sm text-slate-700 font-medium leading-relaxed">
                    I hereby authorize Odiyooru Cooperative Bank to debit the membership fee from my linked savings account for the purpose of activating my cooperative bank membership.
                  </span>
                </label>

                <button
                  onClick={handlePay}
                  disabled={!agreed || processing || details.savingsBalance < details.membershipFee}
                  className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg"
                >
                  {processing ? 'Processing...' : 'Proceed to Pay'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <TpinPromptModal
        isOpen={showTpinModal}
        onClose={() => setShowTpinModal(false)}
        onSubmit={processPaymentWithTpin}
        title="Authorize Membership Fee Payment"
        description={`Enter your 6-digit TPIN to securely debit ₹${details?.membershipFee} from your savings account.`}
      />
    </div>
  );
};
