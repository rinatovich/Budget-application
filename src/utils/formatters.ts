import { CurrencyCode } from '../types/budget';

export const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; name: string; position: 'after' | 'before' }> = {
  UZS: { symbol: 'сум', name: 'Узбекский сум', position: 'after' },
  USD: { symbol: '$', name: 'Доллар США', position: 'before' },
  EUR: { symbol: '€', name: 'Евро', position: 'after' },
  RUB: { symbol: '₽', name: 'Российский рубль', position: 'after' },
};

/**
 * Format standard number with non-breaking spaces for readability (e.g. 40 000 000 сум)
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'UZS', showSign: boolean = false): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  
  // Format with space thousands separator
  const formattedNumber = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const config = CURRENCY_MAP[currency] || CURRENCY_MAP.UZS;
  
  let result = '';
  if (config.position === 'before') {
    result = `${config.symbol}${formattedNumber}`;
  } else {
    result = `${formattedNumber} ${config.symbol}`;
  }
  
  if (isNegative) {
    return `− ${result}`;
  } else if (showSign && amount > 0) {
    return `+ ${result}`;
  }
  return result;
}

/**
 * Format compact numbers for charts and tight spaces (e.g. 45M, 1.5M, 500k)
 */
export function formatCompactNumber(amount: number, currency: CurrencyCode = 'UZS'): string {
  const abs = Math.abs(amount);
  const symbol = CURRENCY_MAP[currency]?.symbol || 'сум';
  
  let text = '';
  if (abs >= 1_000_000_000) {
    text = (abs / 1_000_000_000).toFixed(1).replace('.0', '') + 'B';
  } else if (abs >= 1_000_000) {
    text = (abs / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  } else if (abs >= 1_000) {
    text = (abs / 1_000).toFixed(0) + 'k';
  } else {
    text = abs.toString();
  }
  
  const sign = amount < 0 ? '−' : '';
  return `${sign}${text} ${symbol}`;
}

export const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export const MONTH_NAMES_GENITIVE_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

export const DAY_NAMES_RU = [
  { index: 1, short: 'Пн', full: 'Понедельник' },
  { index: 2, short: 'Вт', full: 'Вторник' },
  { index: 3, short: 'Ср', full: 'Среда' },
  { index: 4, short: 'Чт', full: 'Четверг' },
  { index: 5, short: 'Пт', full: 'Пятница' },
  { index: 6, short: 'Сб', full: 'Суббота' },
  { index: 0, short: 'Вс', full: 'Воскресенье' },
];

export function getMonthYearTitle(year: number, month: number): string {
  return `${MONTH_NAMES_RU[month]} ${year}`;
}

export function formatDateRelative(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays === -1) return 'Завтра';

    return `${d} ${MONTH_NAMES_GENITIVE_RU[m - 1]}${y !== today.getFullYear() ? ` ${y}` : ''}`;
  } catch {
    return dateStr;
  }
}
