import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-ink-3 rounded-lg bg-ink-1/40">
      {icon && <div className="mb-4 text-bone-3">{icon}</div>}
      <h3 className="font-display text-2xl text-bone-0 mb-2">{title}</h3>
      {description && (
        <p className="text-bone-2 text-sm max-w-md mb-6 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
