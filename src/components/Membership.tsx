import React, { useState } from 'react';
import { Award, CheckCircle2, BadgePercent } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MembershipModal } from './MembershipModal';

interface MembershipProps {
  setCurrentTab: (tab: string) => void;
}

export const Membership: React.FC<MembershipProps> = ({ setCurrentTab }) => {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBecomeMemberClick = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      setCurrentTab('login');
    }
  };

  const benefits = [
    {
      title: "Democratic Voting Rights",
      desc: "Each shareholder member receives equal voting power at our Annual General Body meetings to elect board governance."
    },
    {
      title: "Annual Profit Sharing & Dividends",
      desc: "Society profits are distributed back to member shareholders as competitive cash dividends pro-rata to share capital."
    },
    {
      title: "Priority Interest Bonuses",
      desc: "Receive an additional +0.50% interest return premium on standard Fixed and Recurring Deposits."
    },
    {
      title: "Subsidized Loan Processing",
      desc: "Enjoy priority queues, minimal evaluation checklists, and zero prepayment penalties on all loans."
    }
  ];

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-100/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-sm font-bold text-primary uppercase tracking-widest block">{"Cooperative Pride"}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {"Don't Just Be a Customer. Be a Co-Owner."}
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {"Unlike commercial retail banks, our cooperative credit society is owned and managed directly by our members."}
              </p>

              <div className="space-y-4 pt-2">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start space-x-3 bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                    <div className="mt-1 h-5 w-5 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-0.5">{b.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive CTA Card Column */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-b from-primary to-primary-dark text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-[450px]">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/15 rounded-full blur-xl"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="bg-white/10 border border-white/20 p-3 rounded-2xl w-12 h-12 flex items-center justify-center">
                    <Award className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-extrabold font-sans">{"Become a Member Today"}</h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {"Invest a minimum of ₹10,000 in society share capital to instantly register as an active legal shareholder. Experience transparent community growth and financial security."}
                  </p>
                </div>

                <div className="space-y-4 pt-6 relative z-10">
                  <div className="flex items-center space-x-3 text-xs bg-white/5 border border-white/10 p-3 rounded-xl">
                    <BadgePercent className="h-5 w-5 text-secondary shrink-0" />
                    <span>{"Receive up to 12% annual dividend disburser payouts!"}</span>
                  </div>
                  
                  <button
                    onClick={handleBecomeMemberClick}
                    className="w-full py-4 bg-white hover:bg-slate-50 text-primary hover:text-primary-dark font-extrabold rounded-xl shadow-lg transition-all transform active:scale-95 text-center block text-sm"
                  >
                    {"Become Member Shareholder"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <MembershipModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};
