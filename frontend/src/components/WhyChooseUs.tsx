import React from 'react';
import { ShieldCheck, Users, Landmark, Zap, Gift, Headphones } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {

  const benefits = [
    {
      icon: ShieldCheck,
      title: "RBI Compliant Practices",
      desc: "Operated in strict compliance with Cooperative Credit guidelines and audited regularly by state authorities."
    },
    {
      icon: Users,
      title: "Trusted Cooperative Ethos",
      desc: "Owned by members, for members. We prioritize community wealth creation over commercial banking profits."
    },
    {
      icon: Landmark,
      title: "PAN India Operations",
      desc: "Expanding network of branches and doorstep collections agents supporting rural and urban micro-entrepreneurs."
    },
    {
      icon: Zap,
      title: "Swift Loan Disbursements",
      desc: "Gold loans processed in 30 minutes. Transparent valuation checklists with lowest processing fees."
    },
    {
      icon: Gift,
      title: "Industry-Best Deposit Rates",
      desc: "Enjoy highest-in-class interest rates on Fixed and Recurring Deposits.\nCompounding interest that helps your wealth grow faster and more securely."
    },
    {
      icon: Headphones,
      title: "Dedicated Local Support",
      desc: "Get assistance from friendly bank tellers and localized customer relationship executives at every branch."
    }
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{"Core Pillars"}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {"Securing Your Financial Legacy With Trust"}
          </h2>
          <p className="text-slate-600">
            {"For over two decades, thousands of families have relied on our credit society to grow their financial capital."}
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
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{b.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
