import React from 'react';
import { Users, Sprout, Briefcase, HeartHandshake } from 'lucide-react';

interface ImpactItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  stats: string;
  statsLabel: string;
}

export const CommunityImpact: React.FC = () => {

  const impacts: ImpactItem[] = [
    {
      id: 'impact-shg',
      icon: <Users className="h-6 w-6" />,
      title: "Women Self-Help Groups",
      desc: "Empowering rural women with micro-credit lines, skills training, and collective financial independence programs.",
      stats: '1,200+',
      statsLabel: "Active Groups"
    },
    {
      id: 'impact-agri',
      icon: <Sprout className="h-6 w-6" />,
      title: "Agricultural Subsidies",
      desc: "Providing low-interest crop loans, tractor financing, and seasonal cash advances for local farming families.",
      stats: '₹45 Cr',
      statsLabel: "Funds Disbursed"
    },
    {
      id: 'impact-micro',
      icon: <Briefcase className="h-6 w-6" />,
      title: "Micro-Enterprise Growth",
      desc: "Supporting street vendors and small shop owners with daily collection accounts and collateral-free starter loans.",
      stats: '8,500+',
      statsLabel: "Businesses Funded"
    },
    {
      id: 'impact-welfare',
      icon: <HeartHandshake className="h-6 w-6" />,
      title: "Financial Literacy Camps",
      desc: "Conducting regular awareness workshops on savings, digital banking safety, and cooperative governance rights.",
      stats: '50+',
      statsLabel: "Annual Camps"
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
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest block mb-2">{"Social Responsibility"}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {"Cooperative Community Impact"}
          </h2>
          <p className="text-slate-600">
            {"We dedicate a portion of our profits and extensive resources to drive financial inclusion, micro-enterprise growth, and rural development across the communities we serve."}
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
                  <span className="text-xl font-black text-emerald-600">{impact.stats}</span>
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
