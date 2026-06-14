import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserCheck, ShieldAlert, Award } from 'lucide-react';
import { MembershipCard } from '../components/MembershipCard';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [showCard, setShowCard] = useState(false);

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
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">{t('Active Customer Portal')}</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user.fullName}</h2>
              
              <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-slate-500 font-semibold">
                <span>{t('Customer ID:')} {user.memberId || 'ODI-M-84931'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setCurrentTab('home')}
              className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              {t('Return to Website')}
            </button>
            <button
              onClick={() => setCurrentTab('products')}
              className="px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              {t('View Products')}
            </button>
          </div>
        </div>

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
              {t('Membership Approved!')}
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
                  {t('Digital Membership Card')}
                </h4>
                <p className="text-xs text-slate-500 mt-1">{t('Official society shareholder ID. Keep this secure.')}</p>
              </div>
            </div>
            <MembershipCard />
          </div>
        )}

        {/* Dashboard Profile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Account Information */}
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-extrabold text-lg text-slate-900 mb-6 flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>{t('Account Details')}</span>
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">{t('Customer ID')}</span>
                <span className="text-sm font-bold text-slate-900">{user.memberId || 'ODI-M-84931'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">{t('Full Name')}</span>
                <span className="text-sm font-bold text-slate-900">{user.fullName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-500">{t('Email Address')}</span>
                <span className="text-sm font-bold text-slate-900">{user.email}</span>
              </div>

              <div className="flex justify-between items-center pb-1">
                <span className="text-sm font-semibold text-slate-500">{t('Registered Branch')}</span>
                <span className="text-sm font-bold text-slate-900 text-right">{t('Odiyooru Main Branch')}</span>
              </div>
            </div>
          </div>

          {/* Quick Support / Contact */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 rounded-3xl shadow-lg text-white flex flex-col justify-center">
            <h4 className="font-extrabold text-2xl mb-4">{t('Need Assistance?')}</h4>
            <p className="text-base text-slate-300 mb-8 leading-relaxed">
              {t('Our support team is available 24/7 to help you with your account inquiries, branch details, and general services.')}
            </p>
            <button 
              onClick={() => setCurrentTab('contact')}
              className="w-max px-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-md transition-colors hover:bg-slate-100"
            >
              {t('Contact Support')}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
