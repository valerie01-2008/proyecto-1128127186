import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-sm p-6';

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}