import { Category } from '../types/budget';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  {
    id: 'groceries',
    name: 'Продукты',
    icon: 'ShoppingCart',
    color: '#10b981', // emerald
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'housing',
    name: 'Жильё',
    icon: 'Home',
    color: '#3b82f6', // blue
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'utilities',
    name: 'Коммунальные услуги',
    icon: 'Zap',
    color: '#eab308', // amber
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'transport',
    name: 'Транспорт',
    icon: 'Car',
    color: '#06b6d4', // cyan
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'loans',
    name: 'Кредиты',
    icon: 'CreditCard',
    color: '#ef4444', // red
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'health',
    name: 'Здоровье',
    icon: 'HeartPulse',
    color: '#ec4899', // pink
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cafes',
    name: 'Рестораны / кафе',
    icon: 'Utensils',
    color: '#f97316', // orange
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'entertainment',
    name: 'Развлечения',
    icon: 'Film',
    color: '#8b5cf6', // purple
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'shopping',
    name: 'Покупки',
    icon: 'ShoppingBag',
    color: '#a855f7', // violet
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'clothing',
    name: 'Одежда',
    icon: 'Shirt',
    color: '#6366f1', // indigo
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'education',
    name: 'Образование',
    icon: 'GraduationCap',
    color: '#0ea5e9', // sky
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'telecom',
    name: 'Связь и интернет',
    icon: 'Wifi',
    color: '#14b8a6', // teal
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'subscriptions',
    name: 'Подписки',
    icon: 'Repeat',
    color: '#f43f5e', // rose
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'family',
    name: 'Семья',
    icon: 'Users',
    color: '#84cc16', // lime
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'other_expense',
    name: 'Другое',
    icon: 'MoreHorizontal',
    color: '#64748b', // slate
    type: 'expense',
    isDefault: true,
  },

  // Income categories
  {
    id: 'salary',
    name: 'Зарплата',
    icon: 'Briefcase',
    color: '#10b981', // emerald
    type: 'income',
    isDefault: true,
  },
  {
    id: 'side_job',
    name: 'Подработка',
    icon: 'TrendingUp',
    color: '#059669', // emerald dark
    type: 'income',
    isDefault: true,
  },
  {
    id: 'bonus',
    name: 'Премия',
    icon: 'Award',
    color: '#eab308', // amber
    type: 'income',
    isDefault: true,
  },
  {
    id: 'rental_income',
    name: 'Аренда',
    icon: 'Key',
    color: '#3b82f6', // blue
    type: 'income',
    isDefault: true,
  },
  {
    id: 'freelance',
    name: 'Фриланс',
    icon: 'Laptop',
    color: '#8b5cf6', // purple
    type: 'income',
    isDefault: true,
  },
  {
    id: 'other_income',
    name: 'Другой доход',
    icon: 'PlusCircle',
    color: '#64748b', // slate
    type: 'income',
    isDefault: true,
  },
];
