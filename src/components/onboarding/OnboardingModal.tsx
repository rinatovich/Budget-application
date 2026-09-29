import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ModalBottomSheet } from '../common/ModalBottomSheet';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { addRecurringItem, updateSettings, settings } = useBudget();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Quick inputs
  const [salaryAmount, setSalaryAmount] = useState('40000000');
  const [salaryDay, setSalaryDay] = useState(5);

  const [selectedExpenses, setSelectedExpenses] = useState<{
    housing: boolean;
    loans: boolean;
    groceries: boolean;
    transport: boolean;
  }>({
    housing: true,
    loans: true,
    groceries: true,
    transport: true,
  });

  const handleFinish = (useCustom: boolean) => {
    if (useCustom) {
      // Add custom salary
      const salaryNum = parseFloat(salaryAmount.replace(/\s+/g, '')) || 40000000;
      addRecurringItem({
        title: 'Основная зарплата',
        amount: salaryNum,
        type: 'income',
        frequency: 'monthly',
        dayOfMonth: salaryDay,
        categoryId: 'salary',
        isEssential: false,
        isActive: true,
      });

      // Add selected expenses with sensible defaults
      if (selectedExpenses.housing) {
        addRecurringItem({
          title: 'Аренда жилья',
          amount: 5000000,
          type: 'expense',
          frequency: 'monthly',
          dayOfMonth: 1,
          categoryId: 'housing',
          isEssential: true,
          isActive: true,
        });
      }
      if (selectedExpenses.loans) {
        addRecurringItem({
          title: 'Кредит / рассрочка',
          amount: 8000000,
          type: 'expense',
          frequency: 'monthly',
          dayOfMonth: 10,
          categoryId: 'loans',
          isEssential: true,
          isActive: true,
        });
      }
      if (selectedExpenses.groceries) {
        addRecurringItem({
          title: 'Продукты на неделю',
          amount: 500000,
          type: 'expense',
          frequency: 'weekly',
          dayOfWeek: 6, // Суббота
          categoryId: 'groceries',
          isEssential: true,
          isActive: true,
        });
      }
      if (selectedExpenses.transport) {
        addRecurringItem({
          title: 'Транспорт и бензин',
          amount: 1500000,
          type: 'expense',
          frequency: 'monthly',
          dayOfMonth: 15,
          categoryId: 'transport',
          isEssential: true,
          isActive: true,
        });
      }
    }

    updateSettings({ hasCompletedOnboarding: true });
    onClose();
  };

  return (
    <ModalBottomSheet
      isOpen={isOpen}
      onClose={() => handleFinish(false)}
      title="Настройка бюджета"
      subtitle={step === 1 ? 'Знакомство' : step === 2 ? 'Шаг 1 из 2: Доход' : 'Шаг 2 из 2: Расходы'}
    >
      <div className="space-y-4 py-2">
        {step === 1 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 mx-auto flex items-center justify-center shadow-lg">
              <Sparkles size={28} />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Ваш персональный бюджет
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Введите регулярные доходы и расходы один раз. Приложение само рассчитает, сколько
                останется и сколько можно тратить в неделю.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Начать настройку</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => handleFinish(false)}
                className="py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Пропустить (заполнить позже)
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Какой у вас основной доход?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Например, ежемесячная зарплата
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                Сумма ({settings.currency})
              </label>
              <input
                type="number"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-2xl font-bold tabular-nums text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                Какого числа получаете? ({salaryDay} числа каждого месяца)
              </label>
              <input
                type="range"
                min="1"
                max="31"
                value={salaryDay}
                onChange={(e) => setSalaryDay(parseInt(e.target.value))}
                className="w-full accent-slate-900 dark:accent-white"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Далее: регулярные расходы</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Какие есть регулярные расходы?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Отметьте статьи, которые актуальны для вас:
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'housing', label: 'Аренда жилья / ипотека', amount: '5 000 000 сум' },
                { id: 'loans', label: 'Кредиты или рассрочки', amount: '8 000 000 сум' },
                { id: 'groceries', label: 'Продукты (еженедельно)', amount: '500 000 сум / нед' },
                { id: 'transport', label: 'Бензин / транспорт', amount: '1 500 000 сум' },
              ].map((item) => {
                const key = item.id as keyof typeof selectedExpenses;
                const isChecked = selectedExpenses[key];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelectedExpenses((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isChecked
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 font-medium'
                        : 'border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <span className="text-xs text-slate-900 dark:text-white block">{item.label}</span>
                      <span className="text-[11px] text-slate-400">{item.amount}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        isChecked ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-300'
                      }`}
                    >
                      {isChecked && <Check size={13} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleFinish(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Готово, открыть приложение!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalBottomSheet>
  );
};
