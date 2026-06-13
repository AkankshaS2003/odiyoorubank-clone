import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserCheck, ShieldAlert } from 'lucide-react';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated || !user) {
    return (
      <section className="min-h-screen pb-16 flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-150 p-8 rounded-3xl shadow-xl text-center space-y-4 max-w-md w-full">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">{t('access_restricted')}</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            {t('access_restricted_desc')}
          </p>
          <button
            onClick={() => setCurrentTab('login')}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md transition-colors"
          >
            {t('go_to_login')}
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
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Active Member Portal</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user.fullName}</h2>
              
              <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-slate-500 font-semibold">
                <span>Member ID: {user.memberId || 'ODI-M-84931'}</span>
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

        {/* Dashboard Profile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Account Information */}
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-extrabold text-lg text-slate-900 mb-6 flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>Account Details</span>
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Member ID</span>
                <span className="text-sm font-bold text-slate-900">{user.memberId || 'ODI-M-84931'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Full Name</span>
                <span className="text-sm font-bold text-slate-900">{user.fullName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Phone</span>
                <span className="text-sm font-bold text-slate-900">{user.phone}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">Account Type</span>
                <span className="text-sm font-bold text-slate-900">Savings Account</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-sm font-semibold text-slate-500">Registered Branch</span>
                <span className="text-sm font-bold text-slate-900 text-right">Odiyooru Main Branch</span>
              </div>
            </div>
          </div>

          {/* Quick Support / Contact */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 rounded-3xl shadow-lg text-white flex flex-col justify-center">
            <h4 className="font-extrabold text-2xl mb-4">Need Assistance?</h4>
            <p className="text-base text-slate-300 mb-8 leading-relaxed">
              Our support team is available 24/7 to help you with your account inquiries, branch details, and general services.
            </p>
            <button 
              onClick={() => setCurrentTab('contact')}
              className="w-max px-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-md transition-colors hover:bg-slate-100"
            >
              Contact Support
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
