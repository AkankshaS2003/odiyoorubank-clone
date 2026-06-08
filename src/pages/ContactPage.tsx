import React, { useState } from 'react';
import { Contact } from '../components/Contact';

import { Calculators } from '../components/Calculators';
import { Mail, MapPin, Calculator } from 'lucide-react';
import { useLanguage } from '../App';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'branches' | 'calculators'>('form');

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tab Toggle Indicators */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl">
            <button
              onClick={() => setActiveSubTab('form')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${activeSubTab === 'form' ? 'bg-primary text-white shadow-md' : 'text-slate-655 hover:text-slate-900'}`}
            >
              <Mail className="h-4 w-4" />
              <span>Central Enquiry</span>
            </button>

            <button
              onClick={() => setActiveSubTab('calculators')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${activeSubTab === 'calculators' ? 'bg-primary text-white shadow-md' : 'text-slate-655 hover:text-slate-900'}`}
            >
              <Calculator className="h-4 w-4" />
              <span>Calculators</span>
            </button>
          </div>
        </div>

        {/* Dynamic Sub-Tab Views */}
        <div className="animate-scale-up">
          {activeSubTab === 'form' && <Contact />}

          {activeSubTab === 'calculators' && <Calculators />}
        </div>

      </div>
    </div>
  );
};
