interface SeedModeBannerProps {
  onBootstrap?: () => void;
}

export function SeedModeBanner({ onBootstrap }: SeedModeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-amber/30 bg-amber-soft mb-6">
      <div className="absolute inset-y-0 left-0 w-1 bg-amber" />
      <div className="flex items-center justify-between gap-4 p-4 pl-6">
        <div className="flex items-center gap-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-amber"
            aria-hidden="true"
          >
            <path d="M12 3 L21 19 H3 Z" strokeLinejoin="round" />
            <path d="M12 10 V14" strokeLinecap="round" />
            <circle cx="12" cy="17" r="0.8" fill="currentColor" />
          </svg>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-ticker text-amber mb-1">
              modo seed
            </p>
            <p className="text-sm text-bone-1">
              El sistema corre con datos locales de demostración.
              {onBootstrap && ' Configura la base para activar todas las funcionalidades.'}
            </p>
          </div>
        </div>
        {onBootstrap && (
          <button
            onClick={onBootstrap}
            className="shrink-0 h-9 px-4 text-sm font-medium rounded border border-amber/40 text-amber hover:bg-amber hover:text-ink-0 transition-colors"
          >
            Configurar BD
          </button>
        )}
      </div>
    </div>
  );
}
