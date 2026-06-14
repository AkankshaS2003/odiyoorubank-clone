import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: "Is Odiyooru Souharda Cooperative Society Ltd regulated by the RBI?",
      a: "We operate as a Multi-State Cooperative Credit Society registered under the Multi-State Cooperative Societies Act, 2002. While commercial banks are directly governed under RBI Banking Regulation acts, credit societies are governed by state/central cooperative commissioners and maintain capital reserve ratios matching RBI compliance guidelines."
    },
    {
      q: "What is the maximum interest rate offered on cooperative Fixed Deposits?",
      a: "We offer an industry-best standard FD interest rate of 8.50% p.a. for general depositors. Registered shareholder members and senior citizens receive a premium bonus rate of 9.00% p.a. interest compounded quarterly."
    },
    {
      q: "How do I become an active voting shareholder member of the society?",
      a: "You can subscribe to initial Share Capital units (minimum investment ₹10,000) by visiting your nearest branch. Upon successful KYC checks and board sanction, you gain legal co-ownership, annual dividend rights, and voting powers at general body governance boards."
    },
    {
      q: "What is the processing time and security metrics for Gold Loans?",
      a: "Gold Loans are disbursed at cheap rates starting from 8.50% p.a. within 30 minutes of counter valuations. Your physical gold ornaments are secured inside specialized government-grade vault keeps backed by comprehensive insurance coverage."
    },
    {
      q: "Do I get tax exemption benefits on deposits held inside cooperative societies?",
      a: "Yes, interest earned on cooperative credit deposits receives exemptions under Section 80P of the Income Tax Act, offering better tax-adjusted yields than standard retail bank FD accounts."
    }
  ];

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{"FAQ Guide"}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {"Frequently Answered Inquiries"}
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
