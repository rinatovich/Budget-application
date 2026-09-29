import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const ModalBottomSheet: React.FC<ModalBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[90vh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Sheet Surface */}
      <div
        className={`relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col ${maxHeight} overflow-hidden border-t border-slate-200/60 dark:border-slate-800/60 animate-in slide-in-from-bottom duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-4 flex-1 overscroll-contain no-scrollbar pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
};
