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
                src="/about_hero2.png" 
                alt="Cooperative Society Staff" 
                className="w-full h-full object-cover filter brightness-95"
              />
            </div>
            
            {/* Image 2: Overlapping bottom right */}
            <div className="absolute bottom-0 right-0 w-[70%] h-[200px] sm:h-[250px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-20 transition-all duration-700 ease-in-out group-hover:scale-[1.05] group-hover:translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2">
              <img 
                src="/about_section2_left.png" 
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
            
            {/* Custom Card containing the 2 paragraphs of detailed history */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-300/80">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0A315C]"></div>
              
              <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-bold">
                Odiyoor Sri Vividhoddesha Souharda Sahakari Sangha Niyamitha was established on 20-04-2011 inaugurated and blessed by the founder his Holyness Shree Shree Gurudevananda Swamiji Odiyoor Samsthanam, Odiyoor. Having its Head office @ Odiyoor and Regional office at Pumpwell Mangaluru.
              </p>
              
              <p className="text-slate-650 text-xs sm:text-sm leading-relaxed font-semibold">
                Odiyoor Sri Vividhoddesha Souharda Sahakari Sangha Niyamitha was Established on 20-04-2011 has been a saga of farsighted vision, dedication, sacrifice, motivation, leadership and hard work on the party is founder President, Lion Sri A. Suresh Rai and all the Directors on the Board as well as Chief Executive Officer Mr Dyananda Shetty Bakrabail. Lion Sri A. Suresh Rai is the founder President since Inspection dt 20-04-2011 for period 2011 – 2016 and re-elected unanimously as President for the Period 2016 – 2021 , again re-elected unanimously as President for the Period 2021 – 2025. He is handling the post of President for more than a decade. During the tenure of Lion Sri A .Suresh Rai‘s Presidency our Sahakari have been honoured and awarded twice . 1) Best Federal Co-op society award sponsored by State Federal co-op Zone Year 2018-2019. 2) Best Federal Co-op society award 2022 under 69th All India Cooperative Sapthaha 2022 dt 18-11-2022 sponsored by Dakshina Kannada District Central Co-op Bank award honored and presented by Sri S. T. Somashekara Minister for co-op State and Dr M. N. Rajendrakumar President Dakshina Kannada District Central Co- op Bank Mangaluru.
              </p>
            </div>
            
          </div>

        </div>
      </div>
      
    </section>
  );
};
