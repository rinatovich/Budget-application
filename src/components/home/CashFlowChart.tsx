import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';
import { AlertCircle, TrendingDown, Info } from 'lucide-react';

export const CashFlowChart: React.FC = () => {
  const { cashFlow, settings, selectedMonth } = useBudget();
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

  const { points, minBalance, minBalanceDay } = cashFlow;
  const currency = settings.currency;

  if (points.length === 0) return null;

  // Chart dimensions
  const width = 360;
  const height = 160;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 30;

  // Find range
  const allBalances = points.map((p) => p.cumulativeBalance);
  const rawMin = Math.min(...allBalances, 0);
  const rawMax = Math.max(...allBalances, 1000);

  // Add buffer
  const range = rawMax - rawMin || 1;
  const minY = rawMin - range * 0.05;
  const maxY = rawMax + range * 0.05;

  const getX = (index: number) => {
    return paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const norm = (val - minY) / (maxY - minY);
    return height - paddingBottom - norm * (height - paddingTop - paddingBottom);
  };

  // Generate SVG path for line and area fill
  const linePoints = points.map((p, i) => `${getX(i)},${getY(p.cumulativeBalance)}`);
  const pathD = `M ${linePoints.join(' L ')}`;
  const areaD = `${pathD} L ${getX(points.length - 1)},${height - paddingBottom} L ${getX(0)},${height - paddingBottom} Z`;

  // Selected or minimum day detail
  const currentPoint =
    activeDayIndex !== null ? points[activeDayIndex] : points.find((p) => p.day === minBalanceDay) || points[0];

  const zeroY = getY(0);
  const isZeroVisible = zeroY >= paddingTop && zeroY <= height - paddingBottom;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Движение денег по дням
            </h2>
            <div className="group relative">
              <Info size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" />
              <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 rounded-xl bg-slate-950 text-white text-[11px] leading-tight shadow-xl z-20 pointer-events-none">
                Прогноз баланса с учётом дат выплаты зарплаты и списания платежей по дням месяца.
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Прогнозируемый баланс на каждый день месяца
          </p>
        </div>

        {/* Min balance callout */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <TrendingDown size={12} />
            <span>Минимум ({minBalanceDay} число)</span>
          </div>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
            {formatCurrency(minBalance, currency)}
          </div>
        </div>
      </div>

      {/* Selected day banner */}
      <div className="px-3.5 py-2 mb-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {currentPoint.day} число ({currentPoint.dayOfWeek}):
          </span>{' '}
          <span className="text-slate-500 dark:text-slate-400">
            {currentPoint.events.length > 0
              ? currentPoint.events.map((e) => e.title).join(', ')
              : 'Нет плановых списаний'}
          </span>
        </div>
        <span
          className={`font-bold tabular-nums ${
            currentPoint.cumulativeBalance < 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {formatCurrency(currentPoint.cumulativeBalance, currency)}
        </span>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 overflow-visible"
          onMouseLeave={() => setActiveDayIndex(null)}
          onTouchEnd={() => setActiveDayIndex(null)}
        >
          <defs>
            <linearGradient id="cashFlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="cashFlowLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth="1"
          />

          {isZeroVisible && (
            <line
              x1={paddingX}
              y1={zeroY}
              x2={width - paddingX}
              y2={zeroY}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeWidth="1"
              opacity="0.6"
            />
          )}

          {/* Area Fill */}
          <path d={areaD} fill="url(#cashFlowGrad)" />

          {/* Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#cashFlowLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Min Balance Point Indicator */}
          <circle
            cx={getX(minBalanceDay - 1)}
            cy={getY(minBalance)}
            r="4.5"
            className="fill-amber-500 stroke-white dark:stroke-slate-900"
            strokeWidth="2"
          />

          {/* Active Hover/Touch Marker */}
          {activeDayIndex !== null && (
            <g>
              <line
                x1={getX(activeDayIndex)}
                y1={paddingTop}
                x2={getX(activeDayIndex)}
                y2={height - paddingBottom}
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-600"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(activeDayIndex)}
                cy={getY(points[activeDayIndex].cumulativeBalance)}
                r="5"
                className="fill-emerald-600 stroke-white dark:stroke-slate-900"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Day X-Axis Labels */}
          {[1, 5, 10, 15, 20, 25, points.length].map((d) => {
            const idx = Math.min(d - 1, points.length - 1);
            return (
              <text
                key={d}
                x={getX(idx)}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                className="fill-slate-400 dark:fill-slate-500 font-medium"
              >
                {d}
              </text>
            );
          })}

          {/* Interactive touch hit areas for all days */}
          {points.map((p, idx) => {
            const x = getX(idx);
            return (
              <rect
                key={p.day}
                x={x - (width - paddingX * 2) / points.length / 2}
                y={0}
                width={(width - paddingX * 2) / points.length}
                height={height}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setActiveDayIndex(idx)}
                onTouchStart={() => setActiveDayIndex(idx)}
              />
            );
          })}
        </svg>
      </div>

      {minBalance < 0 && (
        <div className="mt-3 px-3.5 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle size={15} className="text-rose-600 shrink-0" />
          <span>
            Внимание: {minBalanceDay}-го числа баланс временно уходит в минус ({formatCurrency(minBalance, currency)}).
            Возможно, стоит сдвинуть оплату расходов после поступления доходов.
          </span>
        </div>
      )}
    </div>
  );
};
