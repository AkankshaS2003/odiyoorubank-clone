import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: t('faq1_q'),
      a: t('faq1_a')
    },
    {
      q: t('faq2_q'),
      a: t('faq2_a')
    },
    {
      q: t('faq3_q'),
      a: t('faq3_a')
    },
    {
      q: t('faq4_q'),
      a: t('faq4_a')
    },
    {
      q: t('faq5_q'),
      a: t('faq5_a')
    }
  ];

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{t('faq_guide')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {t('frequent_inquiries')}
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-150 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 pr-4">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4.5 w-4.5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-100 animate-slide-down">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
