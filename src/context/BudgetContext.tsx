import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  RecurringItem,
  Transaction,
  AppSettings,
  MonthBudgetSummary,
  DailyCashFlowPoint,
  ScenarioSimulation,
  CurrencyCode,
} from '../types/budget';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { DEMO_RECURRING_ITEMS, DEMO_TRANSACTIONS } from '../data/demoData';
import { calculateMonthSummary, buildDailyCashFlow } from '../utils/calculator';

const STORAGE_KEY_CATEGORIES = 'budget_app_categories_v1';
const STORAGE_KEY_PLANS = 'budget_app_plans_v1';
const STORAGE_KEY_TRANSACTIONS = 'budget_app_transactions_v1';
const STORAGE_KEY_SETTINGS = 'budget_app_settings_v1';

export type NavTab = 'home' | 'plan' | 'transactions' | 'settings';

interface BudgetContextType {
  // Navigation & Viewport
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  deviceMode: 'phone' | 'full';
  setDeviceMode: (mode: 'phone' | 'full') => void;

  // Selected Date
  selectedYear: number;
  selectedMonth: number;
  setSelectedDate: (year: number, month: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  resetToCurrentMonth: () => void;

  // Data
  categories: Category[];
  recurringItems: RecurringItem[];
  transactions: Transaction[];
  settings: AppSettings;
  recentCategoryIds: string[];

  // Scenario (What-If modeling)
  scenario: ScenarioSimulation;
  setScenario: React.Dispatch<React.SetStateAction<ScenarioSimulation>>;
  resetScenario: () => void;
  applyScenarioToPlan: () => void;

  // Computed Summaries
  summary: MonthBudgetSummary;
  summaryWithoutScenario: MonthBudgetSummary;
  cashFlow: { points: DailyCashFlowPoint[]; minBalance: number; minBalanceDay: number };

  // CRUD for Plans
  addRecurringItem: (item: Omit<RecurringItem, 'id' | 'createdAt'>) => string;
  updateRecurringItem: (id: string, updates: Partial<RecurringItem>) => void;
  deleteRecurringItem: (id: string) => void;
  toggleRecurringItemActive: (id: string) => void;

  // CRUD for Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  repeatLastExpense: () => boolean;

  // Categories & Settings
  addCategory: (cat: Omit<Category, 'id'>) => string;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Storage & Demo
  loadDemoData: () => void;
  resetAllData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;

  // Quick modals state
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddType: 'expense' | 'income';
  setQuickAddType: (type: 'expense' | 'income') => void;
  isAndroidModalOpen: boolean;
  setIsAndroidModalOpen: (open: boolean) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & viewport
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [deviceMode, setDeviceMode] = useState<'phone' | 'full'>('phone');

  // Selected date defaults to September 2026 (matching prompt context & user specifications)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 = September

  // Quick Add Bottom Sheet
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'expense' | 'income'>('expense');
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      currency: 'UZS',
      firstDayOfWeek: 1,
      theme: 'system',
      hasCompletedOnboarding: true,
    };
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Recurring Items (Plan)
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEMO_RECURRING_ITEMS;
  });

  // Transactions (Actual)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEMO_TRANSACTIONS;
  });

  // What-If Scenario State
  const [scenario, setScenario] = useState<ScenarioSimulation>({
    isActive: false,
    title: 'Покупка нового смартфона',
    amount: 3000000,
    frequency: 'once',
    isEssential: false,
    dayOfMonth: 15,
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(recurringItems));
  }, [recurringItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Dark mode effect
  useEffect(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Calendar navigation
  const nextMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const prevMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const resetToCurrentMonth = useCallback(() => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  }, []);

  const setSelectedDate = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);

  // Recent categories calculation (for fast 2-click expense adding)
  const recentCategoryIds = useMemo(() => {
    const counts: Record<string, number> = {};
    // Give weight to recent transactions
    transactions.slice(0, 30).forEach((t) => {
      counts[t.categoryId] = (counts[t.categoryId] || 0) + 1;
    });
    // Default top categories if empty
    const defaults = ['groceries', 'transport', 'cafes', 'housing', 'utilities'];
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const merged = Array.from(new Set([...sorted, ...defaults]));
    return merged;
  }, [transactions]);

  // Computed Summaries
  const summary = useMemo(() => {
    return calculateMonthSummary(recurringItems, transactions, selectedYear, selectedMonth, scenario);
  }, [recurringItems, transactions, selectedYear, selectedMonth, scenario]);

  const summaryWithoutScenario = useMemo(() => {
    return calculateMonthSummary(recurringItems, transactions, selectedYear, selectedMonth, undefined);
  }, [recurringItems, transactions, selectedYear, selectedMonth]);

  const cashFlow = useMemo(() => {
    return buildDailyCashFlow(recurringItems, selectedYear, selectedMonth, scenario);
  }, [recurringItems, selectedYear, selectedMonth, scenario]);

  // Plan CRUD
  const addRecurringItem = useCallback((itemData: Omit<RecurringItem, 'id' | 'createdAt'>): string => {
    const id = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newItem: RecurringItem = {
      ...itemData,
      id,
      createdAt: new Date().toISOString(),
    };
    setRecurringItems((prev) => [newItem, ...prev]);
    return id;
  }, []);

  const updateRecurringItem = useCallback((id: string, updates: Partial<RecurringItem>) => {
    setRecurringItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteRecurringItem = useCallback((id: string) => {
    setRecurringItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleRecurringItemActive = useCallback((id: string) => {
    setRecurringItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
  }, []);

  // Transactions CRUD
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>): string => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTx: Transaction = {
      ...txData,
      id,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return id;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const repeatLastExpense = useCallback((): boolean => {
    const lastExpense = transactions.find((t) => t.type === 'expense');
    if (!lastExpense) return false;

    const todayStr = new Date().toISOString().split('T')[0];
    addTransaction({
      title: lastExpense.title,
      amount: lastExpense.amount,
      type: 'expense',
      categoryId: lastExpense.categoryId,
      date: todayStr,
      note: 'Повтор операции',
    });
    return true;
  }, [transactions, addTransaction]);

  // Categories & Settings
  const addCategory = useCallback((catData: Omit<Category, 'id'>): string => {
    const id = `cat_${Date.now()}`;
    const newCat: Category = {
      ...catData,
      id,
    };
    setCategories((prev) => [...prev, newCat]);
    return id;
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Scenario Actions
  const resetScenario = useCallback(() => {
    setScenario((prev) => ({ ...prev, isActive: false }));
  }, []);

  const applyScenarioToPlan = useCallback(() => {
    if (!scenario.isActive || scenario.amount <= 0) return;
    addRecurringItem({
      title: scenario.title || 'Новый расход',
      amount: scenario.amount,
      type: 'expense',
      frequency: scenario.frequency,
      dayOfMonth: scenario.dayOfMonth || 15,
      categoryId: 'other_expense',
      isEssential: scenario.isEssential,
      isActive: true,
      comment: 'Добавлено из сценарного моделирования',
    });
    resetScenario();
  }, [scenario, addRecurringItem, resetScenario]);

  // Data Reset & Demo
  const loadDemoData = useCallback(() => {
    setRecurringItems(DEMO_RECURRING_ITEMS);
    setTransactions(DEMO_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setSelectedYear(2026);
    setSelectedMonth(8); // September 2026
  }, []);

  const resetAllData = useCallback(() => {
    setRecurringItems([]);
    setTransactions([]);
  }, []);

  const exportDataJson = useCallback(() => {
    const payload = {
      version: 1,
      exportDate: new Date().toISOString(),
      settings,
      categories,
      recurringItems,
      transactions,
    };
    return JSON.stringify(payload, null, 2);
  }, [settings, categories, recurringItems, transactions]);

  const importDataJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.recurringItems && Array.isArray(parsed.recurringItems)) {
        setRecurringItems(parsed.recurringItems);
      }
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
      }
      if (parsed.settings) {
        setSettings(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    deviceMode,
    setDeviceMode,
    selectedYear,
    selectedMonth,
    setSelectedDate,
    nextMonth,
    prevMonth,
    resetToCurrentMonth,
    categories,
    recurringItems,
    transactions,
    settings,
    recentCategoryIds,
    scenario,
    setScenario,
    resetScenario,
    applyScenarioToPlan,
    summary,
    summaryWithoutScenario,
    cashFlow,
    addRecurringItem,
    updateRecurringItem,
    deleteRecurringItem,
    toggleRecurringItemActive,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    repeatLastExpense,
    addCategory,
    updateSettings,
    loadDemoData,
    resetAllData,
    exportDataJson,
    importDataJson,
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddType,
    setQuickAddType,
    isAndroidModalOpen,
    setIsAndroidModalOpen,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
