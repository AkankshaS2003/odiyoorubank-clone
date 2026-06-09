import React from 'react';
import { Users, Sprout, Briefcase, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../App';

interface ImpactItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  stats: string;
  statsLabel: string;
}

export const CommunityImpact: React.FC = () => {
  const { t } = useLanguage();

  const impacts: ImpactItem[] = [
    {
      id: 'impact-shg',
      icon: <Users className="h-6 w-6" />,
      title: t('impact_shg_title'),
      desc: t('impact_shg_desc'),
      stats: '1,200+',
      statsLabel: t('impact_shg_stats')
    },
    {
      id: 'impact-agri',
      icon: <Sprout className="h-6 w-6" />,
      title: t('impact_agri_title'),
      desc: t('impact_agri_desc'),
      stats: '₹45 Cr',
      statsLabel: t('impact_agri_stats')
    },
    {
      id: 'impact-micro',
      icon: <Briefcase className="h-6 w-6" />,
      title: t('impact_micro_title'),
      desc: t('impact_micro_desc'),
      stats: '8,500+',
      statsLabel: t('impact_micro_stats')
    },
    {
      id: 'impact-welfare',
      icon: <HeartHandshake className="h-6 w-6" />,
      title: t('impact_welfare_title'),
      desc: t('impact_welfare_desc'),
      stats: '50+',
      statsLabel: t('impact_welfare_stats')
    }
  ];

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest block mb-2">{t('impact_badge')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {t('impact_main_title')}
          </h2>
          <p className="text-slate-600">
            {t('impact_main_desc')}
          </p>
        </div>

        {/* Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {impacts.map((impact) => (
            <div 
              key={impact.id}
              className="bg-white border border-slate-100 p-8 rounded-3xl flex flex-col justify-between shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-100 group"
            >
              <div>
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl inline-flex mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                  {impact.icon}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">{impact.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{impact.desc}</p>
              </div>

              <div className="border-t border-slate-100 pt-5 mt-auto">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-emerald-600">{impact.stats}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{impact.statsLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
