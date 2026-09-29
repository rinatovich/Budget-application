import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';

export const BudgetAlerts: React.FC = () => {
  const { summary, settings } = useBudget();
  const currency = settings.currency;

  const alerts: Array<{
    type: 'danger' | 'warning' | 'info' | 'success';
    title: string;
    text: string;
  }> = [];

  // Condition 1: Expenses exceed income
  if (summary.isOverBudget) {
    alerts.push({
      type: 'danger',
      title: 'Внимание: превышение бюджета',
      text: `В этом месяце запланированные расходы превышают доходы на ${formatCurrency(
        summary.overBudgetAmount,
        currency
      )}.`,
    });
  }

  // Condition 2: Essential expenses share
  if (summary.plannedIncome > 0 && summary.essentialExpensePercentage > 70) {
    alerts.push({
      type: 'warning',
      title: 'Высокая доля обязательных расходов',
      text: `Ваши обязательные расходы составляют ${summary.essentialExpensePercentage}% дохода (${formatCurrency(
        summary.plannedEssentialExpenses,
        currency
      )}).`,
    });
  }

  // Condition 3: Healthy budget feedback
  if (!summary.isOverBudget && summary.plannedIncome > 0 && summary.essentialExpensePercentage <= 50) {
    alerts.push({
      type: 'success',
      title: 'Комфортный уровень расходов',
      text: `Обязательные расходы составляют ${summary.essentialExpensePercentage}% дохода. Остаётся ${formatCurrency(
        summary.plannedRemaining,
        currency
      )} свободных средств.`,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {alerts.map((alert, idx) => {
        const isDanger = alert.type === 'danger';
        const isWarning = alert.type === 'warning';
        const isSuccess = alert.type === 'success';

        const bg = isDanger
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
          : isWarning
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200';

        const Icon = isDanger ? AlertTriangle : isWarning ? ShieldAlert : CheckCircle2;

        return (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${bg} transition-all`}
          >
            <Icon size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">{alert.title}</span>
              <p className="mt-0.5 opacity-90 leading-relaxed">{alert.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
