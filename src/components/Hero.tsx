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
    <section className="relative w-full h-screen min-h-[500px] flex items-start justify-start overflow-hidden bg-black">

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
              className="w-full h-full object-cover filter brightness-[0.5]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Color Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

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

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => {
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-[#ED7F1E] hover:bg-[#d66a10] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer group"
            >
              <span>{"Explore Products"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};
