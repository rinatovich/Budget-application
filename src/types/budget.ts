export type CurrencyCode = 'UZS' | 'USD' | 'EUR' | 'RUB';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  format: (amount: number) => string;
}

export type Frequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
}

export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  dayOfMonth?: number; // 1..31 or -1 for last day of month
  date?: string; // YYYY-MM-DD for 'once' or specific target
  categoryId: string;
  isEssential: boolean; // For expenses: true = обязательный, false = необязательный
  isActive: boolean; // Can be temporarily toggled off
  comment?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note?: string;
  recurringRefId?: string;
  createdAt: string;
}

export interface AppSettings {
  currency: CurrencyCode;
  firstDayOfWeek: number; // 1 = Monday
  theme: 'light' | 'dark' | 'system';
  hasCompletedOnboarding: boolean;
}

export interface MonthBudgetSummary {
  year: number;
  month: number; // 0-indexed (0 = Jan, 8 = Sept)
  monthName: string;
  daysInMonth: number;
  
  // Planned figures
  plannedIncome: number;
  plannedExpenses: number;
  plannedEssentialExpenses: number;
  plannedNonEssentialExpenses: number;
  plannedRemaining: number;
  
  // Actual figures
  actualIncome: number;
  actualExpenses: number;
  actualRemaining: number;
  
  // Weekly allowance
  freeBudgetPerWeek: number;
  
  // Ratios
  essentialExpensePercentage: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
}

export interface DailyCashFlowPoint {
  day: number;
  dateStr: string;
  dayOfWeek: string;
  dayIncome: number;
  dayExpense: number;
  netDay: number;
  cumulativeBalance: number;
  events: Array<{
    title: string;
    amount: number;
    type: TransactionType;
    isEssential?: boolean;
  }>;
}

export interface ScenarioSimulation {
  isActive: boolean;
  title: string;
  amount: number;
  frequency: Frequency;
  isEssential: boolean;
  dayOfMonth?: number;
}
