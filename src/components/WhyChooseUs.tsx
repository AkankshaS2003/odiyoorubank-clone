import React from 'react';
import { ShieldCheck, Users, Landmark, Zap, Gift, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const WhyChooseUs: React.FC = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: ShieldCheck,
      title: t('rbi_title'),
      desc: t('rbi_desc')
    },
    {
      icon: Users,
      title: t('coop_title'),
      desc: t('coop_desc')
    },
    {
      icon: Landmark,
      title: t('pan_title'),
      desc: t('pan_desc')
    },
    {
      icon: Zap,
      title: t('swift_title'),
      desc: t('swift_desc')
    },
    {
      icon: Gift,
      title: t('best_title'),
      desc: t('best_desc')
    },
    {
      icon: Headphones,
      title: t('support_title'),
      desc: t('support_desc')
    }
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{t('core_pillars')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {t('why_title')}
          </h2>
          <p className="text-slate-600">
            {t('why_desc')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div 
                key={i}
                className="p-6 bg-slate-50 border border-slate-150 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 group"
              >
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
