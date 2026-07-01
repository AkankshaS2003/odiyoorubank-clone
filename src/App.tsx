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
import Breadcrumbs from './components/Breadcrumbs';
import { AccountApplication } from './pages/AccountApplication';
import { DepositApplication } from './pages/DepositApplication';
import { SavingsDepositApplication } from './pages/SavingsDepositApplication';
import { SavingsWithdrawalApplication } from './pages/SavingsWithdrawalApplication';
import { AccountClosureApplication } from './pages/AccountClosureApplication';
import { SavingsHistory } from './pages/SavingsHistory';
import { GoldLoanApplication } from './pages/GoldLoanApplication';
import { VehicleLoanApplication } from './pages/VehicleLoanApplication';
import { EducationalLoanApplication } from './pages/EducationalLoanApplication';
import { PersonalLoanApplication } from './pages/PersonalLoanApplication';
import { HousingLoanApplication } from './pages/HousingLoanApplication';
import { MortgageLoanApplication } from './pages/MortgageLoanApplication';
import { AgriculturalLoanApplication } from './pages/AgriculturalLoanApplication';
import { CreateRD } from './pages/RD/CreateRD';
import { FDDetailsPage } from './pages/FDDetailsPage';
import { RDDetailsPage } from './pages/RDDetailsPage';
import { MyFixedDeposits } from './pages/MyFixedDeposits';
import { FDDashboardReceipt } from './pages/FDDashboardReceipt';
import { MembershipPayment } from './pages/MembershipPayment';
import { LoanDetailsPage } from './pages/LoanDetailsPage';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<string[]>(() => {
    const savedHistory = sessionStorage.getItem('app_history');
    return savedHistory ? JSON.parse(savedHistory) : ['home'];
  });

  useEffect(() => {
    sessionStorage.setItem('app_history', JSON.stringify(history));
  }, [history]);

  const [fdReceiptData, setFdReceiptData] = useState<any>(null);
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

    if ((tabToRender === 'dashboard' || tabToRender === 'loan-eligibility' || tabToRender === 'apply-account' || tabToRender === 'savings-history' || tabToRender === 'apply-savings-deposit' || tabToRender === 'apply-deposit' || tabToRender === 'apply-rd' || tabToRender === 'apply-gold-loan' || tabToRender === 'apply-vehicle-loan' || tabToRender === 'apply-educational-loan' || tabToRender === 'apply-personal-loan' || tabToRender === 'apply-housing-loan' || tabToRender === 'apply-mortgage-loan' || tabToRender === 'my_fds' || tabToRender === 'fd_receipt') && !isAuthenticated) {
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
          return <ProductsPage setCurrentTab={setCurrentTab} />;
        case 'membership':
          return <MembershipPage setCurrentTab={setCurrentTab} />;
        case 'membership-payment':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <MembershipPayment setCurrentTab={setCurrentTab} />;
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
        case 'apply-account':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />; // Modal logic will catch this before
          }
          return <AccountApplication setCurrentTab={setCurrentTab} />;
        case 'savings-history':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <SavingsHistory setCurrentTab={setCurrentTab} />;
        case 'apply-savings-deposit':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <SavingsDepositApplication setCurrentTab={setCurrentTab} />;
        case 'apply-savings-withdrawal':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <SavingsWithdrawalApplication setCurrentTab={setCurrentTab} />;
        case 'apply-account-closure':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <AccountClosureApplication setCurrentTab={setCurrentTab} />;
        case 'apply-deposit':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <DepositApplication setCurrentTab={setCurrentTab} />;
        case 'apply-rd':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <CreateRD setCurrentTab={setCurrentTab} />;
        case 'apply-gold-loan':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <GoldLoanApplication setCurrentTab={setCurrentTab} />;
        case 'apply-vehicle-loan':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <VehicleLoanApplication setCurrentTab={setCurrentTab} />;
        case 'apply-educational-loan':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <EducationalLoanApplication setCurrentTab={setCurrentTab} />;
        case 'apply-personal-loan':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <PersonalLoanApplication setCurrentTab={setCurrentTab} />;
        case 'apply-housing-loan':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <HousingLoanApplication setCurrentTab={setCurrentTab} />;
        case 'apply-mortgage-loan':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <MortgageLoanApplication setCurrentTab={setCurrentTab} />;
        case 'apply-agricultural-loan':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <AgriculturalLoanApplication setCurrentTab={setCurrentTab} />;
        case 'my_fds':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <MyFixedDeposits setCurrentTab={setCurrentTab} setFdReceiptData={setFdReceiptData} />;
        case 'fd_receipt':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <FDDashboardReceipt setCurrentTab={setCurrentTab} fdData={fdReceiptData} />;
        default:
          if (currentTab.startsWith('view-fd-details|')) {
            if (!isAuthenticated) return <Home setCurrentTab={setCurrentTab} />;
            const appId = currentTab.split('|')[1];
            return <FDDetailsPage appId={appId} setCurrentTab={setCurrentTab} />;
          }
          if (currentTab.startsWith('view-rd-details|')) {
            if (!isAuthenticated) return <Home setCurrentTab={setCurrentTab} />;
            const appId = currentTab.split('|')[1];
            return <RDDetailsPage appId={appId} setCurrentTab={setCurrentTab} />;
          }
          if (currentTab.startsWith('view-loan-details|')) {
            if (!isAuthenticated) return <Home setCurrentTab={setCurrentTab} />;
            const appId = currentTab.split('|')[1];
            return <LoanDetailsPage appId={appId} setCurrentTab={setCurrentTab} />;
          }
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
        <Breadcrumbs currentTab={currentTab} setCurrentTab={setCurrentTab} goBack={goBack} />
        {renderActiveTab()}
      </main>

      {/* 3. Simulated smart NLP floating assistant bubble */}
      <div className="print:hidden">
        <AIChatAssistant />
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
