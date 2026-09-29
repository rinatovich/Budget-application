import { RecurringItem, Transaction, MonthBudgetSummary, DailyCashFlowPoint, ScenarioSimulation } from '../types/budget';
import { MONTH_NAMES_RU, DAY_NAMES_RU } from './formatters';

/**
 * Returns number of days in a given year and month (month is 0-indexed: 0 = Jan, 11 = Dec)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Calculate the exact occurrences of a recurring item in a given month.
 * Implements strict calendar-accurate logic (e.g. counting exact Saturdays/Tuesdays, leap years, etc.)
 */
export function calculateOccurrencesInMonth(item: RecurringItem, year: number, month: number): number {
  if (!item.isActive) return 0;
  
  const daysInMonth = getDaysInMonth(year, month);

  switch (item.frequency) {
    case 'daily':
      return daysInMonth;

    case 'weekly': {
      if (item.dayOfWeek === undefined) return Math.floor(daysInMonth / 7);
      
      let count = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date.getDay() === item.dayOfWeek) {
          count++;
        }
      }
      return count;
    }

    case 'monthly':
      return 1;

    case 'yearly': {
      if (!item.date) return 0;
      const [, m] = item.date.split('-').map(Number);
      return (m - 1 === month) ? 1 : 0;
    }

    case 'once': {
      if (!item.date) return 0;
      const [y, m] = item.date.split('-').map(Number);
      return (y === year && m - 1 === month) ? 1 : 0;
    }

    default:
      return 0;
  }
}

/**
 * Calculate total monthly amount for a recurring item in a specific month
 */
export function getItemMonthlyTotal(item: RecurringItem, year: number, month: number): number {
  const occurrences = calculateOccurrencesInMonth(item, year, month);
  return item.amount * occurrences;
}

/**
 * Determines which exact days in a month an item occurs on
 */
export function getItemOccurringDays(item: RecurringItem, year: number, month: number): number[] {
  if (!item.isActive) return [];
  const daysInMonth = getDaysInMonth(year, month);
  const result: number[] = [];

  switch (item.frequency) {
    case 'daily':
      for (let d = 1; d <= daysInMonth; d++) result.push(d);
      break;

    case 'weekly':
      if (item.dayOfWeek !== undefined) {
        for (let d = 1; d <= daysInMonth; d++) {
          if (new Date(year, month, d).getDay() === item.dayOfWeek) {
            result.push(d);
          }
        }
      }
      break;

    case 'monthly': {
      if (item.dayOfMonth === -1) {
        // Last day of month
        result.push(daysInMonth);
      } else {
        const targetDay = item.dayOfMonth || 1;
        result.push(Math.min(targetDay, daysInMonth));
      }
      break;
    }

    case 'yearly': {
      if (item.date) {
        const [, m, d] = item.date.split('-').map(Number);
        if (m - 1 === month) {
          result.push(Math.min(d, daysInMonth));
        }
      }
      break;
    }

    case 'once': {
      if (item.date) {
        const [y, m, d] = item.date.split('-').map(Number);
        if (y === year && m - 1 === month) {
          result.push(Math.min(d, daysInMonth));
        }
      }
      break;
    }
  }

  return result;
}

/**
 * Compute the full monthly budget summary
 */
