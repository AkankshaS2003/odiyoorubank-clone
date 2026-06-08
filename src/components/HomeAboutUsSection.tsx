import React from 'react';
import { Landmark } from 'lucide-react';

interface HomeAboutUsSectionProps {
  setCurrentTab: (tab: string) => void;
}

export const HomeAboutUsSection: React.FC<HomeAboutUsSectionProps> = ({ setCurrentTab }) => {
  const handleKnowMore = () => {
    setCurrentTab('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-white min-h-[calc(100vh-80px)] flex items-center justify-center py-16 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
          
          {/* Left Column: Image with rounded corners and double border frame matching reference image */}
          <div className="md:col-span-5 flex justify-center w-full group">
            <div className="w-full max-w-md bg-white p-2.5 border border-slate-200 rounded-[28px] sm:rounded-[36px] shadow-xl overflow-hidden aspect-[4/3] relative transition-all duration-700 ease-in-out group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-slate-300">
              <div className="w-full h-full overflow-hidden rounded-[20px] sm:rounded-[28px] relative z-10">
                <img 
                  src="/about_hero2.png" 
                  alt="Odiyooru Souharda Cooperative Society Inauguration" 
                  className="w-full h-full object-cover filter brightness-95 transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Bank Content styled exactly like the Gurukula reference image */}
          <div className="md:col-span-7 text-left space-y-5">
            
            {/* Top Pill Badge: EST. ODIYUR */}
            <div>
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-[#0A315C]/5 text-[#0A315C] border border-[#0A315C]/20 rounded-full text-xs font-bold tracking-wider">
                <Landmark className="h-3.5 w-3.5" />
                <span>EST. ODIYUR</span>
              </span>
            </div>
            
            {/* Header: ABOUT ODIYOORU */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase font-heading leading-tight tracking-tight text-slate-850">
                ABOUT <span className="text-[#0A315C]">ODIYOORU</span>
              </h2>
              {/* Custom orange accent line */}
              <div className="w-16 h-1 bg-[#ED7F1E] rounded-full"></div>
            </div>
            
            {/* Dynamic Paragraph: Exact website content kept unmodified */}
            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-semibold pt-1">
              Odiyooru Souharda Cooperative Society Ltd is a premier cooperative financial institution established on 20-04-2011, dedicated to empowering communities and micro-merchants through reliable deposits, gold loans, and absolute financial security. Guided by values of trust, progress, and co-ownership, we have been a trusted partner in rural growth and self-reliance for over a decade.
            </p>
            
            {/* More Info button with navbar blue color */}
            <div className="pt-2">
              <button
                onClick={handleKnowMore}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0A315C] hover:bg-[#072444] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-300 transform active:scale-95 cursor-pointer group"
              >
                <span>More Info</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
