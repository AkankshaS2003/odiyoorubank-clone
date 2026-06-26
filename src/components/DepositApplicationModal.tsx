import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Clock, XCircle, PiggyBank, Calendar, Percent, CreditCard, User, Landmark } from 'lucide-react';
import api from '../services/api';

interface DepositApplicationModalProps {
  application: any;
  onClose: () => void;
}

export const DepositApplicationModal: React.FC<DepositApplicationModalProps> = ({ application, onClose }) => {
  const [actualDeposit, setActualDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchActualDeposit = async () => {
      if (application.status === 'Approved') {
        setLoading(true);
        try {
          if (application.applicationType === 'Recurring Deposit') {
            const rdRes = await api.get('/rd');
            if (rdRes.data.success) {
              const rds = rdRes.data.data;
              // Try to find the matching RD. Since we don't have a direct link, match by amount and close date.
              const formDataAmount = parseInt(application.formData?.amount || application.formData?.depositAmount || application.applicationData?.amount || '0', 10);
              const match = rds.find((rd: any) => rd.monthlyAmount === formDataAmount);
              if (match) setActualDeposit(match);
            }
          } else if (application.applicationType === 'Fixed Deposit') {
            const fdRes = await api.get('/fd/my');
            if (fdRes.data.success) {
              const fds = fdRes.data.data;
              const formDataAmount = parseInt(application.formData?.amount || application.formData?.depositAmount || application.applicationData?.amount || '0', 10);
              const match = fds.find((fd: any) => fd.principalAmount === formDataAmount);
              if (match) setActualDeposit(match);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchActualDeposit();
  }, [application]);

  const amount = parseInt(application.formData?.amount || application.formData?.depositAmount || application.applicationData?.amount || '0', 10);
  const tenure = parseInt(application.formData?.depositPeriod || application.applicationData?.tenureMonths || '12', 10);
  const interestRate = application.applicationType === 'Recurring Deposit' ? 7.75 : 8.5; // Defaults if pending

  const displayAmount = actualDeposit?.monthlyAmount || actualDeposit?.principalAmount || amount;
  const displayTenure = actualDeposit?.tenureMonths || tenure;
  const displayRate = actualDeposit?.interestRate || interestRate;
  const displayMaturityDate = actualDeposit?.maturityDate ? new Date(actualDeposit.maturityDate).toLocaleDateString() : 'Pending Approval';
  const displayMaturityAmount = actualDeposit?.maturityAmount ? `₹${actualDeposit.maturityAmount.toLocaleString('en-IN')}` : 'Calculated on Approval';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0F4C81] to-emerald-500"></div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <PiggyBank className="w-6 h-6 text-[#0F4C81]" />
              {application.applicationType} Details
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">
              Application ID: {application.applicationNo || application._id.substring(0, 8).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {loading ? (
            <div className="text-center py-8 text-slate-500 font-bold">Loading details...</div>
          ) : (
            <div className="space-y-8">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                application.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                application.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {application.status === 'Approved' ? <CheckCircle className="w-8 h-8 text-emerald-600" /> :
                 application.status === 'Rejected' ? <XCircle className="w-8 h-8 text-rose-600" /> :
                 <Clock className="w-8 h-8 text-amber-600" />}
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider mb-1">Status: {application.status}</h3>
                  <p className="text-xs font-medium opacity-80">
                    {application.status === 'Approved' 
                      ? 'Your deposit is active and earning interest.' 
                      : application.status === 'Rejected'
                      ? 'This application was not approved.'
                      : 'Your application is currently under review by our team.'}
                  </p>
                </div>
              </div>

              {/* Grid Details */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Deposit Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><CreditCard className="w-3 h-3" /> Amount</div>
                    <div className="font-black text-[#0F4C81] text-lg">₹{displayAmount.toLocaleString('en-IN')}</div>
                    {application.applicationType === 'Recurring Deposit' && <div className="text-[10px] text-slate-400 font-bold mt-1">per month</div>}
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Tenure</div>
                    <div className="font-black text-slate-800 text-lg">{displayTenure} <span className="text-sm">Months</span></div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Percent className="w-3 h-3" /> Interest Rate</div>
                    <div className="font-black text-emerald-600 text-lg">{displayRate}% <span className="text-sm text-emerald-600/70">p.a.</span></div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Landmark className="w-3 h-3" /> Maturity Amount</div>
                    <div className="font-black text-slate-800 text-sm md:text-base">{displayMaturityAmount}</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 md:col-span-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Maturity Date</div>
                    <div className="font-black text-slate-800 text-sm md:text-base">{displayMaturityDate}</div>
                  </div>
                </div>
              </div>

              {/* Other Details Table */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Additional Details</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  <div className="flex px-4 py-3 bg-white">
                    <span className="text-xs font-bold text-slate-500 w-1/3">Submitted On</span>
                    <span className="text-xs font-medium text-slate-800">{new Date(application.submittedAt).toLocaleString()}</span>
                  </div>
                  {actualDeposit && (
                    <div className="flex px-4 py-3 bg-slate-50">
                      <span className="text-xs font-bold text-slate-500 w-1/3">Account Number</span>
                      <span className="text-xs font-black font-mono text-[#0F4C81]">{actualDeposit.rdNumber || actualDeposit.fdNumber}</span>
                    </div>
                  )}
                  <div className="flex px-4 py-3 bg-white">
                    <span className="text-xs font-bold text-slate-500 w-1/3">Nominee Name</span>
                    <span className="text-xs font-medium text-slate-800">{application.formData?.nomineeName || actualDeposit?.nomineeDetails?.name || 'N/A'}</span>
                  </div>
                  <div className="flex px-4 py-3 bg-slate-50">
                    <span className="text-xs font-bold text-slate-500 w-1/3">Nominee Relation</span>
                    <span className="text-xs font-medium text-slate-800">{application.formData?.nomineeRelationship || actualDeposit?.nomineeDetails?.relation || 'N/A'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
