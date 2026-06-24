import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  setCurrentTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ setCurrentTab }) => {
  const { systemSettings } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    { url: '/hero-img-1.png', alt: 'Agriculture and Progress' },
    { url: '/hero-img-2.jpg', alt: 'Family and Pride' },
    { url: '/hero-img-3.png', alt: 'Community Village' },
    { url: '/hero-img-4.png', alt: 'Tractor and Agricultural Farming' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative w-full h-screen min-h-[500px] flex items-start justify-start overflow-hidden bg-slate-900">

      {/* 1. Big Background Image Slider */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={slideIndex}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <img
              src={slides[slideIndex].url}
              alt={slides[slideIndex].alt}
              className="w-full h-full object-cover filter brightness-[0.8]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Color Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />

      {/* 3. Text Overlay Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-white w-full flex flex-col justify-start select-none pt-12 md:pt-16">
        <div className="max-w-2xl space-y-5">
          
          <div className="inline-flex items-center space-x-1.5 text-white text-[10px] font-black uppercase tracking-widest leading-none mb-2">
            <Landmark className="h-3 w-3 text-[#ED7F1E]" />
            <span>{"Cooperative Trust & Progress"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.1] text-white">
            {systemSettings?.heroTitle || 'Odiyooru Souharda'}
            <span className="text-[#ED7F1E] block mt-1">
              {systemSettings?.heroDesc || 'Cooperative Society Ltd'}
            </span>
          </h1>

          <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed max-w-xl">
            Empowering families, strengthening community and building a better tomorrow together.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => {
                setCurrentTab('apply-account');
              }}
              className="px-6 py-3.5 bg-[#ED7F1E] hover:bg-[#d66a10] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer group"
            >
              <span>{"Open Bank Account"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer group"
            >
              <span>{"Explore Products"}</span>
            </button>
          </div>
        </div>

        {/* 4 Feature Columns at the bottom */}
        <div className="mt-16 border-t border-white/10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl pb-8">
          <div className="flex flex-col items-center justify-center text-center space-y-3 group border-r border-white/10 last:border-0 border-transparent md:border-white/10">
            <div className="text-[#ED7F1E]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M12 22s-2-2-2-4 2-4 2-4 2 2 2 4-2 4-2 4z"></path></svg>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Community<br/>Driven</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-3 group border-r border-white/10 last:border-0 border-transparent md:border-white/10">
            <div className="text-[#ED7F1E]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Trust &<br/>Transparency</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-3 group border-r border-white/10 last:border-0 border-transparent md:border-white/10">
            <div className="text-[#ED7F1E]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line><path d="M12 4 8 8"></path><path d="M12 4l4 4"></path></svg>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Sustainable<br/>Growth</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-3 group">
            <div className="text-[#ED7F1E]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"></path><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path><path d="m21 3 1 11h-2"></path><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"></path><path d="M3 4h8"></path></svg>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Together For<br/>A Better Future</span>
          </div>
        </div>
      </div>

    </section>
  );
};
