import React, { useState, createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AboutUs } from './pages/AboutUs';
import { Management } from './pages/Management';
import { ProductsPage } from './pages/ProductsPage';
import { MediaPage } from './pages/MediaPage';
import { MembershipPage } from './pages/MembershipPage';
import { ContactPage } from './pages/ContactPage';
import { Footer } from './components/Footer';
import { AIChatAssistant } from './components/AIChatAssistant';
import { LoanEligibilityPage } from './pages/LoanEligibilityPage';
import { FloatingScrollButton } from './components/FloatingScrollButton';

import { LanguageProvider, useLanguage } from './context/LanguageContext';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [history, setHistory] = useState<string[]>(['home']);
  const currentTab = history[history.length - 1] || 'home';

  const setCurrentTab = (tab: string) => {
    setHistory(prev => {
      if (prev[prev.length - 1] === tab) return prev;
      return [...prev, tab];
    });
  };

  const goBack = () => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : ['home']);
  };

  const renderActiveTab = () => {
    // Restrict only dashboard tab to authenticated members
    let tabToRender = currentTab;
    if (tabToRender === 'dashboard' && !isAuthenticated) {
      tabToRender = 'login';
    }

    switch (tabToRender) {
      case 'home':
        return <Home setCurrentTab={setCurrentTab} />;
      case 'login':
        return <Login setCurrentTab={setCurrentTab} />;
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'products':
        return <ProductsPage />;
      case 'membership':
        return <MembershipPage setCurrentTab={setCurrentTab} />;
      case 'contact':
      case 'branches':
      case 'calculators':
        return <ContactPage />;
      case 'media':
        return <MediaPage />;
      case 'management':
        return <Management setCurrentTab={setCurrentTab} />;
      case 'about':
        return <AboutUs setCurrentTab={setCurrentTab} />;
      case 'loan-eligibility':
        return <LoanEligibilityPage setCurrentTab={setCurrentTab} goBack={goBack} />;
      default:
        return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* 1. Header Sticky Navbar matching Reference Image 1 */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* 2. Primary Page Body content */}
      <main className="flex-grow">
        {renderActiveTab()}
      </main>

      {/* 3. Simulated smart NLP floating assistant bubble */}
      <div className="print:hidden">
        {isAuthenticated && <AIChatAssistant />}
      </div>

      {/* 4. Footer exact match with Reference Image 2 */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* 5. Sleek floating smart scroll indicator with rotation animations */}
      <div className="print:hidden">
        <FloatingScrollButton />
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
