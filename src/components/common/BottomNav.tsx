import React, { useState } from 'react';
import { Home, Calendar, ArrowUpDown, Settings, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useBudget, NavTab } from '../../context/BudgetContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, setQuickAddType } = useBudget();
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const tabs: Array<{ id: NavTab; label: string; icon: typeof Home }> = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'plan', label: 'План', icon: Calendar },
    { id: 'transactions', label: 'Операции', icon: ArrowUpDown },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  const handleOpenAdd = (type: 'expense' | 'income') => {
    setQuickAddType(type);
    setIsFabMenuOpen(false);
    setIsQuickAddOpen(true);
  };

  return (
    <>
      {/* FAB Backdrop when sub-actions are open */}
      {isFabMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsFabMenuOpen(false)}
        />
      )}

      {/* Floating Action Menu Popover */}
      {isFabMenuOpen && (
        <div className="fixed bottom-24 right-6 sm:right-[calc(50%-180px)] z-50 flex flex-col items-end gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Add Income button */}
          <button
            onClick={() => handleOpenAdd('income')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-transform"
          >
            <span className="text-sm font-semibold tracking-tight">Доход</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
          </button>

          {/* Add Expense button */}
          <button
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-transform"
          >
            <span className="text-sm font-semibold tracking-tight">Расход</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight size={20} />
            </div>
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-5 sm:right-[calc(50%-185px)] z-40">
        <button
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className={`w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-950/20 flex items-center justify-center transition-all duration-200 active:scale-90 hover:opacity-95 ${
            isFabMenuOpen ? 'rotate-45 bg-rose-600 dark:bg-rose-500 text-white' : ''
          }`}
          aria-label="Добавить операцию"
        >
          <Plus size={28} strokeWidth={2.4} />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 transition-colors pb-safe">
        <div className="max-w-lg mx-auto grid grid-cols-4 h-16 items-center px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsFabMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all relative ${
                  isActive
                    ? 'text-slate-950 dark:text-white font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-normal'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className={`transition-transform ${isActive ? 'scale-105' : ''}`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
