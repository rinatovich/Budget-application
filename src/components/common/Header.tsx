import React from 'react';
import { ChevronLeft, ChevronRight, Smartphone, Monitor, Sparkles, Code2 } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { getMonthYearTitle } from '../../utils/formatters';

export const Header: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    prevMonth,
    nextMonth,
    resetToCurrentMonth,
    deviceMode,
    setDeviceMode,
    scenario,
    setScenario,
    setIsAndroidModalOpen,
  } = useBudget();

  const title = getMonthYearTitle(selectedYear, selectedMonth);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="flex items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
        {/* Left Action: Month navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-95 transition-all"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={resetToCurrentMonth}
            className="px-2.5 py-1 rounded-xl font-semibold text-sm tracking-tight text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-98 transition-all"
            title="Нажмите для перехода к текущему месяцу"
          >
            {title}
          </button>

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-95 transition-all"
            aria-label="Следующий месяц"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Right Actions: What-if toggle, Android export, Viewport switcher */}
        <div className="flex items-center gap-1.5">
          {/* What-If scenario toggle button */}
          <button
            onClick={() => setScenario((prev) => ({ ...prev, isActive: !prev.isActive }))}
            className={`p-1.5 rounded-xl transition-all flex items-center gap-1 text-xs font-medium ${
              scenario.isActive
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 ring-1 ring-amber-400/50'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Сценарное моделирование (Что если?)"
          >
            <Sparkles size={16} className={scenario.isActive ? 'text-amber-600 dark:text-amber-400 animate-pulse' : ''} />
            <span className="hidden sm:inline">Сценарий</span>
          </button>

          {/* Android Code/Project modal trigger */}
          <button
            onClick={() => setIsAndroidModalOpen(true)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
            title="Android Studio проект, Kotlin код и тесты"
          >
            <Code2 size={18} />
          </button>

          {/* Device Frame switcher */}
          <button
            onClick={() => setDeviceMode(deviceMode === 'phone' ? 'full' : 'phone')}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title={deviceMode === 'phone' ? 'Переключить на полный экран' : 'Переключить на рамку смартфона'}
          >
            {deviceMode === 'phone' ? <Monitor size={18} /> : <Smartphone size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
