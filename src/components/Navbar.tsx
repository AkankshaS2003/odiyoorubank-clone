import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, X, User, LogOut, ChevronDown, CheckCircle2, Landmark, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../App';
import type { Language } from '../App';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Dropdown states for submenus
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [dateTimeStr, setDateTimeStr] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const locale = 'en-IN';
      const formatted = now.toLocaleString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setDateTimeStr(formatted);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  const handleNavClick = (tabName: string) => {
    setCurrentTab(tabName);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome Bonus Credited', desc: '₹10,000 disburser balance credited to your savings.', time: 'Just now', unread: true },
    { id: 2, title: 'e-KYC Submission Approved', desc: 'Aadhaar & PAN simulated logs verified successfully.', time: '1 hour ago', unread: true },
    { id: 3, title: 'FD Rates Hiked', desc: 'Earn up to 8.75% p.a. as shareholder member!', time: '1 day ago', unread: false },
  ]);

  return (
    <>
      {/* 1. Static Top Header (Ticker & Banner) */}
      <header className="w-full bg-[#0A315C] z-30 select-none shadow-sm">
        {/* Row 1: Top Bar with Ticker & Clock */}
        <div className="bg-[#051C36] text-white text-sm font-semibold py-2 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 border-b border-secondary/20">
          {/* Left: Scrolling Headlines Marquee */}
          <div className="w-full flex-1 overflow-hidden md:mr-8 flex items-center space-x-2 order-2 md:order-1">
            <span className="bg-accent text-white px-2 py-1 rounded text-xs uppercase tracking-wider font-extrabold animate-pulse shrink-0">LATEST News</span>
            <div className="w-full">
              {React.createElement(
                'marquee',
                { scrollamount: '5', className: 'text-white/95 text-base font-medium leading-none flex items-center' },
                <>
                  <span className="mx-6 font-semibold">• State Best Souharda Cooperative Society Award in the 69th All India Cooperative Week</span>
                  <span className="mx-6 font-semibold">• Cooperative Fixed Deposit Rates Increased to 8.25%</span>
                  <span className="mx-6 font-semibold">• New Digital Doorstep Banking Service Sanctioned</span>
                </>
              )}
            </div>
          </div>

          {/* Center/Right: Real Date and Time */}
          <div className="shrink-0 flex items-center justify-center space-x-2 text-white/80 text-[11px] font-medium order-1 md:order-2 pb-1 md:pb-0 border-b md:border-b-0 border-white/10 w-full md:w-auto">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-stencil tracking-wider">{dateTimeStr}</span>
          </div>

        </div>

      </header>

      {/* 2. Row 3: Sticky Navigation Menu & Quick Actions */}
      <nav className="sticky top-0 z-40 bg-[#ED7F1E] backdrop-blur-md border-b border-slate-150 shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo Circular Seal (Compact for Sticky Bar!) */}
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => handleNavClick('home')}>
              <img
                src="/logo-bg.png"
                alt="Odiyooru Souharda Logo"
                className="h-16 w-16 object-contain shrink-0"
              />
              <div className="leading-tight">
                <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase block leading-none font-heading">
                  Odiyooru Souharda
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-widest leading-none block mt-0.5">
                  Cooperative Society Ltd
                </span>
                <span className="text-[10px] font-bold text-white block mt-0.5 font-mono leading-none">
                  DRP:S.9:88:RGN:520:2010-11
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6">

              {/* Home */}
              <button
                onClick={() => handleNavClick('home')}
                className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-white ${currentTab === 'home' ? 'text-white' : 'text-white/90'}`}
              >
                {t('home')}
              </button>

              {/* About Us */}
              <button
                onClick={() => handleNavClick('about')}
                className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-white ${currentTab === 'about' ? 'text-white' : 'text-white/90'}`}
              >
                {t('about')}
              </button>

              {/* Management */}
              <button
                onClick={() => handleNavClick('management')}
                className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-white ${currentTab === 'management' ? 'text-white' : 'text-white/90'}`}
              >
                {t('management')}
              </button>

              {/* Products */}
              <button
                onClick={() => handleNavClick('products')}
                className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-white ${currentTab === 'products' ? 'text-white' : 'text-white/90'}`}
              >
                {t('products')}
              </button>

              {/* Gallery */}
              <button
                onClick={() => handleNavClick('media')}
                className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-white ${currentTab === 'Gallery' ? 'text-white' : 'text-white/90'}`}
              >
                {t('Gallery')}
              </button>

              {/* Membership */}
              <button
                onClick={() => handleNavClick('membership')}
                className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-white ${currentTab === 'membership' ? 'text-white' : 'text-white/90'}`}
              >
                {t('membership')}
              </button>

              {/* Contact Us */}
              <button
                onClick={() => handleNavClick('contact')}
                className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-white ${currentTab === 'contact' ? 'text-white' : 'text-white/90'}`}
              >
                {t('contact')}
              </button>

            </nav>

            {/* Quick Actions Interaction Area */}
            <div className="flex items-center space-x-3.5">



              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors focus:outline-none"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
              </div>

              {/* Auth states */}
              <div className="hidden sm:flex items-center space-x-2">
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-md transition-all hover:bg-primary-dark"
                >
                  {t('login')}
                </a>
              </div>

              {/* Mobile Drawer button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Slide-out Mobile Panel Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-slate-150 animate-slide-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-base font-bold text-primary">Cooperative Directory</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>



              <div className="flex flex-col space-y-4 text-xs font-bold text-slate-700">
                <button onClick={() => handleNavClick('home')} className="text-left py-2 hover:text-primary">{t('home')}</button>
                <button onClick={() => handleNavClick('about')} className="text-left py-2 hover:text-primary">{t('about')}</button>
                <button onClick={() => handleNavClick('management')} className="text-left py-2 hover:text-primary">{t('management')}</button>
                <button onClick={() => handleNavClick('products')} className="text-left py-2 hover:text-primary">{t('products')}</button>
                <button onClick={() => handleNavClick('Gallery')} className="text-left py-2 hover:text-primary">{t('Gallery')}</button>
                <button onClick={() => handleNavClick('membership')} className="text-left py-2 hover:text-primary">{t('membership')}</button>
                <button onClick={() => handleNavClick('contact')} className="text-left py-2 hover:text-primary">{t('contact')}</button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col space-y-3">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full py-3 bg-slate-100 font-bold text-slate-700 rounded-xl text-xs hover:bg-slate-200"
                  >
                    {t('dashboard')}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      handleNavClick('home');
                    }}
                    className="w-full py-3 border border-red-200 text-red-650 rounded-xl text-xs hover:bg-red-50 font-bold"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-3 border border-slate-250 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t('login')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-slate-100 shadow-2xl animate-scale-up relative">
            <button onClick={() => setIsNotificationsOpen(false)} className="absolute top-5 right-5 text-slate-450 hover:text-slate-655">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Member Bulletins</h3>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs">
                  <p className="font-bold text-slate-800">{n.title}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-normal">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search popup */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 border border-slate-100 shadow-2xl animate-slide-down">
            <div className="flex items-center space-x-3 border-b border-slate-150 pb-2">
              <Search className="h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products or locations..."
                className="flex-1 border-0 focus:outline-none text-xs text-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)}>
                <X className="h-4.5 w-4.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
