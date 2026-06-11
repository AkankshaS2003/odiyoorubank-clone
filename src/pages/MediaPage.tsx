import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const MediaPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeImageIdx, setActiveImageIdx] = useState<number | null>(null);

  const galleryImages = [
    { url: '/gallery/y1.png', alt: 'Images' },
    { url: '/gallery/y2.jpg', alt: 'Images' },
    { url: '/gallery/y3.png', alt: 'Images' },
    { url: '/gallery/y4.png', alt: 'Images' },
    { url: '/gallery/y5.png', alt: 'Images' },
    { url: '/gallery/y7.png', alt: 'Images' },
    { url: '/gallery/y6.png', alt: 'Images' },
    { url: '/gallery/y8.png', alt: 'Images' }
  ];

  return (
    <section className="py-12 bg-white min-h-screen overflow-hidden">
      {/* Heading Section - Constrained Width */}
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-accent uppercase tracking-widest block">Event Highlights</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-heading">{t('Gallary')}</h2>
          <p className="text-slate-500 leading-relaxed text-xs max-w-xl mx-auto font-medium">
          </p>
        </div>
      </div>

      {/* Dynamic Gallery Section - Full Window Width */}
      <div className="w-full flex flex-col gap-6 pt-4">
        {/* First Row: Right to Left */}
        <div className="relative w-full flex overflow-hidden marquee-container">
          <div className="flex w-max animate-scroll-left">
            {[...galleryImages, ...galleryImages].map((img, idx) => (
              <div
                key={`row1-${idx}`}
                onClick={() => setActiveImageIdx(idx % galleryImages.length)}
                className="relative h-[25vh] md:h-[30vh] lg:h-[35vh] mx-2 sm:mx-3 rounded-3xl cursor-pointer shrink-0 transition-all hover:shadow-lg group/img overflow-hidden border border-slate-150"
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-full w-auto max-w-none object-cover grayscale transition-all duration-700 group-hover/img:grayscale-0 group-hover/img:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Second Row: Left to Right */}
        <div className="relative w-full flex overflow-hidden marquee-container">
          <div className="flex w-max animate-scroll-right">
            {[...galleryImages].reverse().concat([...galleryImages].reverse()).map((img, idx) => (
              <div
                key={`row2-${idx}`}
                onClick={() => setActiveImageIdx(galleryImages.length - 1 - (idx % galleryImages.length))}
                className="relative h-[25vh] md:h-[30vh] lg:h-[35vh] mx-2 sm:mx-3 rounded-3xl cursor-pointer shrink-0 transition-all hover:shadow-lg group/img overflow-hidden border border-slate-150"
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-full w-auto max-w-none object-cover grayscale transition-all duration-700 group-hover/img:grayscale-0 group-hover/img:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {activeImageIdx !== null && (
        <div
          onClick={() => setActiveImageIdx(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
        >
          {/* Close button */}
          <button
            onClick={() => setActiveImageIdx(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2.5 rounded-full border border-white/10 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIdx((prev) => (prev !== null && prev > 0) ? prev - 1 : galleryImages.length - 1);
            }}
            className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/10 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image container */}
          <div
            className="max-w-4xl w-full max-h-[80vh] flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[activeImageIdx].url}
              alt={galleryImages[activeImageIdx].alt}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/10 animate-scale-up"
            />
            <div className="text-center text-white space-y-1">
              <p className="text-[10px] text-white/60 font-medium">Image {activeImageIdx + 1} of {galleryImages.length}</p>
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIdx((prev) => (prev !== null && prev < galleryImages.length - 1) ? prev + 1 : 0);
            }}
            className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/10 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

    </section>
  );
};
