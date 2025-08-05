import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from 'react-query';
import Sidebar from './Sidebar';
import ProfessionalHeader from './ProfessionalHeader';
import EnterpriseHeroPhase from './EnterpriseHeroPhase';
import MarketOverview from './MarketOverview';
import BacktestingInterface from './BacktestingInterface';
import SmartAlerts from './SmartAlerts';
import LiveRotationSignals from './LiveRotationSignals';
import AdvancedTradingDashboard from './AdvancedTradingDashboard';
import ResponsiveMobileInterface from './ResponsiveMobileInterface';
import BenjaminCowenAnalysis from './BenjaminCowenAnalysis';
import CowenStyleDashboard from './CowenStyleDashboard';
import AdvancedCryptoverseCharts from './AdvancedCryptoverseCharts';
import { cn, animations, layout } from '../utils/designSystem';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const ProfessionalDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [useAdvancedUI, setUseAdvancedUI] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Device detection
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Apply dark mode class to html element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => window.removeEventListener('resize', checkDevice);
  }, [darkMode]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">Loading CryptoRotate Pro...</p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    // Mobile interface for small screens
    if (isMobile) {
      return <ResponsiveMobileInterface isMobile={true} />;
    }
    
    // Desktop interface
    switch (currentView) {
      case 'dashboard':
        return <CowenStyleDashboard />;
      case 'advanced':
        return <AdvancedTradingDashboard />;
      case 'charts':
        return <ChartsView />;
      case 'cowen':
        return <CowenAnalysisView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'backtesting':
        return <BacktestingInterface />;
      case 'signals':
        return <SignalsView />;
      case 'performance':
        return <PerformanceView />;
      case 'alerts':
        return <AlertsView />;
      case 'history':
        return <HistoryView />;
      case 'strategy':
        return <StrategyView />;
      case 'learn':
        return <LearnView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CowenStyleDashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div 
        className="min-h-screen transition-colors duration-300"
        data-testid="app-loaded"
        style={{
          background: `linear-gradient(135deg, #010b16 0%, #0a1525 50%, #162030 100%)`,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Main Content */}
        <div className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        )}>
          {/* Header */}
          <ProfessionalHeader
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <main className="min-h-screen">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
};

// Advanced Dashboard View Component - Next-Gen UI
const AdvancedDashboardView = () => {
  return <AdvancedTradingDashboard />;
};

// Advanced Charts View
const ChartsView = () => {
  return (
    <div className="min-h-screen" style={{ 
      paddingTop: '2rem', 
      paddingBottom: '4rem',
      paddingLeft: '2rem',
      paddingRight: '2rem'
    }}>
      <div className="max-w-[1600px] mx-auto">
        <AdvancedCryptoverseCharts />
      </div>
    </div>
  );
};

// Benjamin Cowen Analysis View
const CowenAnalysisView = () => {
  return (
    <div className="min-h-screen" style={{ 
      paddingTop: '2rem', 
      paddingBottom: '4rem',
      paddingLeft: '2rem',
      paddingRight: '2rem'
    }}>
      <div className="max-w-[1600px] mx-auto">
        <BenjaminCowenAnalysis />
      </div>
    </div>
  );
};

// Classic Dashboard View Component - Enterprise Level
const DashboardView = () => {
  return (
    <div className="min-h-screen" style={{ 
      paddingTop: '2rem', 
      paddingBottom: '4rem',
      paddingLeft: '2rem',
      paddingRight: '2rem'
    }}>
      {/* Professional Container with Tesla-level spacing */}
      <div className="max-w-[1600px] mx-auto">
        <div className="space-y-8">
          {/* Enterprise Hero Phase Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <EnterpriseHeroPhase />
          </motion.div>
          
          {/* Professional Market Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <MarketOverview />
          </motion.div>
          
          {/* Live Rotation Signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <LiveRotationSignals />
          </motion.div>
          
          {/* Smart Alerts - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <SmartAlerts />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other views
const PortfolioView = () => (
  <div className="p-6">
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Portfolio Management
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Portfolio management interface coming soon...
      </p>
    </div>
  </div>
);

const SignalsView = () => (
  <div className="min-h-screen" style={{ 
    paddingTop: '2rem', 
    paddingBottom: '4rem',
    paddingLeft: '2rem',
    paddingRight: '2rem'
  }}>
    <div className="max-w-[1600px] mx-auto">
      <LiveRotationSignals />
    </div>
  </div>
);

const PerformanceView = () => (
  <div className="p-6">
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Performance Analytics
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Detailed performance analytics coming soon...
      </p>
    </div>
  </div>
);

const AlertsView = () => (
  <div className="p-6">
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Alert Management
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Advanced alert management system coming soon...
      </p>
    </div>
  </div>
);

const HistoryView = () => (
  <div className="p-6">
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Trading History
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Complete trading history and audit trail coming soon...
      </p>
    </div>
  </div>
);

const StrategyView = () => (
  <div className="p-6">
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Strategy Builder
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Advanced strategy builder and optimizer coming soon...
      </p>
    </div>
  </div>
);

const LearnView = () => (
  <div className="p-6">
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Learning Center
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Educational resources and tutorials coming soon...
      </p>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="p-6">
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Settings & Configuration
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Advanced settings and configuration panel coming soon...
      </p>
    </div>
  </div>
);

export default ProfessionalDashboard;