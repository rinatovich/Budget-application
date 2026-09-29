import React from 'react';
import { RecurringItem } from '../../types/budget';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, DAY_NAMES_RU, formatCompactNumber } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { getItemMonthlyTotal, calculateOccurrencesInMonth } from '../../utils/calculator';
import { Calendar, Trash2, Edit3, Power, AlertCircle } from 'lucide-react';

interface RecurringItemCardProps {
  item: RecurringItem;
  onEdit: (item: RecurringItem) => void;
}

export const RecurringItemCard: React.FC<RecurringItemCardProps> = ({ item, onEdit }) => {
  const {
    categories,
    selectedYear,
    selectedMonth,
    settings,
    deleteRecurringItem,
    toggleRecurringItemActive,
  } = useBudget();

  const currency = settings.currency;
  const category = categories.find((c) => c.id === item.categoryId);

  const monthlyTotal = getItemMonthlyTotal(item, selectedYear, selectedMonth);
  const occurrences = calculateOccurrencesInMonth(item, selectedYear, selectedMonth);

  // Formatted repetition text
  let frequencyText = '';
  switch (item.frequency) {
    case 'daily':
      frequencyText = 'Каждый день';
      break;
    case 'weekly': {
      const dayName = DAY_NAMES_RU.find((d) => d.index === item.dayOfWeek)?.full || 'день недели';
      frequencyText = `Каждую неделю (${dayName.toLowerCase()})`;
      break;
    }
    case 'monthly':
      if (item.dayOfMonth === -1) {
        frequencyText = 'Каждый месяц (последний день)';
      } else {
        frequencyText = `Каждый месяц (${item.dayOfMonth} числа)`;
      }
      break;
    case 'yearly':
      frequencyText = `Ежегодно (${item.date || ''})`;
      break;
    case 'once':
      frequencyText = `Единоразово (${item.date || ''})`;
      break;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Удалить «${item.title}» из плана?`)) {
      deleteRecurringItem(item.id);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRecurringItemActive(item.id);
  };

  return (
    <div
      onClick={() => onEdit(item)}
      className={`p-4 rounded-3xl border transition-all cursor-pointer select-none ${
        item.isActive
          ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700'
          : 'bg-slate-50/60 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CategoryIcon
            iconName={category?.icon || 'Circle'}
            color={category?.color || '#64748b'}
            size={18}
            withBackground
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className={`text-sm font-semibold tracking-tight truncate ${
                  item.isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 line-through'
                }`}
              >
                {item.title}
              </h4>
              {item.type === 'expense' && (
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                    item.isEssential
                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
                  }`}
                >
                  {item.isEssential ? 'Обязательный' : 'Необязательный'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <Calendar size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">{frequencyText}</span>
              {item.frequency === 'weekly' && occurrences > 0 && (
                <span className="text-[11px] text-slate-400">
                  · {occurrences} {occurrences === 1 ? 'раз' : occurrences < 5 ? 'раза' : 'раз'} в этом месяце
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side amounts and action buttons */}
        <div className="flex flex-col items-end shrink-0">
          <div
            className={`text-sm font-bold tabular-nums ${
              item.type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-950 dark:text-white'
            }`}
          >
            {formatCurrency(item.amount, currency, item.type === 'income')}
          </div>

          {item.frequency === 'weekly' && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums mt-0.5">
              Итого: {formatCurrency(monthlyTotal, currency)} / мес
            </div>
          )}

          {/* Quick toggle/delete actions */}
          <div className="flex items-center gap-1 mt-2.5">
            <button
              onClick={handleToggle}
              className={`p-1.5 rounded-xl transition-colors ${
                item.isActive
                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              title={item.isActive ? 'Временно отключить' : 'Включить обратно'}
            >
              <Power size={14} />
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Удалить"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {item.comment && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {item.comment}
        </p>
      )}
    </div>
  );
};
