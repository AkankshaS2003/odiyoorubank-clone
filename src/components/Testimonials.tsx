import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  branch: string;
  rating: number;
  review: string;
  role: string;
}

export const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const reviews: Testimonial[] = [
    {
      id: 1,
      name: t('rev1_name'),
      role: t('rev1_role'),
      branch: t('rev1_branch'),
      rating: 5,
      review: t('rev1_review')
    },
    {
      id: 2,
      name: t('rev2_name'),
      role: t('rev2_role'),
      branch: t('rev2_branch'),
      rating: 5,
      review: t('rev2_review')
    },
    {
      id: 3,
      name: t('rev3_name'),
      role: t('rev3_role'),
      branch: t('rev3_branch'),
      rating: 5,
      review: t('rev3_review')
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      
      {/* Background patterns */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{t('member_voices')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {t('trusted_by')}
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative bg-slate-50 border border-slate-150 p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-100/30 flex flex-col items-center">
          
          <Quote className="h-10 w-10 text-primary/10 mb-6 shrink-0" />

          {/* Testimonial Active Slide */}
          <div className="text-center min-h-[160px] flex flex-col justify-center animate-fade-in">
            <p className="text-base md:text-lg text-slate-700 italic leading-relaxed mb-6">
              "{reviews[activeIndex].review}"
            </p>
            
            {/* Rating */}
            <div className="flex justify-center space-x-1.5 mb-4">
              {[...Array(reviews[activeIndex].rating)].map((_, i) => (
                <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-base">{reviews[activeIndex].name}</h4>
              <p className="text-xs font-semibold text-primary">{reviews[activeIndex].role}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{reviews[activeIndex].branch}</p>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center space-x-4 mt-8">
            <button 
              onClick={handlePrev}
              className="p-2.5 rounded-full border border-slate-200 hover:bg-white text-slate-600 hover:text-primary transition-all shadow-sm"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex space-x-1.5">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all ${idx === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-slate-300'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                ></button>
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="p-2.5 rounded-full border border-slate-200 hover:bg-white text-slate-600 hover:text-primary transition-all shadow-sm"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
