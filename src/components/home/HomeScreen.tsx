import React from 'react';
import { BalanceHeroCard } from './BalanceHeroCard';
import { QuickActionRow } from './QuickActionRow';
import { BudgetAlerts } from './BudgetAlerts';
import { ScenarioSimulator } from './ScenarioSimulator';
import { IncomeExpenseBarChart } from './IncomeExpenseBarChart';
import { CategoryPieChart } from './CategoryPieChart';
import { CashFlowChart } from './CashFlowChart';
import { MainExpensesList } from './MainExpensesList';

export const HomeScreen: React.FC = () => {
  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* 1. Main Hero Metric & Overview */}
      <BalanceHeroCard />

      {/* 2. Quick 1-tap repetitive action row */}
      <QuickActionRow />

      {/* 3. Objective alerts & warnings */}
      <BudgetAlerts />

      {/* 4. What-If Scenario Modeling */}
      <ScenarioSimulator />

      {/* 5. Income vs Expenses Bar Chart */}
      <IncomeExpenseBarChart />

      {/* 6. Category Donut Distribution */}
      <CategoryPieChart />

      {/* 7. Daily Cash Flow Timeline (1..30/31 days) */}
      <CashFlowChart />

      {/* 8. Top 4 Planned Expenses List */}
      <MainExpensesList />
    </div>
  );
};
