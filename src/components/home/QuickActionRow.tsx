import React, { useState } from 'react';
import { RotateCcw, Plus, Check } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const QuickActionRow: React.FC = () => {
  const {
    transactions,
    repeatLastExpense,
    categories,
    recentCategoryIds,
    setQuickAddType,
    setIsQuickAddOpen,
    settings,
  } = useBudget();

  const [hasRepeated, setHasRepeated] = useState(false);

  const lastExpense = transactions.find((t) => t.type === 'expense');
  const currency = settings.currency;

  const handleRepeat = () => {
    const success = repeatLastExpense();
    if (success) {
      setHasRepeated(true);
      setTimeout(() => setHasRepeated(false), 2000);
    }
  };

  // Top 4 recent categories
  const topCategories = recentCategoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c && c.type === 'expense')
    .slice(0, 4);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-semibold text-slate-500 dark:text-slate-400">Быстрые действия</span>
        {lastExpense && (
          <button
            onClick={handleRepeat}
            disabled={hasRepeated}
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-colors"
          >
            {hasRepeated ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Повторено!</span>
              </>
            ) : (
              <>
                <RotateCcw size={13} />
                <span>Повторить: {lastExpense.title} ({formatCurrency(lastExpense.amount, currency)})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick category shortcut chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {topCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setQuickAddType('expense');
              setIsQuickAddOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all text-xs font-medium text-slate-800 dark:text-slate-200 shrink-0 shadow-2xs"
          >
            <CategoryIcon iconName={cat.icon} color={cat.color} size={15} />
            <span>+ {cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
