import React, { useState, createContext, useContext, useEffect } from 'react';
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
import { AdminPanel } from './pages/AdminPanel';
import { BranchesPage } from './pages/BranchesPage';


const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<string[]>(['home']);
  const currentTab = history[history.length - 1] || 'home';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

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
    // Restrict protected tabs to authenticated members
    let tabToRender = currentTab;
    let showLoginModal = false;

    if ((tabToRender === 'dashboard' || tabToRender === 'loan-eligibility') && !isAuthenticated) {
      showLoginModal = true;
      tabToRender = 'home';
    } else if (tabToRender === 'login') {
      showLoginModal = true;
      tabToRender = history.length > 1 && history[history.length - 2] !== 'login' ? history[history.length - 2] : 'home';
    }

    const renderComponent = () => {
      switch (tabToRender) {
        case 'home':
          return <Home setCurrentTab={setCurrentTab} />;
        case 'dashboard':
          return <Dashboard setCurrentTab={setCurrentTab} />;
        case 'products':
          return <ProductsPage />;
        case 'membership':
          return <MembershipPage setCurrentTab={setCurrentTab} />;
        case 'contact':
        case 'calculators':
          return <ContactPage />;
        case 'branches':
          return <BranchesPage />;
        case 'media':
          return <MediaPage />;
        case 'management':
          return <Management setCurrentTab={setCurrentTab} />;
        case 'about':
          return <AboutUs setCurrentTab={setCurrentTab} />;
        case 'loan-eligibility':
          return <LoanEligibilityPage setCurrentTab={setCurrentTab} goBack={goBack} />;
        case 'admin':
          if (!isAuthenticated || !(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'employee')) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <AdminPanel setCurrentTab={setCurrentTab} />;

        default:
          return <Home setCurrentTab={setCurrentTab} />;
      }
    };

    return (
      <>
        {renderComponent()}
        {showLoginModal && <Login setCurrentTab={setCurrentTab} goBack={goBack} />}
      </>
    );
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
      
        <AppContent />
      
    </AuthProvider>
  );
}
