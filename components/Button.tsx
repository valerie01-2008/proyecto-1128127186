'use client';

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-[background,border-color,color,transform] duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none select-none';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-lime text-ink-0 hover:bg-bone-0 hover:-translate-y-px shadow-soft rounded',
    secondary:
      'bg-ink-2 text-bone-0 border border-ink-3 hover:bg-ink-3 rounded',
    outline:
      'bg-transparent text-bone-0 border border-ink-3 hover:border-bone-2 hover:bg-ink-1 rounded',
    ghost: 'bg-transparent text-bone-1 hover:text-bone-0 hover:bg-ink-2 rounded',
    danger:
      'bg-crimson-soft text-crimson border border-crimson/40 hover:bg-crimson hover:text-ink-0 rounded',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-[15px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
