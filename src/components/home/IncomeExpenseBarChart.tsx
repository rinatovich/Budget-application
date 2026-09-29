import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';

export const IncomeExpenseBarChart: React.FC = () => {
  const { summary, settings } = useBudget();
  const currency = settings.currency;

  const maxVal = Math.max(summary.plannedIncome, summary.plannedExpenses, Math.abs(summary.plannedRemaining), 1);

  const bars = [
    {
      label: 'Доходы',
      amount: summary.plannedIncome,
      color: 'bg-emerald-500 dark:bg-emerald-400',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      widthPct: Math.min(100, Math.round((summary.plannedIncome / maxVal) * 100)),
    },
    {
      label: 'Расходы',
      amount: summary.plannedExpenses,
      color: 'bg-slate-800 dark:bg-slate-200',
      textColor: 'text-slate-800 dark:text-slate-200',
      widthPct: Math.min(100, Math.round((summary.plannedExpenses / maxVal) * 100)),
    },
    {
      label: 'Остаток',
      amount: summary.plannedRemaining,
      color: summary.plannedRemaining >= 0 ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-rose-500',
      textColor: summary.plannedRemaining >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400',
      widthPct: Math.min(100, Math.round((Math.abs(summary.plannedRemaining) / maxVal) * 100)),
    },
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            Баланс месяца
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Сравнение планового дохода, расходов и остатка
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">{bar.label}</span>
              <span className={`font-semibold tabular-nums ${bar.textColor}`}>
                {formatCurrency(bar.amount, currency)}
              </span>
            </div>

            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full ${bar.color} rounded-full transition-all duration-500`}
                style={{ width: `${Math.max(bar.widthPct, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
