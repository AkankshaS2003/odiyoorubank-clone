import React from 'react';
import { Calendar, Megaphone, Users, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const News: React.FC = () => {
  const { systemSettings } = useAuth();

  const liveAnnouncements = systemSettings?.announcements?.filter((ann: any) => ann.isPublished !== false) || [];

  const newsItems = liveAnnouncements.length > 0 
    ? liveAnnouncements.map((ann: any, index: number) => ({
        id: index,
        tag: 'Notice',
        icon: Megaphone,
        date: new Date(ann.publishedAt || Date.now()).toLocaleDateString(),
        title: ann.title,
        desc: ann.desc,
        color: index % 2 === 0 ? 'orange' : 'blue'
      })).reverse() // Show newest first
    : [
        {
          id: 1,
          tag: "Interest Rates",
          icon: Megaphone,
          date: 'May 28, 2026',
          title: "Cooperative Fixed Deposit Rates Increased to 8.50%",
          desc: "Our governing board has authorized an upward adjustment in FD yield returns to protect capital value for member families.",
          color: 'orange'
        },
        {
          id: 2,
          tag: "Awareness",
          icon: Users,
          date: 'May 15, 2026',
          title: "Financial Literacy Program Conducted in Rural Hubs",
          desc: "Held simulated training workshops supporting over 300+ women micro-entrepreneurs on savings structures and credit pathways.",
          color: 'blue'
        },
        {
          id: 3,
          tag: "Expansion",
          icon: Landmark,
          date: 'May 02, 2026',
          title: "New Digital Doorstep Banking Service Sanctioned",
          desc: "Launched mobile collection systems allowing members to deposit savings and pay EMIs directly through certified agents.",
          color: 'orange'
        }
      ];

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{"Society Journal"}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {"Latest News & Society Announcements"}
          </h2>
          <p className="text-slate-600">
            {"Stay informed about our dividend declarations, financial awareness drives, and system upgrades."}
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
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
