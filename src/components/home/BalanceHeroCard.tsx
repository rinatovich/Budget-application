import React from 'react';
import { ArrowUpRight, ArrowDownRight, Calendar, Sparkles } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';

export const BalanceHeroCard: React.FC = () => {
  const { summary, summaryWithoutScenario, settings, scenario } = useBudget();

  const isScenarioActive = scenario.isActive && scenario.amount > 0;
  const currency = settings.currency;

  // Percentage of income that expenses consume
  const totalExpensePct = summary.plannedIncome > 0
    ? Math.min(100, Math.round((summary.plannedExpenses / summary.plannedIncome) * 100))
    : (summary.plannedExpenses > 0 ? 100 : 0);

  const essentialPct = summary.plannedIncome > 0
    ? Math.min(100, Math.round((summary.plannedEssentialExpenses / summary.plannedIncome) * 100))
    : 0;

  const nonEssentialPct = summary.plannedIncome > 0
    ? Math.min(100, Math.round((summary.plannedNonEssentialExpenses / summary.plannedIncome) * 100))
    : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6 transition-all">
      {/* Scenario notification banner if active */}
      {isScenarioActive && (
        <div className="mb-4 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">
              Сценарий: {scenario.title || 'Тест'} ({formatCurrency(scenario.amount, currency)})
            </span>
          </div>
          <span className="text-[11px] opacity-80">
            Было: {formatCompactNumber(summaryWithoutScenario.plannedRemaining, currency)}
          </span>
        </div>
      )}

      {/* Main Remaining Hero Value */}
      <div className="flex flex-col mb-5">
        <span className="text-xs font-medium tracking-tight text-slate-500 dark:text-slate-400">
          Останется после плана
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <h1
            className={`text-3xl sm:text-4xl font-bold tracking-tight tabular-nums ${
              summary.plannedRemaining < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-950 dark:text-white'
            }`}
          >
            {formatCurrency(summary.plannedRemaining, currency)}
          </h1>
        </div>

        {/* Weekly budget insight */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Calendar size={13} className="text-slate-400" />
          <span>Свободно в неделю:</span>
          <span className="text-slate-900 dark:text-slate-200 font-semibold tabular-nums">
            ≈ {formatCurrency(summary.freeBudgetPerWeek, currency)}
          </span>
        </div>
      </div>

      {/* Income vs Expenses Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Income Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Доходы</span>
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(summary.plannedIncome, currency, true)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Факт: {formatCurrency(summary.actualIncome, currency)}
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Расходы</span>
            <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight size={14} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(summary.plannedExpenses, currency, true)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Факт: {formatCurrency(summary.actualExpenses, currency)}
          </div>
        </div>
      </div>

      {/* Progress Bar of Essential vs Non-Essential */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Распределение расходов</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
            {totalExpensePct}% от дохода
          </span>
        </div>

        {/* Stacked visual bar */}
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-slate-800 dark:bg-slate-200 transition-all duration-500"
            style={{ width: `${essentialPct}%` }}
            title={`Обязательные: ${essentialPct}%`}
          />
          <div
            className="h-full bg-slate-400 dark:bg-slate-500 transition-all duration-500"
            style={{ width: `${nonEssentialPct}%` }}
            title={`Необязательные: ${nonEssentialPct}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-200" />
            <span>Обязательные:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
              {formatCompactNumber(summary.plannedEssentialExpenses, currency)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>Необязательные:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
              {formatCompactNumber(summary.plannedNonEssentialExpenses, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
