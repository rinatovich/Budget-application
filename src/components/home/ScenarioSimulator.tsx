import React, { useState } from 'react';
import { Sparkles, X, Check, RotateCcw } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';

export const ScenarioSimulator: React.FC = () => {
  const {
    scenario,
    setScenario,
    resetScenario,
    applyScenarioToPlan,
    summary,
    summaryWithoutScenario,
    settings,
  } = useBudget();

  const [inputTitle, setInputTitle] = useState(scenario.title || 'Новый расход');
  const [inputAmount, setInputAmount] = useState(scenario.amount ? scenario.amount.toString() : '2000000');
  const [isEssential, setIsEssential] = useState(scenario.isEssential);

  const currency = settings.currency;

  if (!scenario.isActive) {
    return (
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
              Сценарное моделирование
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Проверьте, как новая покупка или расход повлияет на остаток месяца
            </span>
          </div>
        </div>

        <button
          onClick={() => setScenario((prev) => ({ ...prev, isActive: true }))}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs active:scale-95 transition-all whitespace-nowrap"
        >
          Включить тест
        </button>
      </div>
    );
  }

  const handleUpdateAmount = (val: string) => {
    setInputAmount(val);
    const num = parseFloat(val.replace(/\s+/g, '')) || 0;
    setScenario((prev) => ({ ...prev, amount: num }));
  };

  const handleUpdateTitle = (val: string) => {
    setInputTitle(val);
    setScenario((prev) => ({ ...prev, title: val }));
  };

  const handleToggleEssential = () => {
    const next = !isEssential;
    setIsEssential(next);
    setScenario((prev) => ({ ...prev, isEssential: next }));
  };

  const diffAmount = summaryWithoutScenario.plannedRemaining - summary.plannedRemaining;

  return (
    <div className="rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-600 dark:text-amber-400 animate-spin-slow" />
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Тест сценария: Что изменится?
          </h3>
        </div>
        <button
          onClick={resetScenario}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          title="Закрыть симуляцию"
        >
          <X size={16} />
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Что хотите запланировать?
          </label>
          <input
            type="text"
            value={inputTitle}
            onChange={(e) => handleUpdateTitle(e.target.value)}
            placeholder="Например: Новый телефон, отпуск"
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Сумма расхода
          </label>
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => handleUpdateAmount(e.target.value)}
            placeholder="2 000 000"
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold tabular-nums text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Essential toggle */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-slate-600 dark:text-slate-400">Это обязательный расход?</span>
        <button
          onClick={handleToggleEssential}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            isEssential
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {isEssential ? 'Обязательный' : 'Необязательный'}
        </button>
      </div>

      {/* Comparison Diff Box */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-amber-500/20 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Было свободно:</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            {formatCurrency(summaryWithoutScenario.plannedRemaining, currency)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ≈ {formatCompactNumber(summaryWithoutScenario.freeBudgetPerWeek, currency)} / нед
          </span>
        </div>

        <div className="border-l border-slate-100 dark:border-slate-700 pl-3">
          <span className="text-amber-600 dark:text-amber-400 font-medium block text-[11px]">
            Станет свободно:
          </span>
          <span
            className={`text-sm font-bold tabular-nums ${
              summary.plannedRemaining < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-950 dark:text-white'
            }`}
          >
            {formatCurrency(summary.plannedRemaining, currency)}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            ≈ {formatCompactNumber(summary.freeBudgetPerWeek, currency)} / нед
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={applyScenarioToPlan}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Check size={14} />
          Сохранить в постоянный план
        </button>
        <button
          onClick={resetScenario}
          className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all flex items-center gap-1"
        >
          <RotateCcw size={14} />
          Сбросить
        </button>
      </div>
    </div>
  );
};
