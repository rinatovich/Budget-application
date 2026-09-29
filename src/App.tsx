import React, { useState } from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { PlanScreen } from './components/plan/PlanScreen';
import { TransactionsScreen } from './components/transactions/TransactionsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { AddTransactionSheet } from './components/transactions/AddTransactionSheet';
import { AndroidExportModal } from './components/android/AndroidExportModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { Wifi, Battery, Signal } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    deviceMode,
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddType,
    settings,
  } = useBudget();

  const [showOnboarding, setShowOnboarding] = useState(!settings.hasCompletedOnboarding);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'plan':
        return <PlanScreen />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // If Phone frame mode
  if (deviceMode === 'phone') {
    return (
      <div className="min-h-screen bg-slate-200/80 dark:bg-slate-950 py-4 sm:py-8 px-2 flex items-center justify-center transition-colors">
        {/* Smartphone Shell */}
        <div className="relative w-full max-w-[430px] h-[890px] max-h-[96vh] bg-slate-100 dark:bg-slate-950 rounded-[48px] shadow-2xl border-[10px] border-slate-900 dark:border-slate-800 flex flex-col overflow-hidden ring-1 ring-black/10">
          {/* Top Speaker / Camera Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 dark:border-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full mr-2" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
          </div>

          {/* Android / iOS Status Bar */}
          <div className="h-9 px-7 pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200 shrink-0 z-40 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal size={12} />
              <Wifi size={12} />
              <Battery size={14} />
            </div>
          </div>

          {/* Header */}
          <Header />

          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto px-4 overscroll-contain no-scrollbar relative">
            {renderActiveScreen()}
          </main>

          {/* Bottom Gesture Pill Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full pointer-events-none z-40" />

          {/* Bottom Navigation */}
          <BottomNav />

          {/* Modals inside frame */}
          <AddTransactionSheet
            isOpen={isQuickAddOpen}
            onClose={() => setIsQuickAddOpen(false)}
            initialType={quickAddType}
          />
          <AndroidExportModal />
          <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
        </div>
      </div>
    );
  }

  // Full Screen Responsive Mode
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors">
      <Header />

      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-3 pb-safe">
        {renderActiveScreen()}
      </main>

      <BottomNav />

      {/* Modals */}
      <AddTransactionSheet
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialType={quickAddType}
      />
      <AndroidExportModal />
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
};

export default function App() {
  return (
    <BudgetProvider>
      <MainAppContent />
    </BudgetProvider>
  );
}
