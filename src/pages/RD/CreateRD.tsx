import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  CheckCircle, 
  ShieldAlert, 
  ArrowRight, 
  ArrowLeft,
  PiggyBank,
  AlertCircle,
  FileText,
  Lock
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const CreateRD = ({ setCurrentTab }: { setCurrentTab: (tab: string) => void }) => {
  const { user, submitServiceApplication, systemSettings } = useAuth();
  
  // States
  const [step, setStep] = useState(1);
  const [savingsAccount, setSavingsAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Step 2 Form Data
  const [amount, setAmount] = useState('100');
  const [tenure, setTenure] = useState('12');
  const [autoDebitDate, setAutoDebitDate] = useState('5');
  const [modeOfOp, setModeOfOp] = useState('Single');
  
  // Step 4 Data
  const [addNominee, setAddNominee] = useState(false);
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [nomineeAge, setNomineeAge] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Father');
  const [linkPan, setLinkPan] = useState(true);
  const [form15H, setForm15H] = useState(false);

  // Step 5 Data
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Calculate Interest
  const isSenior = user?.dob && (new Date().getFullYear() - new Date(user.dob).getFullYear()) >= 60;
  
  const applicableRate = (systemSettings?.rdRate || 7.75) + (isSenior ? 0.5 : 0);
  
  const calculateMaturity = () => {
    const P = parseInt(amount, 10);
    const n = parseInt(tenure, 10) / 12; // years
    const r = applicableRate / 100;
    const q = 4; // Quarterly compounding
    
    // RD maturity formula approx: M = P * (((1 + r/q)^(n*q) - 1) / (1 - (1+r/q)^(-1/3)))
    // Simplified standard estimation for display:
    const months = parseInt(tenure, 10);
    let totalMaturity = 0;
    for(let i=0; i<months; i++) {
        // Compound each month's deposit for the remaining tenure
        const remainingMonths = months - i;
        const remainingYears = remainingMonths / 12;
        totalMaturity += P * Math.pow(1 + (r / q), q * remainingYears);
    }
    return Math.round(totalMaturity);
  };

  const totalPrincipal = parseInt(amount, 10) * parseInt(tenure, 10);
  const expectedMaturity = calculateMaturity();
  const estimatedInterest = expectedMaturity - totalPrincipal;

  // Initial Data Fetch
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        if (!user?.isKycVerified) {
          setError('Action Required: Your KYC profile (PAN/Aadhaar) is pending. Please visit your home branch to update it before opening new deposits.');
          setLoading(false);
          return;
        }

        const res = await api.get('/savings/profile');
        if (res.data.success && res.data.account) {
          const acc = res.data.account;
          setSavingsAccount(acc);
          if (acc.balance < 100) {
            setError('No Active Account or Insufficient Funds: You must have an active Savings Account with at least ₹100 balance.');
          }
        } else {
          setError('No Active Savings Account found.');
        }
      } catch (err) {
        setError('Failed to verify initial account details.');
      }
      setLoading(false);
    };
    fetchInitData();
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleNext = () => {
    if (step === 2) {
      const amt = parseInt(amount, 10);
      if (amt < 100 || amt % 100 !== 0) return alert('Amount must be in multiples of ₹100.');
      if (savingsAccount && amt > savingsAccount.balance) return alert('Amount exceeds your current savings balance.');
    }
    setStep(s => s + 1);
  };

  const handleSendOtp = async () => {
    try {
      await api.post('/auth/send-otp');
      setOtpSent(true);
      setOtpTimer(60); // 60 seconds
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send OTP.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleSubmit = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) return alert('Please enter 6-digit OTP');
    setIsSubmitting(true);
    try {
      const payload = {
        monthlyAmount: parseInt(amount, 10),
        tenureMonths: parseInt(tenure, 10),
        interestRate: applicableRate,
        autoDebit: true,
        linkedSavingsAccountId: savingsAccount._id,
        nomineeDetails: addNominee ? {
          name: nomineeName,
          relation: nomineeRelation,
          age: parseInt(nomineeAge, 10),
          guardianName: parseInt(nomineeAge, 10) < 18 ? guardianName : undefined,
          guardianRelation: parseInt(nomineeAge, 10) < 18 ? guardianRelation : undefined,
        } : undefined,
        otp: fullOtp
      };

      const rdRes = await api.post('/rd', payload);
      
      if (rdRes.data.success) {
        // Now submit the Service Application for the dashboard view
        const applicationDetails = {
          depositType: 'Recurring Deposit',
          amount,
          depositPeriod: tenure,
          nomineeName: addNominee ? nomineeName : '',
          nomineeRelationship: addNominee ? nomineeRelation : ''
        };
        
        // Mock signature for seamless flow
        const blankCanvas = document.createElement('canvas');
        const signatureBase64 = blankCanvas.toDataURL('image/png');
        
        await submitServiceApplication('Recurring Deposit', applicationDetails, { signature: signatureBase64 });
        
        setSuccessData(rdRes.data.data);
        setStep(6);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification Failed');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-12 h-12 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold animate-pulse">Verifying Eligibility & Fetching Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg text-center mt-12 border border-slate-100">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-600 font-medium mb-8">{error}</p>
        <button onClick={() => setCurrentTab('deposits')} className="px-6 py-3 bg-slate-100 text-slate-800 rounded-xl font-bold hover:bg-slate-200">
          Go Back
        </button>
      </div>
    );
  }

  const handleDownloadReceipt = async () => {
    const element = document.getElementById('rd-receipt-card');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text("Recurring Deposit Receipt", 14, 15);
      pdf.addImage(imgData, 'PNG', 14, 25, pdfWidth - 28, pdfHeight);
      pdf.save(`RD_Receipt_${successData?.rdNumber || 'Pending'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      
      {/* Wizard Header */}
      {step < 6 && (
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0F4C81] mb-2 flex items-center gap-2">
            <PiggyBank className="w-8 h-8" />
            Digital RD Account Opening
          </h1>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`h-2 flex-1 rounded-l-full ${step >= i ? 'bg-[#0F4C81]' : 'bg-slate-200'}`} />
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${step >= i ? 'bg-[#0F4C81]' : 'bg-slate-300'}`}>
                  {step > i ? <CheckCircle className="w-4 h-4" /> : i}
                </div>
                <div className={`h-2 flex-1 rounded-r-full ${step > i ? 'bg-[#0F4C81]' : 'bg-slate-200'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        
        {/* Step 1: Just auto-advances if passed, but we show Step 2 directly as 1 was silent */}
        {step === 1 && setStep(2)}

        {/* STEP 2: CONFIGURATION */}
        {step === 2 && (
          <div className="p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b pb-4">Step 1: Deposit Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pay From Account</label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 flex justify-between">
                  <span>Savings A/C - {savingsAccount?.accountNumber}</span>
                  <span className="text-[#0F4C81] font-bold">Avail: ₹{savingsAccount?.balance.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Installment Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-xl text-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none"
                  min="100" step="100"
                />
                <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Minimum ₹100. Multiples of ₹100 only.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deposit Duration (Tenure)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['12', '24', '36', '60'].map((m) => (
                    <button 
                      key={m}
                      onClick={() => setTenure(m)}
                      className={`p-3 rounded-xl border-2 font-bold transition-all ${tenure === m ? 'border-[#0F4C81] bg-blue-50 text-[#0F4C81]' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Auto-Debit Date</label>
                  <select 
                    value={autoDebitDate}
                    onChange={(e) => setAutoDebitDate(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-[#0F4C81]/20 outline-none"
                  >
                    {Array.from({length: 28}, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}th of every month</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mode of Operation</label>
                  <select 
                    value={modeOfOp}
                    onChange={(e) => setModeOfOp(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-[#0F4C81]/20 outline-none"
                  >
                    <option value="Single">Single (Self)</option>
                    <option value="Jointly">Jointly</option>
                    <option value="EitherSurvivor">Either or Survivor</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-black uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-xl shadow-[#0F4C81]/20">
                Next: View Summary <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CALCULATOR */}
        {step === 3 && (
          <div className="p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b pb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#0F4C81]" /> Step 2: Estimated Returns
            </h2>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
              <p className="text-sm font-bold text-slate-500 mb-6 text-center">Based on your configuration:</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <span className="font-bold text-slate-700">Applicable Interest Rate</span>
                  <span className="font-black text-[#0F4C81] text-xl">{applicableRate}% p.a.</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <span className="font-bold text-slate-700">
                    Total Principal Invested<br/>
                    <span className="text-xs text-slate-400">({amount} x {tenure} Months)</span>
                  </span>
                  <span className="font-black text-slate-800 text-xl">₹{totalPrincipal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <span className="font-bold text-slate-700">Estimated Interest Earned</span>
                  <span className="font-black text-emerald-600 text-xl">+ ₹{estimatedInterest.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center bg-[#0F4C81] text-white p-6 rounded-xl shadow-lg shadow-[#0F4C81]/20">
                  <span className="font-black tracking-wider uppercase">Estimated Maturity Value</span>
                  <span className="font-black text-3xl">₹{expectedMaturity.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-black uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-xl shadow-[#0F4C81]/20">
                Next: Nomination <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: NOMINATION */}
        {step === 4 && (
          <div className="p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b pb-4">Step 3: Nomination & Tax (DA-1)</h2>

            <div className="mb-8">
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <input 
                  type="checkbox" 
                  checked={addNominee} 
                  onChange={(e) => setAddNominee(e.target.checked)}
                  className="w-5 h-5 text-[#0F4C81] rounded focus:ring-[#0F4C81]"
                />
                <span className="font-bold text-slate-700">I want to add a Nominee for this deposit.</span>
              </label>

              {addNominee && (
                <div className="mt-6 grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nominee Full Name</label>
                    <input type="text" value={nomineeName} onChange={e => setNomineeName(e.target.value)} className="w-full p-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Relationship</label>
                    <select value={nomineeRelation} onChange={e => setNomineeRelation(e.target.value)} className="w-full p-3 border rounded-lg">
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nominee Age</label>
                    <input type="number" value={nomineeAge} onChange={e => setNomineeAge(e.target.value)} className="w-full p-3 border rounded-lg" />
                  </div>

                  {parseInt(nomineeAge) < 18 && (
                    <>
                      <div className="col-span-2 mt-2 pt-4 border-t border-slate-200">
                        <p className="text-xs text-rose-500 font-bold mb-4 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Minor Guardian Details Required</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Guardian Name</label>
                        <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} className="w-full p-3 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Guardian Relation</label>
                        <input type="text" value={guardianRelation} onChange={e => setGuardianRelation(e.target.value)} className="w-full p-3 border rounded-lg" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-slate-800 mb-4 border-b pb-2">Tax Declarations</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={linkPan} onChange={(e) => setLinkPan(e.target.checked)} className="w-5 h-5 mt-0.5 text-[#0F4C81] rounded focus:ring-[#0F4C81]" />
                <span className="text-sm font-medium text-slate-700">
                  <span className="font-bold text-slate-900 block">Link my existing PAN to this deposit.</span>
                  Apply standard TDS rules based on my profile.
                </span>
              </label>

              {isSenior && (
                <label className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 ml-8">
                  <input type="checkbox" checked={form15H} onChange={(e) => setForm15H(e.target.checked)} className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    <span className="font-bold block">Apply Digital Form 15H (Senior Citizen TDS Exemption)</span>
                    I digitally sign and declare that my income is below the taxable limit.
                  </span>
                </label>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-black uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-xl shadow-[#0F4C81]/20">
                Next: Verify & Pay <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SECURITY */}
        {step === 5 && (
          <div className="p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b pb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#0F4C81]" /> Step 4: Final Confirmation
            </h2>

            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-8 cursor-pointer">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="w-5 h-5 mt-0.5 text-[#0F4C81] rounded focus:ring-[#0F4C81]" />
              <span className="text-sm font-medium text-slate-700">
                I agree to the Terms & Conditions and authorize the Society to auto-debit my Savings Account monthly.
              </span>
            </label>

            <div className="bg-white border-2 border-slate-100 p-8 rounded-2xl text-center shadow-lg">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-4">Security Verification</h3>
              
              {!otpSent ? (
                <button 
                  onClick={handleSendOtp}
                  disabled={!termsAccepted}
                  className="px-8 py-4 bg-[#0F4C81] text-white rounded-xl font-black uppercase tracking-wider hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send OTP to Email
                </button>
              ) : (
                <div>
                  <p className="text-sm text-slate-600 mb-4 font-medium">An OTP has been sent to your registered email address.</p>
                  <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-14 text-center text-2xl font-black text-[#0F4C81] bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#0F4C81] focus:ring-0 outline-none"
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-400 mb-6">
                    {otpTimer > 0 ? `⏱️ Resend OTP in 00:${otpTimer < 10 ? '0'+otpTimer : otpTimer}` : <button onClick={handleSendOtp} className="text-[#0F4C81] hover:underline">Resend OTP</button>}
                  </p>

                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || otp.join('').length !== 6}
                    className="w-full md:w-auto px-12 py-4 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
                  >
                    {isSubmitting ? 'Verifying...' : 'Authorize & Open Deposit'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button onClick={() => setStep(4)} className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: SUCCESS */}
        {step === 6 && successData && (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Congratulations!</h2>
            <p className="text-slate-600 font-medium mb-8">Your Recurring Deposit has been successfully created and sent for final approval.</p>

            <div id="rd-receipt-card" className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-bold text-slate-500 text-sm">Account Number</span>
                <span className="font-black text-[#0F4C81] font-mono">{successData.rdNumber || 'Pending'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-bold text-slate-500 text-sm">Installment</span>
                <span className="font-black text-slate-800">₹{amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-bold text-slate-500 text-sm">Auto-Debit Date</span>
                <span className="font-black text-slate-800">{autoDebitDate}th of every month</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-slate-500 text-sm">Tenure</span>
                <span className="font-black text-slate-800">{tenure} Months</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={handleDownloadReceipt} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                ⬇️ Download E-Receipt
              </button>
              <button onClick={() => setCurrentTab('deposits')} className="px-6 py-3 bg-[#0F4C81] text-white rounded-xl font-bold hover:bg-blue-900 transition-colors">
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
