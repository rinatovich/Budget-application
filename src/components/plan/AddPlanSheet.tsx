import React, { useState, useEffect } from 'react';
import { RecurringItem, Frequency, TransactionType } from '../../types/budget';
import { useBudget } from '../../context/BudgetContext';
import { ModalBottomSheet } from '../common/ModalBottomSheet';
import { CategoryIcon } from '../common/CategoryIcon';
import { DAY_NAMES_RU, formatCurrency } from '../../utils/formatters';
import { calculateOccurrencesInMonth } from '../../utils/calculator';

interface AddPlanSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: RecurringItem | null;
  initialType?: TransactionType;
}

export const AddPlanSheet: React.FC<AddPlanSheetProps> = ({
  isOpen,
  onClose,
  editItem,
  initialType = 'expense',
}) => {
  const {
    categories,
    addRecurringItem,
    updateRecurringItem,
    selectedYear,
    selectedMonth,
    settings,
  } = useBudget();

  const [type, setType] = useState<TransactionType>(editItem ? editItem.type : initialType);
  const [title, setTitle] = useState(editItem ? editItem.title : '');
  const [amount, setAmount] = useState(editItem ? editItem.amount.toString() : '');
  const [categoryId, setCategoryId] = useState(editItem ? editItem.categoryId : '');
  const [frequency, setFrequency] = useState<Frequency>(editItem ? editItem.frequency : 'monthly');
  const [dayOfWeek, setDayOfWeek] = useState<number>(editItem?.dayOfWeek ?? 6); // default Saturday
  const [dayOfMonth, setDayOfMonth] = useState<number>(editItem?.dayOfMonth ?? 1); // 1..31 or -1
  const [isLastDayOfMonth, setIsLastDayOfMonth] = useState<boolean>(editItem?.dayOfMonth === -1);
  const [isEssential, setIsEssential] = useState<boolean>(editItem ? editItem.isEssential : true);
  const [comment, setComment] = useState(editItem?.comment ?? '');
  const [error, setError] = useState<string | null>(null);

  // Sync state if editItem changes
  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setTitle(editItem.title);
      setAmount(editItem.amount.toString());
      setCategoryId(editItem.categoryId);
      setFrequency(editItem.frequency);
      setDayOfWeek(editItem.dayOfWeek ?? 6);
      setDayOfMonth(editItem.dayOfMonth ?? 1);
      setIsLastDayOfMonth(editItem.dayOfMonth === -1);
      setIsEssential(editItem.isEssential);
      setComment(editItem.comment ?? '');
    } else {
      setType(initialType);
      setTitle('');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === initialType);
      setCategoryId(defaultCat ? defaultCat.id : '');
      setFrequency('monthly');
      setDayOfWeek(6);
      setDayOfMonth(1);
      setIsLastDayOfMonth(false);
      setIsEssential(true);
      setComment('');
    }
    setError(null);
  }, [editItem, initialType, categories, isOpen]);

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);

  // Calculate live preview occurrences
  const numAmount = parseFloat(amount.replace(/\s+/g, '')) || 0;
  const tempItem: RecurringItem = {
    id: 'temp',
    title,
    amount: numAmount,
    type,
    frequency,
    dayOfWeek,
    dayOfMonth: isLastDayOfMonth ? -1 : dayOfMonth,
    categoryId,
    isEssential,
    isActive: true,
    createdAt: '',
  };
  const liveOccurrences = calculateOccurrencesInMonth(tempItem, selectedYear, selectedMonth);
  const liveMonthlyTotal = numAmount * liveOccurrences;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Укажите название статьи');
      return;
    }
    if (numAmount <= 0) {
      setError('Сумма должна быть больше 0');
      return;
    }
    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }

    const payload = {
      title: title.trim(),
      amount: numAmount,
      type,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? (isLastDayOfMonth ? -1 : dayOfMonth) : undefined,
      categoryId,
      isEssential: type === 'expense' ? isEssential : false,
      isActive: true,
      comment: comment.trim() || undefined,
    };

    if (editItem) {
      updateRecurringItem(editItem.id, payload);
    } else {
      addRecurringItem(payload);
    }

    onClose();
  };

  return (
    <ModalBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Редактировать план' : type === 'income' ? 'Новый регулярный доход' : 'Новый регулярный расход'}
      subtitle="Автоматически рассчитывается в бюджете каждого месяца"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type Segmented Control */}
        {!editItem && (
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const defaultCat = categories.find((c) => c.type === 'expense');
                if (defaultCat) setCategoryId(defaultCat.id);
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
                const defaultCat = categories.find((c) => c.type === 'income');
                if (defaultCat) setCategoryId(defaultCat.id);
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
        )}

        {/* Amount Input */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
            Сумма ({settings.currency})
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-2xl font-bold tabular-nums text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
            Название
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'income' ? 'Например: Зарплата' : 'Например: Аренда, Продукты'}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
          />
        </div>

        {/* Category Picker */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
            Категория
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto no-scrollbar p-1">
            {availableCategories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CategoryIcon
                    iconName={cat.icon}
                    color={isSelected ? (type === 'income' ? '#10b981' : '#f43f5e') : cat.color}
                    size={16}
                  />
                  <span className="text-xs truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frequency Picker */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
            Периодичность повторения
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'monthly', label: 'Ежемесячно' },
              { id: 'weekly', label: 'Еженедельно' },
              { id: 'daily', label: 'Ежедневно' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequency(f.id as Frequency)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  frequency === f.id
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Details: Day of week for Weekly */}
        {frequency === 'weekly' && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
              В какой день недели?
            </span>
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES_RU.map((d) => (
                <button
                  key={d.index}
                  type="button"
                  onClick={() => setDayOfWeek(d.index)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    dayOfWeek === d.index
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Frequency Details: Day of month for Monthly */}
        {frequency === 'monthly' && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                День списания в месяце:
              </span>
              <button
                type="button"
                onClick={() => setIsLastDayOfMonth(!isLastDayOfMonth)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isLastDayOfMonth
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Последний день месяца
              </button>
            </div>

            {!isLastDayOfMonth && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                  className="flex-1 accent-slate-900 dark:accent-white"
                />
                <span className="w-12 text-center text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 py-1 rounded-lg border border-slate-200 dark:border-slate-600 tabular-nums">
                  {dayOfMonth} числ.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Essential flag for expense */}
        {type === 'expense' && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Обязательный расход?
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEssential
                  ? 'Аренда, кредиты, коммуналка, базовые продукты'
                  : 'Рестораны, развлечения, покупки, кино'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEssential(!isEssential)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isEssential ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 absolute top-0.5 transition-transform ${
                  isEssential ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        )}

        {/* Live Monthly Forecast Preview */}
        {numAmount > 0 && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
            <span>Прогноз за выбранный месяц:</span>
            <span className="font-bold tabular-nums">
              {formatCurrency(liveMonthlyTotal, settings.currency)} ({liveOccurrences} {liveOccurrences === 1 ? 'раз' : 'раза'})
            </span>
          </div>
        )}

        {/* Comment Input */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
            Заметка (необязательно)
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий для себя"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-lg shadow-slate-900/10 active:scale-98 transition-all"
        >
          {editItem ? 'Сохранить изменения' : 'Добавить в план'}
        </button>
      </form>
    </ModalBottomSheet>
  );
};
