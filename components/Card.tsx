import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
  hoverable?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  as: Tag = 'div',
  hoverable = false,
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={[
        'bg-ink-1 border border-ink-3 rounded-lg p-6 shadow-soft',
        hoverable
          ? 'transition-colors duration-200 hover:bg-ink-2 hover:border-ink-4'
          : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}
