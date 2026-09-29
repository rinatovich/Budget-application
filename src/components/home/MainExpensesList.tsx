import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { getItemMonthlyTotal } from '../../utils/calculator';
import { ChevronRight } from 'lucide-react';

export const MainExpensesList: React.FC = () => {
  const { recurringItems, categories, selectedYear, selectedMonth, settings, setActiveTab } = useBudget();
  const currency = settings.currency;

  const activeExpenses = recurringItems.filter((i) => i.isActive && i.type === 'expense');

  // Compute monthly cost for each item
  const mapped = activeExpenses
    .map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      const monthlyTotal = getItemMonthlyTotal(item, selectedYear, selectedMonth);
      return {
        item,
        category,
        monthlyTotal,
      };
    })
    .sort((a, b) => b.monthlyTotal - a.monthlyTotal)
    .slice(0, 4);

  if (mapped.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          Крупнейшие расходы месяца
        </h2>
        <button
          onClick={() => setActiveTab('plan')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-0.5"
        >
          Весь план
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {mapped.map(({ item, category, monthlyTotal }, idx) => (
          <div
            key={item.id}
            className="py-3 flex items-center justify-between first:pt-1 last:pb-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-4 tabular-nums">
                {idx + 1}.
              </span>
              <CategoryIcon
                iconName={category?.icon || 'ShoppingCart'}
                color={category?.color || '#64748b'}
                size={18}
                withBackground
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                  {item.frequency === 'weekly'
                    ? `${formatCurrency(item.amount, currency)} / нед`
                    : item.isEssential
                    ? 'Обязательный'
                    : 'Необязательный'}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums block">
                {formatCurrency(monthlyTotal, currency)}
              </span>
              <span className="text-[10px] text-slate-400 tabular-nums">в месяц</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
