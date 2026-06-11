import React from 'react';
import { Calendar, ArrowUpRight, Megaphone, Users, Landmark } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const News: React.FC = () => {
  const { t } = useLanguage();

  const newsItems = [
    {
      id: 1,
      tag: t('news1_tag'),
      icon: Megaphone,
      date: 'May 28, 2026',
      title: t('news1_title'),
      desc: t('news1_desc'),
      color: 'orange'
    },
    {
      id: 2,
      tag: t('news2_tag'),
      icon: Users,
      date: 'May 15, 2026',
      title: t('news2_title'),
      desc: t('news2_desc'),
      color: 'blue'
    },
    {
      id: 3,
      tag: t('news3_tag'),
      icon: Landmark,
      date: 'May 02, 2026',
      title: t('news3_title'),
      desc: t('news3_desc'),
      color: 'orange'
    }
  ];

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{t('society_journal')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {t('latest_news')}
          </h2>
          <p className="text-slate-600">
            {t('news_desc')}
          </p>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((news) => {
            const Icon = news.icon;
            return (
              <div 
                key={news.id}
                className={`${news.color === 'orange' ? 'bg-[#f97316] text-white border-[#ea580c]' : 'bg-[#0A315C] text-white border-[#061d38]'} rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between`}
              >
                <div className="p-6 space-y-4">
                  
                  {/* Tag & Date */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-white/20 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {news.tag}
                    </span>
                    <div className="flex items-center space-x-1.5 text-white/80 font-semibold">
                      <Calendar className="h-4 w-4" />
                      <span>{news.date}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug hover:text-white/80 transition-colors cursor-pointer">
                    {news.title}
                  </h3>
                  
                  <p className="text-xs text-white/80 leading-relaxed">
                    {news.desc}
                  </p>

                </div>

                <div className="border-t border-white/10 p-4 bg-white/5 flex justify-between items-center text-xs font-bold text-white cursor-pointer hover:bg-white/10 transition-colors">
                  <span>{t('read_article')}</span>
                  <ArrowUpRight className="h-4.5 w-4.5" />
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
