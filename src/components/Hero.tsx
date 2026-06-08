import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../App';

interface HeroProps {
  setCurrentTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ setCurrentTab }) => {
  const { t } = useLanguage();
  const [slideIndex, setSlideIndex] = useState(0);

  // Bank related images to slide every second (1000ms)
  const slides = [
    { url: '/gallery/odiyooru.png', alt: 'Community Event' },
    { url: '/gallery/odiyooru.png', alt: 'Community Event' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 1000ms delay as requested for every second sliding!
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative w-full min-h-[500px] md:min-h-[580px] lg:min-h-[620px] flex items-center justify-start overflow-hidden bg-slate-900">

      {/* 1. Big Background Image Slider (rotating every second) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={slideIndex}
            className="absolute inset-0 w-full h-full"
            initial={{ x: "100%", y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: "-100%", y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <img
              src={slides[slideIndex].url}
              alt={slides[slideIndex].alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
};
