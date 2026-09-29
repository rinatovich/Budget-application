import React, { useRef } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { CurrencyCode } from '../../types/budget';
import { CURRENCY_MAP } from '../../utils/formatters';
import {
  Moon,
  Sun,
  Laptop,
  Coins,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Code2,
  Check,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    loadDemoData,
    resetAllData,
    exportDataJson,
    importDataJson,
    setIsAndroidModalOpen,
  } = useBudget();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCurrencyChange = (curr: CurrencyCode) => {
    updateSettings({ currency: curr });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-plan-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          alert('Данные успешно импортированы!');
        } else {
          alert('Ошибка при импорте файла. Проверьте формат JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Настройки
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Валюта, оформление, резервные копии и исходный код
        </p>
      </div>

      {/* Currency Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Coins size={18} className="text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Основная валюта
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(['UZS', 'USD', 'EUR', 'RUB'] as CurrencyCode[]).map((code) => {
            const isSelected = settings.currency === code;
            const item = CURRENCY_MAP[code];
            return (
              <button
                key={code}
                onClick={() => handleCurrencyChange(code)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{code}</div>
                  <div className="text-[11px] opacity-80">{item.name}</div>
                </div>
                <span className="text-base font-bold">{item.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Оформление (Тема)
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'system', label: 'Система', icon: Laptop },
            { id: 'light', label: 'Светлая', icon: Sun },
            { id: 'dark', label: 'Тёмная', icon: Moon },
          ].map((th) => {
            const Icon = th.icon;
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => handleThemeChange(th.id as any)}
                className={`py-2.5 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon size={16} />
                <span className="text-xs">{th.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Android Studio & Kotlin Project Access Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 p-5 text-white shadow-md space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Code2 size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Android Studio Проект (Kotlin / Compose)</h3>
            <p className="text-[11px] text-white/80">
              Архитектура MVVM, Room SQLite, ViewModel, Gradle скрипты и Unit-тесты
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAndroidModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-white text-slate-950 font-semibold text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <Code2 size={15} />
          Открыть Android Studio проект и код
        </button>
      </div>

      {/* Data Management Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Данные и резервное копирование
          </h3>
        </div>

        <div className="space-y-2">
          {/* Load demo */}
          <button
            onClick={() => {
              if (window.confirm('Загрузить демонстрационные данные (Зарплата 40M, аренда 5M, продукты, автокредит)? Текущие данные будут заменены.')) {
                loadDemoData();
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <RefreshCw size={14} />
            Загрузить демонстрационные данные
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Download size={14} />
            Экспорт резервной копии (JSON)
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Upload size={14} />
            Импорт резервной копии (JSON)
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          {/* Clear all */}
          <button
            onClick={() => {
              if (window.confirm('Вы действительно хотите удалить все записи и начать с чистого листа?')) {
                resetAllData();
              }
            }}
            className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          >
            <Trash2 size={13} />
            Очистить все данные
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-center space-y-1 text-slate-400 dark:text-slate-500 text-xs">
        <p className="font-medium text-slate-600 dark:text-slate-400">
          Бюджет План — Личные финансы v1.0
        </p>
        <p>100% автономная работа без регистрации и серверов.</p>
        <p>Точный календарный расчёт дней недели и високосных периодов.</p>
      </div>
    </div>
  );
};
