import React, { useState } from 'react';
import { useLanguage } from '../App';

export const MediaPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeImageIdx, setActiveImageIdx] = useState<number | null>(null);

  const galleryImages = [
    { url: '/gallery/y1.jpg.jpeg', alt: 'Cooperative Event Moment 1', caption: 'Milestone Celebration' },
    { url: '/gallery/y2.jpg.jpeg', alt: 'Cooperative Event Moment 2', caption: 'Shareholder Gathering' },
    { url: '/gallery/y3.jpg.jpeg', alt: 'Cooperative Event Moment 3', caption: 'Welfare Distribution Drive' },
    { url: '/gallery/y4.jpg.jpeg', alt: 'Cooperative Event Moment 4', caption: 'Central Office Inauguration' },
    { url: '/gallery/y5.jpg.jpeg', alt: 'Cooperative Event Moment 5', caption: 'Community Literacy Workshop' },
    { url: '/gallery/y6.jpg.jpeg', alt: 'Cooperative Event Moment 6', caption: 'Governing Board Session' },
    { url: '/gallery/y7.jpg.jpeg', alt: 'Cooperative Event Moment 7', caption: 'Doorstep Banking Launch' },
    { url: '/gallery/y8.jpg.jpeg', alt: 'Cooperative Event Moment 8', caption: 'Member Facilitation Desk' }
  ];

  return (
    <section className="py-5 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 space-y-16">

        {/* Dynamic Gallery Section */}
        <div className="space-y-1">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-accent uppercase tracking-widest block">Event Highlights</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">{t('Gallary')}</h2>
            <p className="text-slate-500 leading-relaxed text-xs max-w-xl mx-auto font-medium">
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className="relative overflow-hidden rounded-3xl border border-slate-150 shadow-sm cursor-pointer group aspect-square bg-slate-50 transition-all hover:shadow-md active:scale-98"
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full border border-white/25">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
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
              <h4 className="font-bold text-sm tracking-wide text-secondary">{galleryImages[activeImageIdx].caption}</h4>
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