export function calculateMonthSummary(
  recurringItems: RecurringItem[],
  transactions: Transaction[],
  year: number,
  month: number,
  scenario?: ScenarioSimulation
): MonthBudgetSummary {
  const daysInMonth = getDaysInMonth(year, month);
  const monthName = MONTH_NAMES_RU[month];

  // Active items (including scenario item if active)
  let itemsToCalculate = recurringItems.filter(i => i.isActive);

  if (scenario && scenario.isActive && scenario.amount > 0) {
    const scenarioItem: RecurringItem = {
      id: 'scenario_temp',
      title: scenario.title || 'Временный расход',
      amount: scenario.amount,
      type: 'expense',
      frequency: scenario.frequency,
      dayOfMonth: scenario.dayOfMonth || 15,
      dayOfWeek: 5,
      categoryId: 'other',
      isEssential: scenario.isEssential,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    itemsToCalculate = [...itemsToCalculate, scenarioItem];
  }

  let plannedIncome = 0;
  let plannedEssentialExpenses = 0;
  let plannedNonEssentialExpenses = 0;

  for (const item of itemsToCalculate) {
    const total = getItemMonthlyTotal(item, year, month);
    if (item.type === 'income') {
      plannedIncome += total;
    } else {
      if (item.isEssential) {
        plannedEssentialExpenses += total;
      } else {
        plannedNonEssentialExpenses += total;
      }
    }
  }

  const plannedExpenses = plannedEssentialExpenses + plannedNonEssentialExpenses;
  const plannedRemaining = plannedIncome - plannedExpenses;

  // Actual transactions in this month
  let actualIncome = 0;
  let actualExpenses = 0;

  for (const tx of transactions) {
    const [y, m] = tx.date.split('-').map(Number);
    if (y === year && m - 1 === month) {
      if (tx.type === 'income') {
        actualIncome += tx.amount;
      } else {
        actualExpenses += tx.amount;
      }
    }
  }

  const actualRemaining = actualIncome - actualExpenses;

  // Weekly allowance calculation:
  // We use real calendar weeks in month (typically ~4.3 to 4.4 weeks)
  const calendarWeeks = daysInMonth / 7;
  const freeBudgetPerWeek = plannedRemaining > 0 ? Math.round(plannedRemaining / calendarWeeks) : 0;

  const essentialExpensePercentage = plannedIncome > 0
    ? Math.round((plannedEssentialExpenses / plannedIncome) * 100)
    : (plannedEssentialExpenses > 0 ? 100 : 0);

  const isOverBudget = plannedExpenses > plannedIncome;
  const overBudgetAmount = isOverBudget ? (plannedExpenses - plannedIncome) : 0;

  return {
    year,
    month,
    monthName,
    daysInMonth,
    plannedIncome,
    plannedExpenses,
    plannedEssentialExpenses,
    plannedNonEssentialExpenses,
    plannedRemaining,
    actualIncome,
    actualExpenses,
    actualRemaining,
    freeBudgetPerWeek,
    essentialExpensePercentage,
    isOverBudget,
    overBudgetAmount,
  };
}

/**
 * Builds the daily projected cash flow points for each day of the month (1..daysInMonth)
 */
export function buildDailyCashFlow(
  recurringItems: RecurringItem[],
  year: number,
  month: number,
  scenario?: ScenarioSimulation
): { points: DailyCashFlowPoint[]; minBalance: number; minBalanceDay: number } {
  const daysInMonth = getDaysInMonth(year, month);
  const points: DailyCashFlowPoint[] = [];

  let itemsToCalculate = recurringItems.filter(i => i.isActive);

  if (scenario && scenario.isActive && scenario.amount > 0) {
    itemsToCalculate = [
      ...itemsToCalculate,
      {
        id: 'scenario_temp',
        title: scenario.title || 'Временный расход',
        amount: scenario.amount,
        type: 'expense',
        frequency: scenario.frequency,
        dayOfMonth: scenario.dayOfMonth || 15,
        dayOfWeek: 5,
        categoryId: 'other',
        isEssential: scenario.isEssential,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // Pre-map events by day (1..daysInMonth)
  const dayEventsMap = new Map<number, Array<{ title: string; amount: number; type: 'income' | 'expense'; isEssential?: boolean }>>();
  for (let d = 1; d <= daysInMonth; d++) {
    dayEventsMap.set(d, []);
  }

  for (const item of itemsToCalculate) {
    const occurringDays = getItemOccurringDays(item, year, month);
    for (const d of occurringDays) {
      const list = dayEventsMap.get(d) || [];
      list.push({
        title: item.title,
        amount: item.amount,
        type: item.type,
        isEssential: item.isEssential,
      });
      dayEventsMap.set(d, list);
    }
  }

  let runningBalance = 0;
  let minBalance = Infinity;
  let minBalanceDay = 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeekIndex = date.getDay();
    const dayOfWeekName = DAY_NAMES_RU.find(d => d.index === dayOfWeekIndex)?.short || '';
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const events = dayEventsMap.get(day) || [];
    let dayIncome = 0;
    let dayExpense = 0;

    for (const ev of events) {
      if (ev.type === 'income') {
        dayIncome += ev.amount;
      } else {
        dayExpense += ev.amount;
      }
    }

    const netDay = dayIncome - dayExpense;
    runningBalance += netDay;

    if (runningBalance < minBalance) {
      minBalance = runningBalance;
      minBalanceDay = day;
    }

    points.push({
      day,
      dateStr,
      dayOfWeek: dayOfWeekName,
      dayIncome,
      dayExpense,
      netDay,
      cumulativeBalance: runningBalance,
      events,
    });
  }

  return { points, minBalance: minBalance === Infinity ? 0 : minBalance, minBalanceDay };
}
