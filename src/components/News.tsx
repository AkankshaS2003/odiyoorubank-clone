import React from 'react';
import { Calendar, ArrowUpRight, Megaphone, Users, Landmark } from 'lucide-react';
import { useLanguage } from '../App';

export const News: React.FC = () => {
  const { t } = useLanguage();

  const newsItems = [
    {
      id: 1,
      tag: t('news1_tag'),
      icon: Megaphone,
      date: 'May 28, 2026',
      title: t('news1_title'),
      desc: t('news1_desc')
    },
    {
      id: 2,
      tag: t('news2_tag'),
      icon: Users,
      date: 'May 15, 2026',
      title: t('news2_title'),
      desc: t('news2_desc')
    },
    {
      id: 3,
      tag: t('news3_tag'),
      icon: Landmark,
      date: 'May 02, 2026',
      title: t('news3_title'),
      desc: t('news3_desc')
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
                className="bg-white rounded-3xl overflow-hidden border border-slate-150 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  
                  {/* Tag & Date */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {news.tag}
                    </span>
                    <div className="flex items-center space-x-1.5 text-slate-400 font-semibold">
                      <Calendar className="h-4 w-4" />
                      <span>{news.date}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-primary transition-colors cursor-pointer">
                    {news.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {news.desc}
                  </p>

                </div>

                <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-between items-center text-xs font-bold text-primary cursor-pointer hover:bg-slate-100/50 transition-colors">
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
