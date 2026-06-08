import React from 'react';
import { Smartphone, Send, UserCheck, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../App';

interface DigitalBankingProps {
  setCurrentTab: (tab: string) => void;
}

export const DigitalBanking: React.FC<DigitalBankingProps> = ({ setCurrentTab }) => {
  const { t } = useLanguage();
  
  const services = [
    {
      icon: Smartphone,
      title: t('mob_sim_title'),
      desc: t('mob_sim_desc')
    },
    {
      icon: Send,
      title: t('instant_title'),
      desc: t('instant_desc')
    },
    {
      icon: UserCheck,
      title: t('ekyc_title'),
      desc: t('ekyc_desc')
    },
    {
      icon: FileText,
      title: t('statement_title'),
      desc: t('statement_desc')
    }
  ];

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Detail Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-sm font-bold text-primary uppercase tracking-widest block">{t('fintech_core')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {t('nextgen_title')}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {t('nextgen_desc')}
            </p>

            <div className="space-y-3 pt-2">
              {[
                t('ekyc_point'),
                t('transfer_point'),
                t('ledger_point'),
                t('forms_point')
              ].map((point, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="h-4.5 w-4.5 text-accent shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md transition-all transform active:scale-95 text-sm"
            >
              <Smartphone className="h-4.5 w-4.5" />
              <span>{t('launch_portal')}</span>
            </button>
          </div>

          {/* Right Service Grid Column */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div 
                  key={i} 
                  className="bg-white p-6 rounded-3xl border border-slate-150 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/15"
                >
                  <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5">{svc.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{svc.desc}</p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
