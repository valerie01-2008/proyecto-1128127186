import { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'lime';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = 'default', className = '', dot = false }: BadgeProps) {
  const variants: Record<Variant, string> = {
    default: 'border-ink-3 bg-ink-2 text-bone-1',
    success: 'border-lime/30 bg-lime-soft text-lime',
    warning: 'border-amber/40 bg-amber-soft text-amber',
    error: 'border-crimson/40 bg-crimson-soft text-crimson',
    info: 'border-sky/30 bg-ink-2 text-sky',
    lime: 'border-lime bg-lime text-ink-0',
  };

  const dotColor: Record<Variant, string> = {
    default: 'bg-bone-2',
    success: 'bg-lime',
    warning: 'bg-amber',
    error: 'bg-crimson',
    info: 'bg-sky',
    lime: 'bg-ink-0',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 h-6 text-[11px] font-mono uppercase tracking-ticker border rounded-sm',
        variants[variant],
        className,
      ].join(' ')}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor[variant]}`} />}
      {children}
    </span>
  );
}
