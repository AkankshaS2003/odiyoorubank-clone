import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Landmark } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  setCurrentTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ setCurrentTab }) => {
  const { t } = useLanguage();
  const { systemSettings } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    { url: '/hero-img-1.jpg', alt: 'Agriculture and Progress' },
    { url: '/hero-img-2.jpg', alt: 'Family and Pride' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative w-full min-h-[500px] md:min-h-[580px] lg:min-h-[620px] flex items-center justify-start overflow-hidden bg-[#0A315C]">

      {/* 1. Big Background Image Slider */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={slideIndex}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <img
              src={slides[slideIndex].url}
              alt={slides[slideIndex].alt}
              className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Color Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A315C] via-[#0A315C]/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A315C] via-transparent to-transparent z-10" />

      {/* 3. Text Overlay Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-white w-full flex flex-col justify-center select-none pt-12">
        <div className="max-w-2xl space-y-5">
          
          <div className="inline-flex items-center space-x-1.5 text-white text-[10px] font-black uppercase tracking-widest leading-none mb-2">
            <Landmark className="h-3 w-3 text-[#ED7F1E]" />
            <span>{t('Cooperative Trust & Progress')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.1] text-white">
            {systemSettings?.heroTitle || 'Odiyooru Souharda'}
            <span className="text-[#ED7F1E] block mt-1">
              {systemSettings?.heroDesc || 'Cooperative Society Ltd'}
            </span>
          </h1>



          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => {
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-[#ED7F1E] hover:bg-[#d66a10] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer group"
            >
              <span>{t('Explore Products')}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};
