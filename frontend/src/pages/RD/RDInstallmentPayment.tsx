import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Printer, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

const InputField = ({ label, name, type = "text", value, onChange, placeholder = "", readOnly = false }: any) => {
  let displayValue = value || '';
  if (type === 'date' && displayValue) {
    const d = new Date(displayValue);
    if (!isNaN(d.getTime())) {
      displayValue = d.toISOString().split('T')[0];
    }
  }

  return (
    <div className="mb-3">
      <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        name={name}
        value={displayValue}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] bg-white ${readOnly ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500' : ''}`}
      />
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, options }: any) => (
  <div className="mb-3">
    <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] bg-white"
    >
      <option value="">Select Option</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const RDInstallmentPayment: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  // Fetched Details
  const [customer, setCustomer] = useState<any>(null);
  const [rd, setRd] = useState<any>(null);
  const [savingsAccount, setSavingsAccount] = useState<any>(null);
  const [nextInstallment, setNextInstallment] = useState<any>(null);

  // Editable Form Details
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [declarationAgree, setDeclarationAgree] = useState(false);

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setErrorMsg('Please enter a Customer ID');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setCustomer(null);
    setRd(null);
    setSavingsAccount(null);
    setNextInstallment(null);
    setAmountPaid('');
    setPaymentMode('');
    setSuccessData(null);
    clearSignature();

    try {
      const res = await api.get(`/rd/search-by-customer/${searchId.trim()}`);
      if (res.data.success) {
        const d = res.data.data;
        setCustomer(d.customer);
        setRd(d.rd);
        setSavingsAccount(d.linkedSavingsAccount);
        setNextInstallment(d.nextInstallment);
        if (d.nextInstallment) {
          setAmountPaid(d.nextInstallment.totalPayable.toString());
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'No active RD found or Customer ID is invalid.');
    } finally {
      setLoading(false);
    }
  };

  // Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0F4C81';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !rd || !nextInstallment) return;

    setErrorMsg(null);

    // Signature removed

    if (!declarationAgree) {
      setErrorMsg('You must agree to the declaration checkbox.');
      return;
    }

    const signatureBase64 = '';

    setLoading(true);

    try {
      if (parseFloat(amountPaid) !== nextInstallment.totalPayable) {
        setErrorMsg(`Payment amount must exactly match the total payable amount of ₹${nextInstallment.totalPayable}`);
        setLoading(false);
        return;
      }

      const payload = {
        customerId: customer.id,
        rdId: rd.id,
        installmentId: nextInstallment.id,
        amountPaid: parseFloat(amountPaid),
        paymentMode,
        remarks,
        signatureBase64
      };

      const res = await api.post('/rd/pay-installment', payload);
      if (res.data.success) {
        // Calculate next due date for receipt since backend doesn't return it
        const currentDueDate = new Date(nextInstallment.dueDate);
        currentDueDate.setMonth(currentDueDate.getMonth() + 1);
        const nextDueDateStr = currentDueDate.toLocaleDateString('en-GB');

        setSuccessData({
          ...res.data.data,
          nextDueDate: nextDueDateStr
        });
        // Reset Search details or allow receipt load
        setCustomer(null);
        setRd(null);
        setNextInstallment(null);
        setSavingsAccount(null);
        setAmountPaid('');
        setPaymentMode('');
        setRemarks('');
        setDeclarationAgree(false);
        clearSignature();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-receipt');
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    window.location.reload(); // Restore React state
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100/30">
      
      {/* Visual Header Banner */}
      <div className="border-b border-[#0F4C81] pb-6 mb-8 text-center">
        <h1 className="text-xl md:text-2xl font-black text-[#0F4C81] uppercase tracking-wider">
          Odiyooru Souharda Cooperative Society Ltd.
        </h1>
        <p className="text-xs text-slate-500 font-bold tracking-widest mt-1">
          RECURRING DEPOSIT (RD) MONTHLY INSTALLMENT PAYMENT FORM
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start space-x-2 text-sm">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Verification Row */}
      {!successData && (
        <div className="mb-8 border border-slate-200 rounded-xl p-5 bg-slate-50/50">
          <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 uppercase tracking-wider">
            1. Customer Verification
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end max-w-md">
            <div className="flex-grow">
              <InputField
                label="Customer ID"
                placeholder="e.g. CUST502921"
                value={searchId}
                onChange={(e: any) => setSearchId(e.target.value)}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-5 py-2.5 bg-[#0F4C81] hover:bg-sky-950 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0 h-[38px] mb-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Receipt State */}
      {successData && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start space-x-2 text-sm">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold">Installment Paid Successfully! The receipt is displayed below.</span>
          </div>

          {/* Printable Slip Container */}
          <div id="printable-receipt" className="border border-slate-300 rounded-2xl p-6 bg-slate-50 max-w-2xl mx-auto shadow-sm relative overflow-hidden">
            
            {/* Bank seal watermarked styling */}
            <div className="absolute right-6 top-6 w-32 h-32 border-4 border-emerald-600/10 text-emerald-600/10 rounded-full flex items-center justify-center font-bold text-[10px] tracking-widest uppercase rotate-12 select-none pointer-events-none">
              Bank Seal Checked
            </div>

            <div className="border-b border-[#0F4C81] pb-4 mb-4 text-center">
              <h2 className="text-base font-black text-[#0F4C81] uppercase tracking-wider">
                Odiyooru Souharda Cooperative Society Ltd.
              </h2>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest">
                OFFICIAL PAYMENT RECEIPT
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs font-semibold text-[#0F4C81] border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Receipt Number</span>
                <span className="font-mono">{successData.receiptNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Transaction ID</span>
                <span className="font-mono">{successData.transactionId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Payment Ref</span>
                <span className="font-mono">{successData.paymentReference}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Payment Date</span>
                <span>{new Date(successData.paymentDate).toLocaleString('en-GB')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs text-slate-700 pb-4 mb-4 border-b border-slate-200">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Customer Name</span>
                <span className="font-bold text-[#0F4C81]">{successData.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Customer ID</span>
                <span className="font-bold text-[#0F4C81]">{successData.customerId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">RD Account Number</span>
                <span className="font-mono font-bold text-[#0F4C81]">{successData.rdNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Installment Paid</span>
                <span className="font-bold text-[#0F4C81]">Installment #{successData.installmentNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Payment Mode</span>
                <span className="font-bold text-[#0F4C81]">{successData.paymentMode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Next Due Date</span>
                <span className="font-bold text-[#0F4C81]">{successData.nextDueDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-[#0F4C81] bg-slate-200/50 p-3 rounded-lg mb-6">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Installment Amount</span>
                <span>₹{successData.installmentAmount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Penalty Charged</span>
                <span>₹{successData.penaltyAmount}</span>
              </div>
              <div className="border-l border-slate-300 pl-4">
                <span className="text-slate-400 block text-[9px] uppercase">Total Paid</span>
                <span className="text-emerald-700 font-black">₹{successData.totalAmountPaid}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 items-end">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase mb-1">Customer Signature</span>
                <div className="h-16 border border-slate-200 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={successData.signatureBase64} alt="Signature" className="max-h-full object-contain" />
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block border-t border-slate-400 pt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8">
                  Authorized Signatory
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-[#0F4C81] hover:bg-sky-950 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Download / Print Receipt
            </button>
            <button
              onClick={() => setSuccessData(null)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Details Form */}
      {customer && rd && nextInstallment && (
        <form onSubmit={handlePayment} className="space-y-8">
          
          {/* Read-Only Details Panel */}
          <div className="border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 uppercase tracking-wider">
              2. Verified Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Customer Name" value={customer.name} readOnly />
              <InputField label="RD Account Number" value={rd.rdNumber} readOnly />
              <InputField label="Linked Savings Account" value={savingsAccount ? savingsAccount.accountNumber : 'Not Linked'} readOnly />
              <InputField label="Branch" value="Main Branch" readOnly />
              <InputField label="Mobile Number" value={customer.mobile} readOnly />
              <InputField label="Email ID" value={customer.email} readOnly />
              <InputField label="Monthly Installment Amount" value={`₹${rd.monthlyAmount}`} readOnly />
              <InputField label="Interest Rate" value={`${rd.interestRate}% p.a.`} readOnly />
              <InputField label="RD Tenure" value={`${rd.tenureMonths} Months`} readOnly />
              <InputField label="Opening Date" value={rd.openingDate} type="date" readOnly />
              <InputField label="Next Due Date" value={nextInstallment.dueDate} type="date" readOnly />
              <InputField label="Installments Paid" value={rd.installmentsPaid} readOnly />
              <InputField label="Pending Installments" value={rd.pendingInstallments} readOnly />
              <InputField label="Overdue Installments" value={rd.overdueInstallments} readOnly />
              <InputField label="Current RD Status" value={rd.status} readOnly />
            </div>
          </div>

          {/* Payment Section */}
          <div className="border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-black text-white bg-[#0F4C81] px-3 py-1 inline-block rounded mb-4 uppercase tracking-wider">
              3. Installment Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Installment Number" value={`Installment #${nextInstallment.installmentNumber}`} readOnly />
              <InputField label="Payment Date" value={new Date().toLocaleDateString('en-GB')} readOnly />
              <InputField label="Due Date" value={nextInstallment.dueDate} type="date" readOnly />
              <InputField label="Installment Amount" value={`₹${nextInstallment.amount}`} readOnly />
              <InputField label="Penalty Amount (Auto Overdue)" value={`₹${nextInstallment.penalty}`} readOnly />
              <InputField label="Total Amount Payable" value={`₹${nextInstallment.totalPayable}`} readOnly />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 pt-4">
              <InputField
                label="Amount Paid"
                placeholder={`Enter exactly ${nextInstallment.totalPayable}`}
                value={amountPaid}
                onChange={(e: any) => setAmountPaid(e.target.value)}
              />
              <SelectField
                label="Payment Mode"
                name="paymentMode"
                value={paymentMode}
                onChange={(e: any) => setPaymentMode(e.target.value)}
                options={['Cash', 'Transfer from Linked Savings Account', 'UPI', 'Net Banking']}
              />
            </div>
            <div className="mt-3">
              <InputField
                label="Remarks (Optional)"
                placeholder="Enter transaction details or notes"
                value={remarks}
                onChange={(e: any) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {/* Signature Removed */}

          {/* Declaration Section */}
          <div className="border border-slate-200 rounded-xl p-5 bg-blue-50/50">
            <h3 className="text-xs font-black text-[#0F4C81] mb-2 uppercase tracking-wider">
              5. Declaration
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium italic mb-4">
              "I hereby declare that the above payment is being made by me towards my Recurring Deposit account. I confirm that the information provided is correct and I authorize the bank to process this installment payment."
            </p>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0F4C81]">
              <input
                type="checkbox"
                checked={declarationAgree}
                onChange={(e) => setDeclarationAgree(e.target.checked)}
                className="rounded border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81] h-4 w-4"
              />
              I Agree to the Declaration.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !paymentMode}
            className="w-full py-3 bg-[#0F4C81] hover:bg-sky-950 text-white font-extrabold rounded-xl shadow-lg transition-all transform active:scale-95 text-center flex items-center justify-center text-sm disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Pay Installment'
            )}
          </button>

        </form>
      )}

    </div>
  );
};
