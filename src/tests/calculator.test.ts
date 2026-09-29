import { describe, it, expect } from 'vitest';
import {
  calculateOccurrencesInMonth,
  calculateMonthSummary,
  getDaysInMonth,
  buildDailyCashFlow,
} from '../utils/calculator';
import { RecurringItem, Transaction } from '../types/budget';

describe('Budget Calculator & Calendar Accuracies', () => {
  it('correctly calculates days in different months', () => {
    // 2026 is not a leap year: Feb has 28 days
    expect(getDaysInMonth(2026, 1)).toBe(28);
    // September has 30 days
    expect(getDaysInMonth(2026, 8)).toBe(30);
    // October has 31 days
    expect(getDaysInMonth(2026, 9)).toBe(31);
    // Leap year 2024: Feb has 29 days
    expect(getDaysInMonth(2024, 1)).toBe(29);
  });

  it('accurately counts weekly occurrences in September 2026 (calendar accurate, not just x 4)', () => {
    // In September 2026:
    // Sept 1 is Tuesday.
    // Saturdays (day 6): Sept 5, 12, 19, 26 => exactly 4
    const grocerySaturday: RecurringItem = {
      id: 'groc',
      title: 'Продукты суббота',
      amount: 500000,
      type: 'expense',
      frequency: 'weekly',
      dayOfWeek: 6, // Saturday
      categoryId: 'groceries',
      isEssential: true,
      isActive: true,
      createdAt: '',
    };

    expect(calculateOccurrencesInMonth(grocerySaturday, 2026, 8)).toBe(4);

    // Tuesdays (day 2): Sept 1, 8, 15, 22, 29 => exactly 5!
    const tuesdayItem: RecurringItem = {
      id: 'tue',
      title: 'Вторник',
      amount: 100000,
      type: 'expense',
      frequency: 'weekly',
      dayOfWeek: 2, // Tuesday
      categoryId: 'other',
      isEssential: false,
      isActive: true,
      createdAt: '',
    };

    expect(calculateOccurrencesInMonth(tuesdayItem, 2026, 8)).toBe(5);
  });

  it('calculates full monthly budget summary properly', () => {
    const salary: RecurringItem = {
      id: 'sal',
      title: 'Зарплата',
      amount: 40000000,
      type: 'income',
      frequency: 'monthly',
      dayOfMonth: 5,
      categoryId: 'salary',
      isEssential: false,
      isActive: true,
      createdAt: '',
    };

    const rent: RecurringItem = {
      id: 'rent',
      title: 'Жильё',
      amount: 5000000,
      type: 'expense',
      frequency: 'monthly',
      dayOfMonth: 1,
      categoryId: 'housing',
      isEssential: true,
      isActive: true,
      createdAt: '',
    };

    const loan: RecurringItem = {
      id: 'loan',
      title: 'Кредит',
      amount: 8000000,
      type: 'expense',
      frequency: 'monthly',
      dayOfMonth: 10,
      categoryId: 'loans',
      isEssential: true,
      isActive: true,
      createdAt: '',
    };

    const summary = calculateMonthSummary([salary, rent, loan], [], 2026, 8);

    expect(summary.plannedIncome).toBe(40000000);
    expect(summary.plannedEssentialExpenses).toBe(13000000);
    expect(summary.plannedExpenses).toBe(13000000);
    expect(summary.plannedRemaining).toBe(27000000);
    expect(summary.isOverBudget).toBe(false);
  });

  it('detects over-budget conditions accurately', () => {
    const lowIncome: RecurringItem = {
      id: 'low',
      title: 'Доход',
      amount: 5000000,
      type: 'income',
      frequency: 'monthly',
      dayOfMonth: 5,
      categoryId: 'salary',
      isEssential: false,
      isActive: true,
      createdAt: '',
    };

    const bigExpense: RecurringItem = {
      id: 'big',
      title: 'Большой расход',
      amount: 7500000,
      type: 'expense',
      frequency: 'monthly',
      dayOfMonth: 10,
      categoryId: 'other',
      isEssential: true,
      isActive: true,
      createdAt: '',
    };

    const summary = calculateMonthSummary([lowIncome, bigExpense], [], 2026, 8);

    expect(summary.isOverBudget).toBe(true);
    expect(summary.overBudgetAmount).toBe(2500000);
  });

  it('builds daily cash flow points correctly', () => {
    const salary: RecurringItem = {
      id: 'sal',
      title: 'Зарплата',
      amount: 10000000,
      type: 'income',
      frequency: 'monthly',
      dayOfMonth: 10,
      categoryId: 'salary',
      isEssential: false,
      isActive: true,
      createdAt: '',
    };

    const rent: RecurringItem = {
      id: 'rent',
      title: 'Аренда',
      amount: 4000000,
      type: 'expense',
      frequency: 'monthly',
      dayOfMonth: 1,
      categoryId: 'housing',
      isEssential: true,
      isActive: true,
      createdAt: '',
    };

    const { points, minBalance, minBalanceDay } = buildDailyCashFlow([salary, rent], 2026, 8);

    expect(points.length).toBe(30);
    // Before salary arrives on day 10, day 1 to 9 has rent deducted (-4 000 000)
    expect(points[0].cumulativeBalance).toBe(-4000000);
    // After salary arrives on day 10, balance jumps to +6 000 000
    expect(points[9].cumulativeBalance).toBe(6000000);
    expect(minBalance).toBe(-4000000);
    expect(minBalanceDay).toBe(1);
  });
});
