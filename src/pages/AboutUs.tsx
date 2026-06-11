import React from 'react';
import { Landmark, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AboutUsProps {
  setCurrentTab: (tab: string) => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ setCurrentTab }) => {
  const handleBackToHome = () => {
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-slate-50 min-h-screen">
      
      {/* 1. Widescreen Hero Section with a Random Image Background & Back to Home Button & Centered Title */}
      <div className="relative h-[240px] sm:h-[320px] w-full overflow-hidden flex items-center justify-center p-6 sm:p-8">
        
        {/* Background random image */}
        <img 
          src="/about_hero1.png" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.3] scale-105"
        />
        
        {/* Blue color overlay matching the user's reference image */}
        <div className="absolute inset-0 bg-[#0A315C]/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A315C]/90 via-[#0A315C]/50 to-transparent"></div>
        
        {/* Top Left: Back to Home Button (Absolutely positioned to allow perfect centering) */}
        <button 
          onClick={handleBackToHome}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full text-xs font-bold transition-all duration-300 focus:outline-none backdrop-blur-xs transform active:scale-95 cursor-pointer"
          title="Back to Home"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-white" />
          <span>Back to Home</span>
        </button>
        
        {/* Horizontal & Vertical Center: Hero Title Overlay & Breadcrumb */}
        <div className="relative z-10 text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-heading uppercase drop-shadow-md">
            About Us
          </h1>
          <p className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
            Home • About Us
          </p>
        </div>
        
      </div>

      {/* 2. Premium Grid Section: Left Overlapping Images & Right Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Overlapping Photos exactly like reference image (experience badge removed) with hover animations */}
          <div className="lg:col-span-5 relative w-full h-[380px] sm:h-[450px] group">
            
            {/* Image 1: Main background / Left side */}
            <div className="absolute top-0 left-0 w-[78%] h-[280px] sm:h-[340px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-10 transition-all duration-700 ease-in-out group-hover:scale-[1.03] group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:rotate-1">
              <img 
                src="gallery/odiyooru.png" 
                alt="Cooperative Society Staff" 
                className="w-full h-full object-cover filter brightness-95"
              />
            </div>
            
            {/* Image 2: Overlapping bottom right */}
            <div className="absolute bottom-0 right-0 w-[70%] h-[200px] sm:h-[250px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-20 transition-all duration-700 ease-in-out group-hover:scale-[1.05] group-hover:translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2">
              <img 
                src="gallery/y1.png" 
                alt="Prosperity and Trust Emblem" 
                className="w-full h-full object-cover filter brightness-95"
              />
            </div>
            
          </div>

          {/* Right Column: Dynamic Text & Beautiful Card containing the 2 paragraphs of detailed history */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Top Caps Sublabel */}
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0A315C] bg-[#0A315C]/10 px-3 py-1 rounded-full border border-[#0A315C]/20 inline-block">
              Society About
            </span>
            
            {/* Rotating Flower Grid Container */}
            <div className="relative w-full max-w-[420px] sm:max-w-[480px] aspect-square mx-auto mt-8 sm:mt-12 group [animation:spin_24s_linear_infinite] hover:[animation-play-state:paused]">
              
              {/* Central Hub (Stamen) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-[#0A315C] to-primary rounded-full shadow-2xl z-0 flex items-center justify-center [animation:spin_24s_linear_infinite_reverse] group-hover:[animation-play-state:paused] border-4 border-white">
                <Landmark className="h-6 w-6 text-white" />
              </div>

              {/* Petal 1: Foundation (Top Left) */}
              <div className="absolute top-0 left-0 w-[47%] h-[47%] [animation:spin_24s_linear_infinite_reverse] group-hover:[animation-play-state:paused] z-10">
                <div className="w-full h-full bg-white p-4 sm:p-5 border border-slate-200 shadow-lg transition-transform duration-500 hover:scale-[1.4] hover:z-50 hover:shadow-2xl hover:border-primary/50 rounded-tl-[50px] rounded-br-[20px] rounded-tr-xl rounded-bl-xl flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#0A315C] opacity-0 hover:opacity-100 transition-opacity"></div>
                  <h3 className="text-[#0A315C] font-bold text-[13px] sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0A315C]/10 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                    Foundation
                  </h3>
                  <p className="text-slate-650 text-[10px] sm:text-[11px] leading-relaxed font-semibold">
                    Established on 20-04-2011, inaugurated and blessed by Founder His Holiness Shree Shree Gurudevananda Swamiji. Head office at Odiyoor and Regional office at Pumpwell, Mangaluru.
                  </p>
                </div>
              </div>

              {/* Petal 2: Leadership (Top Right) */}
              <div className="absolute top-0 right-0 w-[47%] h-[47%] [animation:spin_24s_linear_infinite_reverse] group-hover:[animation-play-state:paused] z-10">
                <div className="w-full h-full bg-white p-4 sm:p-5 border border-slate-200 shadow-lg transition-transform duration-500 hover:scale-[1.4] hover:z-50 hover:shadow-2xl hover:border-primary/50 rounded-tr-[50px] rounded-bl-[20px] rounded-tl-xl rounded-br-xl flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#0A315C] opacity-0 hover:opacity-100 transition-opacity"></div>
                  <h3 className="text-[#0A315C] font-bold text-[13px] sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0A315C]/10 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                    Leadership
                  </h3>
                  <p className="text-slate-650 text-[10px] sm:text-[11px] leading-relaxed font-semibold">
                    A saga of farsighted vision, dedication, and hard work by Founder President, Lion Sri A. Suresh Rai, the Directors, and Chief Executive Officer Mr. Dyananda Shetty Bakrabail.
                  </p>
                </div>
              </div>

              {/* Petal 3: Legacy (Bottom Left) */}
              <div className="absolute bottom-0 left-0 w-[47%] h-[47%] [animation:spin_24s_linear_infinite_reverse] group-hover:[animation-play-state:paused] z-10">
                <div className="w-full h-full bg-white p-4 sm:p-5 border border-slate-200 shadow-lg transition-transform duration-500 hover:scale-[1.4] hover:z-50 hover:shadow-2xl hover:border-primary/50 rounded-bl-[50px] rounded-tr-[20px] rounded-tl-xl rounded-br-xl flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#0A315C] opacity-0 hover:opacity-100 transition-opacity"></div>
                  <h3 className="text-[#0A315C] font-bold text-[13px] sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0A315C]/10 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                    Legacy
                  </h3>
                  <p className="text-slate-650 text-[10px] sm:text-[11px] leading-relaxed font-semibold">
                    Lion Sri A. Suresh Rai has served as President since inception, unanimously re-elected for the 2016-2021 and 2021-2025 terms, handling the post with excellence for over a decade.
                  </p>
                </div>
              </div>

              {/* Petal 4: Excellence (Bottom Right) */}
              <div className="absolute bottom-0 right-0 w-[47%] h-[47%] [animation:spin_24s_linear_infinite_reverse] group-hover:[animation-play-state:paused] z-10">
                <div className="w-full h-full bg-white p-4 sm:p-5 border border-slate-200 shadow-lg transition-transform duration-500 hover:scale-[1.4] hover:z-50 hover:shadow-2xl hover:border-primary/50 rounded-br-[50px] rounded-tl-[20px] rounded-tr-xl rounded-bl-xl flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#0A315C] opacity-0 hover:opacity-100 transition-opacity"></div>
                  <h3 className="text-[#0A315C] font-bold text-[13px] sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0A315C]/10 flex items-center justify-center text-[10px] font-black shrink-0">4</span>
                    Excellence
                  </h3>
                  <p className="text-slate-650 text-[10px] sm:text-[11px] leading-relaxed font-semibold">
                    Honoured with the Best Federal Co-op Society Award (2018-2019) and the 2022 Award by Dakshina Kannada District Central Co-op Bank during this Presidency.
                  </p>
                </div>
              </div>

            </div>
            
          </div>

        </div>
      </div>
      
    </section>
  );
};
