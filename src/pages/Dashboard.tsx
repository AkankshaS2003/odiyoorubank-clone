import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ShieldAlert, Award, CheckSquare, X } from 'lucide-react';
import { MembershipCard } from '../components/MembershipCard';
import { EligibilityDashboard } from '../components/LoanEligibility/EligibilityDashboard';
import { IdCard } from '../components/IdCard';
import { PaymentModal } from '../components/PaymentModal';
import { AddFundsModal } from '../components/AddFundsModal';
import { SavingsSummaryCard } from '../components/SavingsSummaryCard';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const { user, isAuthenticated, getUserServiceApplications } = useAuth();
  const [showCard, setShowCard] = useState(false);
  const [savedReport, setSavedReport] = useState<any>(null);
  const [showSavedReport, setShowSavedReport] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [serviceApps, setServiceApps] = useState<any[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      if (isAuthenticated && getUserServiceApplications) {
        const apps = await getUserServiceApplications();
        setServiceApps(apps);
      }
    };
    fetchApps();
  }, [isAuthenticated]);

  const fetchUserStats = async () => {
    // A function to re-fetch user profile could be here,
    // assuming Context's update function isn't readily available for the specific user
    // For now we assume a refresh or context update will handle the new states
  };

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

  return (
    <section className="min-h-screen pb-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Member Greeting Details Panel */}
        <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">{"Active Customer Portal"}</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user.fullName}</h2>

              <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-slate-500 font-semibold">
                <span>{"Customer ID:"} {user.customerId || 'Not Assigned'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setCurrentTab('home')}
              className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              {"Return to Website"}
            </button>
            <button
              onClick={() => setCurrentTab('products')}
              className="px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              {"View Products"}
            </button>
          </div>
        </div>

        {/* Initial Deposit Check */}
        {user.isKycVerified && !user.minimumBalancePaid && (
          <div className="bg-amber-50 border border-amber-200 p-6 md:p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
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

        {user.membershipStatus === 'pending' && (
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm mb-8 flex flex-col items-center">
            <div className="w-full text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Membership Application Pending</h3>
              <p className="text-sm text-slate-500">Your membership application has been submitted and is currently pending admin approval. Please check back later.</p>
            </div>
          </div>
        )}

        {user.membershipStatus === 'approved' && !showCard && (
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm mb-8 flex flex-col items-center">
            <h4 className="font-extrabold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              {"Membership Approved!"}
            </h4>
            <p className="text-sm text-slate-500 mb-6 text-center">Your application has been successful and your ID card has been generated.</p>
            <button
              onClick={() => setShowCard(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-colors"
            >
              Click Here
            </button>
          </div>
        )}

        {user.membershipStatus === 'approved' && showCard && (
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm mb-8 flex flex-col items-center">
            <div className="w-full mb-6 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-secondary" />
                  {"Digital Membership Card"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">{"Official society shareholder ID. Keep this secure."}</p>
              </div>
            </div>
            <IdCard 
              user={{ fullName: user.fullName, customerId: user.customerId || '', phone: user.phone, dob: user.dob, profileImageBase64: user.profileImageBase64, address: user.address }} 
              membership={{ memberId: user.memberId || 'MEM-001', issuedDate: new Date().toISOString() }} 
            />
          </div>
        )}

        {/* Saved Report Section */}
        {savedReport && (
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckSquare className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900">{"Saved Eligibility Report"}</h4>
                <p className="text-sm text-slate-500 mt-1">Generated on {new Date(savedReport.date).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSavedReport(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md transition-colors whitespace-nowrap"
            >
              View Eligibility Report
            </button>
          </div>
        )}

        {/* Dashboard Profile Layout */}
        <div className="grid grid-cols-1 gap-8 mb-8">

          {/* Account Information */}
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-6">
              <h4 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <span>{"Account Details"}</span>
              </h4>
              <button 
                onClick={() => setShowAddFundsModal(true)}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
              >
                + Add Funds
              </button>
            </div>

            <div className="space-y-4">
              {/* Balances */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Savings</span>
                  <span className="text-lg font-black text-[#0A315C]">₹{(user.savingsBalance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Fixed Deposit</span>
                  <span className="text-lg font-black text-[#0A315C]">₹{(user.fdBalance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Recurring Dep.</span>
                  <span className="text-lg font-black text-[#0A315C]">₹{(user.rdBalance || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">{"Customer ID"}</span>
                <span className="text-sm font-bold text-slate-900">{user.customerId || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">{"Full Name"}</span>
                <span className="text-sm font-bold text-slate-900">{user.fullName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">{"Email Address"}</span>
                <span className="text-sm font-bold text-slate-900">{user.email}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">{"Account Number"}</span>
                <span className="text-sm font-bold text-slate-900">{user.accountNumber || 'Pending'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">{"IFSC Code"}</span>
                <span className="text-sm font-bold text-slate-900">{user.ifscCode || 'Pending'}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-sm font-semibold text-slate-500">{"Registered Branch"}</span>
                <span className="text-sm font-bold text-slate-900 text-right">{"Odiyooru Main Branch"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* My Applications Section */}
        {serviceApps.length > 0 && (
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm mb-8">
            <h4 className="font-extrabold text-lg text-slate-900 mb-6 flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span>{"My Loan & Deposit Applications"}</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-3 font-bold">Application Type</th>
                    <th className="p-3 font-bold">Date Submitted</th>
                    <th className="p-3 font-bold text-center">Status</th>
                    <th className="p-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceApps.map((app, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{app.applicationType}</td>
                      <td className="p-3 text-slate-600">{new Date(app.submittedAt).toLocaleDateString()}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide
                          ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'}
                        `}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {app.applicationType === 'Fixed Deposit' && app.status === 'Approved' && (
                          <button 
                            onClick={() => setCurrentTab(`view-fd-details|${app._id}`)}
                            className="px-3 py-1.5 bg-[#0F4C81] text-white text-[10px] font-bold uppercase rounded hover:bg-blue-900 transition-colors"
                          >
                            View Certificate
                          </button>
                        )}
                        {app.applicationType === 'Recurring Deposit' && app.status === 'Approved' && (
                          <button 
                            onClick={() => setCurrentTab(`view-rd-details|${app._id}`)}
                            className="px-3 py-1.5 bg-[#0F4C81] text-white text-[10px] font-bold uppercase rounded hover:bg-blue-900 transition-colors"
                          >
                            View Certificate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Saved Report Modal */}
      {showSavedReport && savedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-7xl bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Your Saved Eligibility Report</h3>
              <button onClick={() => setShowSavedReport(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <EligibilityDashboard
                formData={savedReport.formData}
                resultData={savedReport.resultData}
                onReset={() => {
                  localStorage.removeItem('odiyooru_saved_eligibility_report');
                  setSavedReport(null);
                  setShowSavedReport(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal 
          amount={500} 
          type="Initial Deposit" 
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            alert('Payment Successful! Your account is now active.');
            // Ideal: trigger context reload
            window.location.reload();
          }}
        />
      )}

      {showAddFundsModal && (
        <AddFundsModal
          onClose={() => setShowAddFundsModal(false)}
          onSuccess={() => {
            alert('Funds Added Successfully!');
            window.location.reload();
          }}
        />
      )}
    </section>
  );
};
