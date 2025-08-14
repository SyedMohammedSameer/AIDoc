import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string | React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, className = '', onClose }) => {
  const configs = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      titleColor: 'text-red-800 dark:text-red-300',
      textColor: 'text-red-700 dark:text-red-400'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      titleColor: 'text-amber-800 dark:text-amber-300',
      textColor: 'text-amber-700 dark:text-amber-400'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      titleColor: 'text-blue-800 dark:text-blue-300',
      textColor: 'text-blue-700 dark:text-blue-400'
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      titleColor: 'text-emerald-800 dark:text-emerald-300',
      textColor: 'text-emerald-700 dark:text-emerald-400'
    }
  };

  const config = configs[type];

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          {title && <p className={`font-semibold ${config.titleColor} mb-1`}>{title}</p>}
          <div className={`${config.textColor} text-sm`}>{message}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className={`${config.textColor} hover:opacity-75`}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};