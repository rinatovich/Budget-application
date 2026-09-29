import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Transaction } from '../../types/budget';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency, formatDateRelative } from '../../utils/formatters';
import { Trash2, Plus, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    categories,
    selectedYear,
    selectedMonth,
    settings,
    deleteTransaction,
    setIsQuickAddOpen,
    setQuickAddType,
  } = useBudget();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const currency = settings.currency;

  // Filter transactions for currently selected month
  const monthTransactions = transactions.filter((t) => {
    const [y, m] = t.date.split('-').map(Number);
    const matchesMonth = y === selectedYear && m - 1 === selectedMonth;
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(search.toLowerCase()));

    return matchesMonth && matchesType && matchesSearch;
  });

  // Month actual totals
  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by date
  const groupedByDate: Record<string, Transaction[]> = {};
  for (const t of monthTransactions) {
    if (!groupedByDate[t.date]) {
      groupedByDate[t.date] = [];
    }
    groupedByDate[t.date].push(t);
  }

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Удалить запись «${title}»?`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Month Actual Summary Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Фактические операции
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Реальные поступления и траты в этом месяце
            </p>
          </div>
          <button
            onClick={() => {
              setQuickAddType('expense');
              setIsQuickAddOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold active:scale-95 transition-all"
          >
            <Plus size={15} />
            Записать
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 block">
              Получено фактически
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatCurrency(totalIncome, currency)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[11px] font-medium text-rose-800 dark:text-rose-300 block">
              Потрачено фактически
            </span>
            <span className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-400 tabular-nums">
              {formatCurrency(totalExpense, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
          />
        </div>

        <div className="flex p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shrink-0">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-all ${
                filterType === type
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {type === 'all' ? 'Все' : type === 'income' ? 'Доходы' : 'Расходы'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Grouped Transaction Feed */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              В выбранном месяце ещё нет фактических операций.
            </p>
            <button
              onClick={() => {
                setQuickAddType('expense');
                setIsQuickAddOpen(true);
              }}
              className="mt-3 text-xs font-semibold text-slate-900 dark:text-white underline"
            >
              Добавить первый расход за 2 клика
            </button>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const list = groupedByDate[dateStr];
            const dateLabel = formatDateRelative(dateStr);
            const dayDayTotal = list.reduce(
              (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
              0
            );

            return (
              <div key={dateStr} className="space-y-2">
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {dateLabel}
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${
                      dayDayTotal > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : dayDayTotal < 0
                        ? 'text-slate-600 dark:text-slate-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatCurrency(dayDayTotal, currency, true)}
                  </span>
                </div>

                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {list.map((tx) => {
                    const category = categories.find((c) => c.id === tx.categoryId);
                    const isIncome = tx.type === 'income';

                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CategoryIcon
                            iconName={category?.icon || 'Circle'}
                            color={category?.color || '#64748b'}
                            size={18}
                            withBackground
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {tx.title}
                            </h4>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                              {category?.name} {tx.note && `· ${tx.note}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-xs font-bold tabular-nums ${
                              isIncome
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {formatCurrency(tx.amount, currency, isIncome)}
                          </span>

                          <button
                            onClick={() => handleDelete(tx.id, tx.title)}
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                            title="Удалить операцию"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
