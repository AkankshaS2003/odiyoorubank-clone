import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Printer, DownloadCloud, Landmark, User, FileText, CreditCard, ShieldCheck } from 'lucide-react';

export const RDDetailsPage = ({ appId, setCurrentTab }: { appId: string, setCurrentTab: (tab: string) => void }) => {
  const { user } = useAuth();
  const [rdData, setRdData] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchRD = async () => {
      try {
        const res = await api.get(`/rd/${appId}`);
        if (res.data.success) {
          setRdData(res.data.data.rd);
          setInstallments(res.data.data.installments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRD();
  }, [appId]);

  const handlePayInstallment = async (installmentId: string, isRazorpay: boolean) => {
    setPaying(true);
    try {
      if (isRazorpay) {
        // Implement Razorpay checkout Flow
        const orderRes = await api.post('/rd/razorpay-order', { installmentId });
        if (orderRes.data.success) {
          const options = {
            key: orderRes.data.data.key_id,
            amount: orderRes.data.data.amount,
            currency: orderRes.data.data.currency,
            name: "Odiyooru Souharda",
            description: "RD Installment Payment",
            order_id: orderRes.data.data.id,
            handler: async function (response: any) {
              try {
                const verifyRes = await api.post('/rd/razorpay-verify', {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  installmentId
                });
                if (verifyRes.data.success) {
                  alert('Payment Successful!');
                  window.location.reload();
                }
              } catch (err) {
                alert('Payment Verification Failed');
              }
            },
            prefill: {
              name: user?.fullName,
              email: user?.email,
              contact: user?.phone
            },
            theme: { color: "#0F4C81" }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      } else {
        const res = await api.post('/rd/pay-savings', { installmentId });
        if (res.data.success) {
          alert('Installment paid successfully from Savings Account!');
          window.location.reload();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process payment');
    }
    setPaying(false);
  };

  const handleRequestSettlement = async (mode: string) => {
    try {
      const res = await api.post(`/rd/${appId}/settle`, { settlementMode: mode });
      if (res.data.success) {
        alert('Settlement requested successfully!');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request settlement');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-[#0F4C81]">Loading RD Details...</div>;
  }

  if (!rdData) {
    return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">RD Account not found</h2>
      <button onClick={() => setCurrentTab('dashboard')} className="px-6 py-2 bg-[#0F4C81] text-white rounded-lg">Return to Dashboard</button>
    </div>;
  }

  const startDateStr = formatDate(rdData.depositDate);
  const maturityDateStr = rdData.maturityDate ? formatDate(rdData.maturityDate) : 'N/A';
  
  const paidCount = installments.filter(i => i.status === 'Paid').length;
  const pendingCount = installments.filter(i => i.status === 'Pending').length;
  const overdueCount = installments.filter(i => i.status === 'Overdue').length;
  const nextPending = installments.find(i => i.status === 'Pending' || i.status === 'Overdue');
  const nextDueDateStr = nextPending ? formatDate(nextPending.dueDate) : 'None';

  const SectionTitle = ({ title, icon: Icon }: any) => (
    <h3 className="text-xs font-black text-white bg-[#0F4C81] px-4 py-2 inline-flex items-center gap-2 rounded-t-lg mt-6 mb-0 uppercase tracking-wider border-b-2 border-[#0F4C81]">
      <Icon className="w-4 h-4" /> {title}
    </h3>
  );

  const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <div className="flex flex-col sm:flex-row justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-sm font-bold text-[#0F4C81] text-right">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8 text-slate-800">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentTab('my_rds')} className="text-sm font-bold text-slate-500 hover:text-[#0F4C81]">← Back to My RDs</button>
        </div>

        <div className="bg-white p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100 rounded-3xl">
          
          <div className="bg-[#EAF6FF] rounded-2xl p-6 border border-blue-100 mb-8">
            <div className="flex justify-between items-center mb-6 border-b border-blue-200 pb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">RD Account Number</p>
                <p className="text-2xl font-black text-[#0F4C81]">{rdData.rdNumber || 'Pending Approval'}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm ${
                rdData.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                rdData.status === 'Matured' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-200 text-slate-700'
              }`}>
                {rdData.status}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Monthly Amount</p>
                <p className="text-lg font-bold text-slate-800 mt-1">₹{rdData.monthlyAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Deposited</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">₹{rdData.totalDeposited.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Installments</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{rdData.tenureMonths}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Paid / Pending</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{paidCount} / {pendingCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Overdue</p>
                <p className="text-lg font-bold text-rose-600 mt-1">{overdueCount}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <SectionTitle title="Deposit Information" icon={FileText} />
              <div className="border border-t-0 border-[#0F4C81] p-5 rounded-b-lg space-y-1 bg-slate-50/50">
                <InfoRow label="Interest Rate" value={`${rdData.interestRate}% p.a.`} />
                <InfoRow label="Deposit Date" value={startDateStr} />
                <InfoRow label="Maturity Date" value={maturityDateStr} />
                <InfoRow label="Estimated Maturity Amount" value={`₹${rdData.maturityAmount?.toLocaleString('en-IN') || 0}`} />
                <InfoRow label="Linked Savings A/c" value={rdData.linkedSavingsAccount?.accountNumber} />
                <InfoRow label="Auto Debit" value={rdData.autoDebit ? 'Enabled' : 'Disabled'} />
              </div>
            </div>

            <div>
              <SectionTitle title="Nominee Details" icon={ShieldCheck} />
              <div className="border border-t-0 border-[#0F4C81] p-5 rounded-b-lg space-y-1 bg-slate-50/50">
                <InfoRow label="Nominee Name" value={rdData.nomineeDetails?.name} />
                <InfoRow label="Relationship" value={rdData.nomineeDetails?.relation} />
              </div>
            </div>
          </div>

          {/* INSTALLMENTS SCHEDULE */}
          <SectionTitle title="Installment Schedule" icon={CreditCard} />
          <div className="border border-t-0 border-[#0F4C81] rounded-b-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-bold border-b border-slate-200">No.</th>
                    <th className="p-4 font-bold border-b border-slate-200">Due Date</th>
                    <th className="p-4 font-bold border-b border-slate-200">Amount</th>
                    <th className="p-4 font-bold border-b border-slate-200">Penalty</th>
                    <th className="p-4 font-bold border-b border-slate-200">Status</th>
                    <th className="p-4 font-bold border-b border-slate-200">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {installments.map((inst, index) => (
                    <tr key={inst._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-700">{inst.installmentNumber}</td>
                      <td className="p-4">{formatDate(inst.dueDate)}</td>
                      <td className="p-4 font-bold text-[#0F4C81]">₹{inst.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-rose-500 font-bold">₹{inst.penalty || 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          inst.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          inst.status === 'Overdue' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {(inst.status === 'Pending' || inst.status === 'Overdue') && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handlePayInstallment(inst._id, false)}
                              disabled={paying}
                              className="text-[10px] px-3 py-1.5 bg-[#0F4C81] text-white rounded font-bold hover:bg-blue-900 transition-colors"
                            >
                              Pay via Savings
                            </button>
                            <button 
                              onClick={() => handlePayInstallment(inst._id, true)}
                              disabled={paying}
                              className="text-[10px] px-3 py-1.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition-colors"
                            >
                              Pay via Razorpay
                            </button>
                          </div>
                        )}
                        {inst.status === 'Paid' && (
                          <span className="text-xs text-slate-400 font-bold">
                            Paid on {formatDate(inst.paidDate)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MATURITY OPTIONS */}
          {rdData.status === 'Matured' && (
            <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-black text-emerald-800 mb-2">Congratulations! Your RD has matured.</h3>
              <p className="text-emerald-700 mb-6">Maturity Amount: <span className="font-bold text-xl">₹{rdData.maturityAmount?.toLocaleString('en-IN')}</span></p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => handleRequestSettlement('Transfer to Savings')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow hover:bg-emerald-700 transition-colors"
                >
                  Settle to Savings Account
                </button>
                <button 
                  onClick={() => handleRequestSettlement('Renew RD')}
                  className="px-6 py-3 bg-white text-emerald-700 border border-emerald-300 rounded-xl font-bold shadow hover:bg-emerald-50 transition-colors"
                >
                  Renew as New RD
                </button>
              </div>
            </div>
          )}
          
          {rdData.status === 'Pending Settlement Approval' && (
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
              <p className="text-blue-800 font-bold">Your settlement request is pending admin approval.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
