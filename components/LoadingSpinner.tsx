
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-primary' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${color} border-current`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};
    