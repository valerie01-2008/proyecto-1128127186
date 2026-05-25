interface QuotaAlertProps {
  activeEventCount: number;
  maxEvents: number;
}

export function QuotaAlert({ activeEventCount, maxEvents }: QuotaAlertProps) {
  const pct = Math.min(100, Math.round((activeEventCount / maxEvents) * 100));
  if (pct < 90) return null;

  const tone = pct >= 100 ? 'crimson' : 'amber';
  const colorVar = tone === 'crimson' ? 'var(--crimson)' : 'var(--amber)';

  return (
    <div className="relative overflow-hidden rounded-lg border border-amber/30 bg-amber-soft mb-6">
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: colorVar }} />
      <div className="p-4 pl-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p
              className="font-mono text-[11px] uppercase tracking-ticker mb-1"
              style={{ color: colorVar }}
            >
              cuota al {pct}%
            </p>
            <p className="text-sm text-bone-1">
              <span className="font-mono text-bone-0">{activeEventCount}</span> de{' '}
              <span className="font-mono text-bone-0">{maxEvents}</span> eventos activos.
              {pct >= 100 ? ' Has alcanzado el límite.' : ' Considera archivar eventos completados.'}
            </p>
          </div>
        </div>
        <div className="h-1 w-full bg-ink-3 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${pct}%`, background: colorVar }}
          />
        </div>
      </div>
    </div>
  );
}
