import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { getItemMonthlyTotal } from '../../utils/calculator';

export const CategoryPieChart: React.FC = () => {
  const { recurringItems, categories, selectedYear, selectedMonth, settings, scenario } = useBudget();
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const currency = settings.currency;

  // Aggregate planned expenses by category
  const categoryTotals: Record<string, { total: number; count: number; isEssential: boolean }> = {};

  const activeExpenses = recurringItems.filter((i) => i.isActive && i.type === 'expense');

  for (const item of activeExpenses) {
    const amount = getItemMonthlyTotal(item, selectedYear, selectedMonth);
    if (!categoryTotals[item.categoryId]) {
      categoryTotals[item.categoryId] = { total: 0, count: 0, isEssential: item.isEssential };
    }
    categoryTotals[item.categoryId].total += amount;
    categoryTotals[item.categoryId].count += 1;
  }

  // Include scenario if active
  if (scenario.isActive && scenario.amount > 0) {
    const catId = 'other_expense';
    if (!categoryTotals[catId]) {
      categoryTotals[catId] = { total: 0, count: 0, isEssential: scenario.isEssential };
    }
    categoryTotals[catId].total += scenario.amount;
    categoryTotals[catId].count += 1;
  }

  const grandTotal = Object.values(categoryTotals).reduce((sum, c) => sum + c.total, 0);

  const items = Object.entries(categoryTotals)
    .map(([catId, data]) => {
      const category = categories.find((c) => c.id === catId) || {
        id: catId,
        name: catId === 'other_expense' ? 'Другое' : catId,
        icon: 'MoreHorizontal',
        color: '#64748b',
        type: 'expense' as const,
        isDefault: false,
      };
      const percentage = grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0;
      return {
        category,
        total: data.total,
        count: data.count,
        percentage,
      };
    })
    .sort((a, b) => b.total - a.total);

  if (items.length === 0 || grandTotal === 0) {
    return (
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Пока нет плановых расходов в этом месяце.
        </p>
      </div>
    );
  }

  // Calculate SVG Donut arcs
  const radius = 64;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const activeCategory = items.find((i) => i.category.id === selectedCatId) || items[0];

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            Куда уходят деньги
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Распределение плановых расходов по категориям
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          Всего: {formatCompactNumber(grandTotal, currency)}
        </span>
      </div>

      {/* Donut and Active Focus */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800"
            />

            {/* Slices */}
            {items.map((item) => {
              const dashLength = (item.percentage / 100) * circumference;
              const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
              const strokeDashoffset = -accumulatedAngle;
              accumulatedAngle += dashLength;

              const isSelected = selectedCatId === item.category.id;

              return (
                <circle
                  key={item.category.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={item.category.color}
                  strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  onClick={() => setSelectedCatId(item.category.id)}
                />
              );
            })}
          </svg>

          {/* Center text in Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-[100px]">
              {activeCategory?.category.name}
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {activeCategory?.percentage}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
              {formatCompactNumber(activeCategory?.total || 0, currency)}
            </span>
          </div>
        </div>

        {/* Category List */}
        <div className="w-full flex-1 space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
          {items.map((item) => {
            const isSelected = (selectedCatId || items[0]?.category.id) === item.category.id;
            return (
              <button
                key={item.category.id}
                onClick={() => setSelectedCatId(item.category.id)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800/80 shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  />
                  <CategoryIcon
                    iconName={item.category.icon}
                    color={item.category.color}
                    size={16}
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.category.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(item.total, currency)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums w-8 text-right font-medium">
                    {item.percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
