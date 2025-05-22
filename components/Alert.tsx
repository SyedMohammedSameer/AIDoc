
import React from 'react';

interface AlertProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string | React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, className = '' }) => {
  const baseClasses = 'p-4 rounded-lg shadow-md';
  const typeClasses = {
    error: 'bg-red-100 border-l-4 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-l-4 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-l-4 border-green-500 text-green-700',
  };

  const Icon: React.FC<{ type: AlertProps['type']}> = ({ type }) => {
    switch (type) {
      case 'error':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'warning':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
      case 'info':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'success':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default:
        return null;
    }
  };
  
  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`} role="alert">
      <div className="flex items-start">
        <Icon type={type} />
        <div>
          {title && <p className="font-bold text-lg mb-1">{title}</p>}
          <div className="text-sm">{message}</div>
        </div>
      </div>
    </div>
  );
};
    