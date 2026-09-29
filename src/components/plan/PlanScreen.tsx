import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { RecurringItem, TransactionType } from '../../types/budget';
import { RecurringItemCard } from './RecurringItemCard';
import { AddPlanSheet } from './AddPlanSheet';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';
import { Plus, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';

export const PlanScreen: React.FC = () => {
  const { recurringItems, summary, settings } = useBudget();
  const [filter, setFilter] = useState<'all' | 'income' | 'essential' | 'nonEssential'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState<TransactionType>('expense');
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);

  const currency = settings.currency;

  const handleOpenAdd = (type: TransactionType) => {
    setEditingItem(null);
    setAddType(type);
    setIsAddOpen(true);
  };

  const handleEdit = (item: RecurringItem) => {
    setEditingItem(item);
    setAddType(item.type);
    setIsAddOpen(true);
  };

  // Filter items
  const filteredItems = recurringItems.filter((item) => {
    if (filter === 'income') return item.type === 'income';
    if (filter === 'essential') return item.type === 'expense' && item.isEssential;
    if (filter === 'nonEssential') return item.type === 'expense' && !item.isEssential;
    return true;
  });

  const incomeItems = recurringItems.filter((i) => i.type === 'income');
  const expenseItems = recurringItems.filter((i) => i.type === 'expense');

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Plan Header Summary Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Регулярный план месяца
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Базовые доходы и расходы, ожидаемые каждый месяц
            </p>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
            Остаток: {formatCompactNumber(summary.plannedRemaining, currency)}
          </span>
        </div>

        {/* 2-col mini summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 block">
              Плановый доход
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatCurrency(summary.plannedIncome, currency)}
            </span>
            <span className="text-[10px] text-emerald-600/80 block mt-0.5">
              {incomeItems.length} {incomeItems.length === 1 ? 'источник' : 'источника'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block">
              Плановые расходы
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(summary.plannedExpenses, currency)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {expenseItems.length} {expenseItems.length === 1 ? 'статья' : 'статей'}
            </span>
          </div>
        </div>

        {/* Add buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleOpenAdd('income')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold active:scale-98 transition-all"
          >
            <Plus size={16} />
            + Доход в план
          </button>
          <button
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold active:scale-98 transition-all"
          >
            <Plus size={16} />
            + Расход в план
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'Все статьи' },
          { id: 'income', label: 'Доходы' },
          { id: 'essential', label: 'Обязательные' },
          { id: 'nonEssential', label: 'Необязательные' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-semibold'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List of items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              В этой категории пока нет записей.
            </p>
            <button
              onClick={() => handleOpenAdd('expense')}
              className="mt-3 text-xs font-semibold text-slate-900 dark:text-white underline"
            >
              Добавить первый расход в план
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <RecurringItemCard key={item.id} item={item} onEdit={handleEdit} />
          ))
        )}
      </div>

      {/* Add / Edit Sheet Modal */}
      <AddPlanSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        editItem={editingItem}
        initialType={addType}
      />
    </div>
  );
};
