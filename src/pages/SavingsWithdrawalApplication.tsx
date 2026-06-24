import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { withdrawSavings } from '../services/savingsApi';

const numberToWords = (num: number): string => {
  if (!num) return '';
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));
  if (num > 999999999) return 'Amount too large';
  
  let str = '';
  const crore = Math.floor(num / 10000000);
  if (crore > 0) {
    str += (crore < 20 ? a[crore] : b[Math.floor(crore / 10)] + (crore % 10 !== 0 ? ' ' + a[crore % 10] : '')) + ' Crore ';
    num %= 10000000;
  }
  const lakh = Math.floor(num / 100000);
  if (lakh > 0) {
    str += (lakh < 20 ? a[lakh] : b[Math.floor(lakh / 10)] + (lakh % 10 !== 0 ? ' ' + a[lakh % 10] : '')) + ' Lakh ';
    num %= 100000;
  }
  const thousand = Math.floor(num / 1000);
  if (thousand > 0) {
    str += (thousand < 20 ? a[thousand] : b[Math.floor(thousand / 10)] + (thousand % 10 !== 0 ? ' ' + a[thousand % 10] : '')) + ' Thousand ';
    num %= 1000;
  }
  const hundred = Math.floor(num / 100);
  if (hundred > 0) {
    str += a[hundred] + ' Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (str !== '') str += 'and ';
    str += (num < 20 ? a[num] : b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : ''));
  }
  return str.trim() + ' Rupees Only';
};

export const SavingsWithdrawalApplication: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const { user, getCustomerByCustomerId } = useAuth();
  
  const [customerIdInput, setCustomerIdInput] = useState('');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);

  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receiptNo, setReceiptNo] = useState('');

  const handleCustomerLookup = async () => {
    if (!customerIdInput) return;
    setIsFetchingCustomer(true);
    setError('');
    try {
      const data = await getCustomerByCustomerId(customerIdInput);
      if (data) {
        setCustomerInfo(data);
      } else {
        setError('Customer not found');
        setCustomerInfo(null);
      }
    } catch (e) {
      setError('Error fetching customer details');
      setCustomerInfo(null);
    } finally {
      setIsFetchingCustomer(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || amount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const targetUserId = customerInfo ? customerInfo._id : user?.id || user?._id;
      const res = await withdrawSavings({ amount: Number(amount), targetUserId });
      if (res.success) {
        setSuccess(true);
        setReceiptNo(res.transaction?.referenceNumber || 'SUCCESS');
      } else {
        setError(res.error || 'Failed to process withdrawal');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden text-center p-12 border border-slate-100">
          <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Withdrawal Successful</h2>
          <p className="text-slate-600 font-medium mb-8">Your savings withdrawal of ₹{amount} has been processed successfully. Your account balance has been updated in real-time.</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 inline-block text-left mb-8">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Transaction Reference</p>
            <p className="text-2xl font-mono text-slate-800 font-black">{receiptNo}</p>
          </div>
          <br/>
          <button onClick={() => setCurrentTab('dashboard')} className="px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#0A315C] transition-colors shadow-lg shadow-blue-200">
            View Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
        
        {/* HEADER SECTION (Blue Theme) */}
        <div className="bg-[#0F4C81] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b-[8px] border-[#ED7F1E]">
          <div className="flex-grow flex items-center justify-center md:justify-start space-x-4 md:space-x-6 mx-auto md:mx-0 w-full md:w-auto">
            <img src="/logo-bg.png" alt="Odiyooru Souharda Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain shrink-0" />
            <div className="text-white leading-tight text-left">
              <span className="text-xl md:text-3xl font-black tracking-tight uppercase block leading-none font-heading">
                Odiyooru Souharda
              </span>
              <span className="text-sm md:text-lg font-bold uppercase tracking-widest leading-none block mt-1 md:mt-2">
                Cooperative Society Ltd
              </span>
              <span className="text-[10px] md:text-xs font-bold block mt-1 md:mt-2 font-mono leading-none text-white/90">
                DRP:S.9:88:RGN:520:2010-11
              </span>
            </div>
          </div>
          
          <div className="text-white text-[10px] md:text-xs font-bold w-full md:w-auto shrink-0 mt-4 md:mt-0">
            <table className="ml-auto">
              <tbody>
                <tr>
                  <td className="text-right pr-3 opacity-90 pb-2">Branch:</td>
                  <td className="text-left pb-2">
                    <input type="text" value="Main Branch" readOnly className="w-32 border-b border-white/40 outline-none bg-transparent text-center text-white placeholder-white/60 focus:border-white transition-colors opacity-90" />
                  </td>
                </tr>
                <tr>
                  <td className="text-right pr-3 opacity-90 pb-2">Date:</td>
                  <td className="text-left pb-2">
                    <input type="text" value={new Date().toLocaleDateString('en-IN')} readOnly className="w-32 border-b border-white/40 outline-none bg-transparent text-center text-white placeholder-white/60 focus:border-white transition-colors opacity-90" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#EAF6FF] py-3 text-center border-b border-slate-200">
          <h2 className="text-xl md:text-2xl font-black text-[#0A315C] uppercase tracking-widest">Savings Withdrawal</h2>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 mr-3 shrink-0" />
              <p className="text-sm font-bold text-rose-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Customer Details section */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#0F4C81] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Customer Details</h3>
              
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Customer ID <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customerIdInput}
                    onChange={(e) => setCustomerIdInput(e.target.value)}
                    placeholder="Enter Customer ID"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all" 
                  />
                  <button 
                    onClick={handleCustomerLookup}
                    className="px-4 py-2 bg-[#ED7F1E] text-white rounded-xl text-xs font-bold hover:bg-[#d66b12] transition-colors"
                  >
                    {isFetchingCustomer ? '...' : 'Fetch'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Customer Name</label>
                <input type="text" readOnly value={customerInfo?.fullName || user?.fullName || ''} placeholder="Auto-filled" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Savings Account No</label>
                <input type="text" readOnly value={customerInfo?.savingsAccountNumber || user?.accountNumber || ''} placeholder="Auto-filled" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Available Balance</label>
                <input type="text" readOnly value={customerInfo?.savingsBalance || user?.savingsBalance || '0'} className="w-full px-4 py-3 bg-[#EAF6FF] border border-[#0F4C81] rounded-xl text-sm font-black text-[#0F4C81] outline-none tracking-widest" />
              </div>
            </div>

            {/* Withdrawal Details section */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#0F4C81] uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Withdrawal Details</h3>
              
              <div>
                <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Withdrawal Amount (₹) <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  min="100" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')} 
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-lg font-black text-[#0A315C] focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all" 
                  placeholder="Min ₹100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Amount In Words</label>
                <input 
                  type="text" 
                  readOnly 
                  value={numberToWords(Number(amount))} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 outline-none" 
                  placeholder="Auto-generated"
                />
              </div>
            </div>

          </div>

          {/* Action Section Box */}
          <div className="bg-[#0A315C] text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-xl mt-4">
            <div className="mb-6 md:mb-0">
              <h4 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">Total Withdrawal Amount</h4>
              <div className="text-4xl font-black tracking-tight text-white">₹{amount || '0'}</div>
              <p className="text-slate-400 text-xs mt-2">Amount will be deducted from savings balance</p>
            </div>
            
            <button 
              onClick={handleWithdraw}
              disabled={isSubmitting || !amount || amount < 100 || (!customerIdInput && !user)}
              className="w-full md:w-auto px-12 py-5 bg-[#ED7F1E] hover:bg-[#d66b12] disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>Withdraw Funds <ArrowUpRight className="w-5 h-5 ml-1" /></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
