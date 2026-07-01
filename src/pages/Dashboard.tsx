import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserCheck, 
  ShieldAlert, 
  Award, 
  CheckSquare, 
  History, 
  FileText, 
  Briefcase, 
  ChevronRight,
  User,
  CreditCard,
  PiggyBank,
  BookOpen,
  ArrowRightLeft
} from 'lucide-react';
import { IdCard } from '../components/IdCard';
import { SavingsSummaryCard } from '../components/SavingsSummaryCard';
import { SavingsHistory } from './SavingsHistory';
import { PaymentModal } from '../components/PaymentModal';
import { DepositApplicationModal } from '../components/DepositApplicationModal';
import { RDInstallmentPayment } from './RD/RDInstallmentPayment';
import { FundTransfers } from './FundTransfers';
import { TpinSetupModal } from '../components/TpinSetupModal';
import { KeyRound, Unlock, Lock } from 'lucide-react';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
  setFdReceiptData?: (data: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab, setFdReceiptData }) => {
  const { user, isAuthenticated, getUserServiceApplications } = useAuth();
  
  const [activeSidebarTab, setActiveSidebarTab] = useState<'account' | 'membership' | 'transactions' | 'loans' | 'deposits' | 'rd-installment' | 'fund-transfers'>('account');
  const [serviceApps, setServiceApps] = useState<any[]>([]);
  const [showCard, setShowCard] = useState(false);
  const [savedReport, setSavedReport] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDepositApp, setSelectedDepositApp] = useState<any>(null);
  const [showTpinSetup, setShowTpinSetup] = useState(false);
  const [isTpinChangeMode, setIsTpinChangeMode] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      if (isAuthenticated && getUserServiceApplications) {
        const apps = await getUserServiceApplications();
        setServiceApps(apps);
      }
    };
    fetchApps();
  }, [isAuthenticated]);

  useEffect(() => {
    const reportStr = localStorage.getItem('odiyooru_saved_eligibility_report');
    if (reportStr) {
      try {
        setSavedReport(JSON.parse(reportStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <section className="min-h-screen pb-16 flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-150 p-8 rounded-3xl shadow-xl text-center space-y-4 max-w-md w-full">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">{"access_restricted"}</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            {"access_restricted_desc"}
          </p>
          <button
            onClick={() => setCurrentTab('login')}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md transition-colors"
          >
            {"go_to_login"}
          </button>
        </div>
      </section>
    );
  }

  const loanApps = serviceApps.filter(app => app.applicationType.includes('Loan'));
  const depositApps = serviceApps.filter(app => app.applicationType === 'Fixed Deposit' || app.applicationType === 'Recurring Deposit');

  const renderContent = () => {
    switch (activeSidebarTab) {
      case 'account':
        return (
          <div className="space-y-8">
            <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <UserCheck className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Active Customer Portal</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user.fullName}</h2>
                  <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-slate-500 font-semibold">
                    <span>Customer ID: {user.customerId || 'Not Assigned'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => setCurrentTab('home')}
                  className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Return to Website
                </button>
                <button
                  onClick={() => setCurrentTab('products')}
                  className="px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  View Products
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm">
              <h4 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2 mb-6">
                <UserCheck className="h-5 w-5 text-primary" />
                <span>Account Details</span>
              </h4>
              
              <div className="space-y-0 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Customer ID</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">{user.customerId || 'Not Assigned'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm">{user.fullName}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Account Number</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">{user.accountNumber || 'Not Assigned'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4 bg-blue-50/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Address</span>
                  <span className="font-bold text-slate-800 text-sm">{user.address || '—'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Bank Name</span>
                  <span className="font-bold text-slate-800 text-sm">Odiyooru Souharda Cooperative Society Ltd</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Branch Name</span>
                  <span className="font-bold text-slate-800 text-sm">{user.accountNumber ? 'Main Branch' : '—'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">IFSC Code</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">{user.ifscCode || 'Not Assigned'}</span>
                </div>
                
                {/* Additional Information */}
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Membership ID</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">{user.memberId || 'Not Assigned'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Contact</span>
                  <span className="font-bold text-slate-800 text-sm">{user.phone} <span className="text-slate-300 mx-2">|</span> {user.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center hover:bg-slate-50 transition-colors p-4 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 shrink-0 mb-1 sm:mb-0">Account Status</span>
                  <span className={`font-black text-sm uppercase tracking-wider ${user.accountNumber ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {user.accountNumber ? 'Active' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            {user.isKycVerified && !user.minimumBalancePaid && (
              <div className="bg-amber-50 border border-amber-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-lg font-bold text-amber-900 mb-1">Action Required: Minimum Balance Deposit</h3>
                  <p className="text-sm text-amber-700">Your account application has been approved! To activate your account fully, please deposit the minimum balance of ₹500.</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-6 py-3 bg-[#ED7F1E] hover:bg-[#d66a10] text-white rounded-xl font-bold shadow-md transition-colors shrink-0"
                >
                  Pay Initial Deposit
                </button>
              </div>
            )}


            {/* Transaction PIN Security Section */}
            <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm">
              <h4 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2 mb-6">
                <KeyRound className="h-5 w-5 text-indigo-600" />
                <span>Transaction PIN Security</span>
              </h4>
              
              <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${user.tpinLocked ? 'bg-red-50 border-red-200' : (user.tpinActive ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200')}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${user.tpinLocked ? 'bg-red-100 text-red-600' : (user.tpinActive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}`}>
                    {user.tpinLocked ? <Lock className="w-6 h-6" /> : (user.tpinActive ? <ShieldAlert className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />)}
                  </div>
                  <div>
                    <h5 className={`font-bold text-lg ${user.tpinLocked ? 'text-red-900' : (user.tpinActive ? 'text-emerald-900' : 'text-amber-900')}`}>
                      {user.tpinLocked ? 'Transaction PIN Locked' : (user.tpinActive ? 'Transaction PIN Active' : 'Transaction PIN Not Created')}
                    </h5>
                    <p className={`text-sm mt-1 max-w-md ${user.tpinLocked ? 'text-red-700' : (user.tpinActive ? 'text-emerald-700' : 'text-amber-700')}`}>
                      {user.tpinLocked 
                        ? 'Your TPIN has been locked due to multiple failed attempts. Please unlock it to resume transactions.'
                        : (user.tpinActive 
                            ? 'Your account is secured. You will need your 6-digit TPIN to authorize any financial transactions.' 
                            : 'Before performing any financial transaction, you must create your 6-digit Transaction PIN.')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                  {!user.tpinActive && !user.tpinLocked && (
                    <button
                      onClick={() => { setIsTpinChangeMode(false); setShowTpinSetup(true); }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-colors whitespace-nowrap"
                    >
                      Set Transaction PIN
                    </button>
                  )}
                  {user.tpinActive && !user.tpinLocked && (
                    <button
                      onClick={() => { setIsTpinChangeMode(true); setShowTpinSetup(true); }}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold shadow-sm transition-colors whitespace-nowrap"
                    >
                      Change PIN
                    </button>
                  )}
                  {user.tpinLocked && (
                    <button
                      onClick={() => { setIsTpinChangeMode(false); setShowTpinSetup(true); }}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 rounded-xl font-bold shadow-md transition-colors whitespace-nowrap"
                    >
                      <Unlock className="w-4 h-4" /> Unlock PIN
                    </button>
                  )}
                </div>
              </div>
            </div>

            <SavingsSummaryCard setCurrentTab={setCurrentTab} />
          </div>
        );
      
      case 'membership':
        return (
          <div className="space-y-8">
            {(!user.membershipStatus || user.membershipStatus === 'none') && (
              <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col items-center">
                <div className="w-full text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 text-slate-500 rounded-full mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Not a Member Yet</h3>
                  <p className="text-sm text-slate-500 mb-6">You haven't applied for a society membership yet. Become a member to unlock voting rights and dividends!</p>
                  <button
                    onClick={() => setCurrentTab('membership')}
                    className="px-6 py-3 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-xl font-bold shadow-md transition-colors inline-block"
                  >
                    Apply for Membership
                  </button>
                </div>
              </div>
            )}

            {user.membershipStatus === 'pending' && (
              <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col items-center">
                <div className="w-full text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Membership Application Pending</h3>
                  <p className="text-sm text-slate-500">Your membership application has been submitted and is currently pending admin approval. Please check back later.</p>
                </div>
              </div>
            )}

            {user.membershipStatus?.toLowerCase() === 'rejected' && (
              <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col items-center">
                <div className="w-full text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 text-rose-600 rounded-full mb-4">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Membership Application Rejected</h3>
                  <p className="text-sm text-slate-500 mb-6">Unfortunately, your membership application was not approved by the admin. Please review your details and apply again.</p>
                  <button
                    onClick={() => setCurrentTab('membership')}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-colors inline-block"
                  >
                    Apply Again
                  </button>
                </div>
              </div>
            )}

            {user.membershipStatus === 'approved' && !showCard && (
              <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col items-center">
                <h4 className="font-extrabold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Membership Approved!
                </h4>
                <p className="text-sm text-slate-500 mb-6 text-center">Your application has been successful and your ID card has been generated.</p>
                <button
                  onClick={() => setShowCard(true)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Click Here to View Card
                </button>
              </div>
            )}

            {user.membershipStatus === 'approved' && showCard && (
              <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col items-center">
                <div className="w-full mb-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                      <Award className="h-5 w-5 text-secondary" />
                      Digital Membership Card
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Official society shareholder ID. Keep this secure.</p>
                  </div>
                </div>
                <IdCard 
                  user={{ fullName: user.fullName, customerId: user.customerId || '', phone: user.phone, dob: user.dob, profileImageBase64: user.profileImageBase64, address: user.address }} 
                  membership={{ memberId: user.memberId || 'MEM-001', issuedDate: new Date().toISOString() }} 
                />
              </div>
            )}
          </div>
        );

      case 'transactions':
        return (
          <div className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden py-4">
            <div className="px-6 md:px-8 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                  <History className="h-5 w-5 text-primary" />
                  <span>Savings Transaction History</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">View all deposits, withdrawals, and interest credits</p>
              </div>
            </div>
            <div className="mt-4">
              <SavingsHistory setCurrentTab={setCurrentTab} />
            </div>
          </div>
        );

      case 'loans':
        return (
          <div className="space-y-8">
            {savedReport && (
              <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckSquare className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900">Saved Eligibility Report</h4>
                    <p className="text-sm text-slate-500 mt-1">Generated on {new Date(savedReport.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentTab('loan-eligibility')}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md transition-colors whitespace-nowrap"
                >
                  View Eligibility Report
                </button>
              </div>
            )}

            <div className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-slate-100">
                <h4 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span>Loan Applications</span>
                </h4>
              </div>
              
              {loanApps.length === 0 ? (
                <div className="p-8 text-center">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-slate-700">No Loan Applications</h3>
                  <p className="text-xs text-slate-500 mt-1">You haven't applied for any loans yet.</p>
                  <button onClick={() => setCurrentTab('products')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold">Apply Now</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Application ID</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Loan Type</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loanApps.map((app: any) => (
                        <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 text-xs text-slate-600 font-medium whitespace-nowrap">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {app.applicationNo || app._id.substring(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs font-bold text-slate-800">
                            {app.applicationType}
                          </td>
                          <td className="py-4 px-6 text-xs font-bold text-slate-800">
                            ₹{(app.formData?.amount || app.formData?.loanAmount || app.applicationData?.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                              app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                              app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {app.status === 'Approved' && (
                              <button
                                onClick={() => setCurrentTab(`view-loan-details|${app._id}`)}
                                className="px-4 py-2 bg-[#0F4C81] text-white hover:bg-blue-900 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                              >
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'deposits':
        return (
          <div className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden py-4">
            <div className="px-6 md:px-8 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  <span>Term Deposits (FD & RD)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">Manage your active fixed deposits and recurring deposits</p>
              </div>
            </div>
            
            {depositApps.length === 0 ? (
              <div className="p-8 text-center">
                <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-700">No Deposits Found</h3>
                <p className="text-xs text-slate-500 mt-1">You haven't applied for any term deposits yet.</p>
                <button onClick={() => setCurrentTab('products')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold">Apply Now</button>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Application ID</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Deposit Type</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {depositApps.map((app: any) => (
                      <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-xs text-slate-600 font-medium whitespace-nowrap">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {app.applicationNo || app._id.substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-800">
                          {app.applicationType}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-800">
                          ₹{(app.formData?.amount || app.formData?.depositAmount || app.applicationData?.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                            app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status === 'Approved' ? 'Active' : app.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {app.status === 'Approved' ? (
                            <button
                              onClick={() => setCurrentTab(app.applicationType === 'Fixed Deposit' ? `view-fd-details|${app._id}` : `view-rd-details|${app._id}`)}
                              className="px-4 py-2 bg-[#0F4C81] text-white hover:bg-blue-900 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                            >
                              View Details
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedDepositApp(app)}
                              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                            >
                              View Application
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'rd-installment':
        return <RDInstallmentPayment />;

      case 'fund-transfers':
        return <FundTransfers />;
    }
  };

  const navItems = [
    { id: 'account', label: 'Account Details', icon: User },
    { id: 'membership', label: 'Membership', icon: Award },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'loans', label: 'Loan Applications', icon: Briefcase },
    { id: 'deposits', label: 'Deposits Section', icon: PiggyBank },
    { id: 'rd-installment', label: 'RD Installment Payment', icon: ArrowRightLeft },
    { id: 'fund-transfers', label: 'Fund Transfers', icon: ArrowRightLeft },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white border border-slate-150 rounded-3xl p-4 shadow-sm sticky top-8">
              <h3 className="px-4 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Customer Portal</h3>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSidebarTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSidebarTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        isActive 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.label}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>

        </div>
      </div>
      
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          purpose="Initial Deposit"
          amount={500}
        />
      )}

      <TpinSetupModal 
        isOpen={showTpinSetup} 
        onClose={() => setShowTpinSetup(false)} 
        isChangeMode={isTpinChangeMode} 
      />
      
      {selectedDepositApp && (
        <DepositApplicationModal 
          application={selectedDepositApp} 
          onClose={() => setSelectedDepositApp(null)} 
        />
      )}
    </div>
  );
};
