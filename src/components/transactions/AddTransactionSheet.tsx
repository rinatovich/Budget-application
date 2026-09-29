import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ModalBottomSheet } from '../common/ModalBottomSheet';
import { CategoryIcon } from '../common/CategoryIcon';
import { TransactionType } from '../../types/budget';
import { Check } from 'lucide-react';

interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
}

export const AddTransactionSheet: React.FC<AddTransactionSheetProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
}) => {
  const { categories, addTransaction, recentCategoryIds, settings } = useBudget();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setType(initialType);
    setAmount('');
    setCustomTitle('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setError(null);

    // Pick top recent category for quick 1-tap UX
    const match = recentCategoryIds.find((id) => {
      const cat = categories.find((c) => c.id === id);
      return cat && cat.type === initialType;
    });
    if (match) {
      setCategoryId(match);
    } else {
      const firstCat = categories.find((c) => c.type === initialType);
      if (firstCat) setCategoryId(firstCat.id);
    }
  }, [isOpen, initialType, categories, recentCategoryIds]);

  const availableCategories = categories.filter((c) => c.type === type);

  // Quick amounts (50k, 100k, 200k, 500k, 1M for UZS; 10, 20, 50, 100 for USD)
  const quickAmounts = settings.currency === 'UZS'
    ? [50000, 100000, 200000, 500000, 1000000]
    : [10, 25, 50, 100, 200];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseFloat(amount.replace(/\s+/g, '')) || 0;
    if (num <= 0) {
      setError('Введите сумму');
      return;
    }
    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const finalTitle = customTitle.trim() || selectedCategory?.name || (type === 'income' ? 'Доход' : 'Расход');

    addTransaction({
      title: finalTitle,
      amount: num,
      type,
      categoryId,
      date,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <ModalBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'income' ? 'Добавить доход' : 'Быстрый расход'}
      subtitle="Максимум 2 действия: введите сумму и нажмите категорию"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              const first = categories.find((c) => c.type === 'expense');
              if (first) setCategoryId(first.id);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Расход
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              const first = categories.find((c) => c.type === 'income');
              if (first) setCategoryId(first.id);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Доход
          </button>
        </div>

        {/* Big Amount Input */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
            Сумма ({settings.currency})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-3xl font-bold tabular-nums text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
          />
        </div>

        {/* Quick Amount Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickAmounts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q.toString())}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums shrink-0 transition-colors"
            >
              +{q.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Categories Grid (Sorted with most frequent first!) */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
            Категория (выберите одно нажатие)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
            {availableCategories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold ring-2 ring-slate-950 dark:ring-white'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <CategoryIcon
                    iconName={cat.icon}
                    color={isSelected ? (type === 'income' ? '#10b981' : '#f43f5e') : cat.color}
                    size={18}
                  />
                  <span className="text-xs truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Title / Note Accordion */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1 block">
              Название (необяз.)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Напр. Корзинка"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1 block">Дата</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Big Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-lg shadow-slate-900/10 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Check size={18} />
          <span>{type === 'income' ? 'Сохранить доход' : 'Сохранить расход'}</span>
        </button>
      </form>
    </ModalBottomSheet>
  );
};
