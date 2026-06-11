import React from 'react';
import { Globe, Camera, Tv } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  const handleNavClick = (tabName: string) => {
    setCurrentTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#051C36] text-white border-t border-white/20 pt-16 pb-8 relative print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Left Column: Logo, description, and green social icons */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Logo Crest inline representation */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('home')}>
              <img
                src="/logo-bg.png"
                alt="Odiyooru Souharda Logo"
                className="h-11 w-11 object-contain shrink-0"
              />
              <div>
                <span className="text-xs sm:text-sm font-black tracking-tight text-white uppercase block leading-none font-heading">
                  Odiyooru Souharda
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-white/90 uppercase tracking-widest leading-none block mt-1">
                  Cooperative Society Ltd
                </span>
              </div>
            </div>

            {/* Exact Bio text from image - localized */}
            <p className="text-xs text-white/90 leading-relaxed max-w-xl font-medium">
              {t('footer_bio')}
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              {[
                { icon: Globe, url: '#' },
                { icon: Camera, url: '#' },
                { icon: Tv, url: '#' }
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    className="h-10 w-10 rounded-full bg-accent hover:bg-accent-dark flex items-center justify-center text-white transition-all transform active:scale-95 shadow-md shadow-emerald-950/20"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* New Column: Contact Us - localized */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('contact')} <span className="text-white/90">→</span>
            </h4>
            <div className="space-y-3 text-xs text-white/90 font-semibold leading-relaxed">
              <p className="text-white font-extrabold text-xs leading-snug">
                Odiyooru Souharda Cooperative Society Ltd
              </p>
              <p className="text-[11px] text-white/90">
                Odiyoor Post, Tq. Uppala Road 574243, Bantwal, Karnataka 574243
              </p>
              <div className="pt-1.5 space-y-1 text-[11px]">
                <p className="block">
                  <span className="text-white font-bold">Phone: </span>
                  <a href="tel:0824-2439114" className="hover:text-white transition-colors">0824-2439114</a>
                </p>
                <p className="block break-all">
                  <span className="text-white font-bold">Email: </span>
                  <a href="mailto:odiyoorsricooperative@gmail.com" className="hover:text-white transition-colors">odiyoorsricooperative@gmail.com</a>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright details - localized */}
        <div className="border-t border-white/20 pt-6 mt-8 text-center text-[10px] text-white/90 font-bold uppercase tracking-wider">
          <span>{t('copyright')}</span>
        </div>

      </div>
    </footer>
  );
};
