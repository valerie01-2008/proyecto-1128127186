'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import {
  IconShield,
  IconRefresh,
  IconClose,
  IconArrowRight,
} from '@/components/icons';

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
}

interface SessionUser {
  name: string;
  role: string;
}

const ACTIONS: [string, string][] = [
  ['', 'Todas'],
  ['login', 'login'],
  ['create_event', 'create_event'],
  ['update_event', 'update_event'],
  ['delete_event', 'delete_event'],
  ['complete_event', 'complete_event'],
  ['create_user', 'create_user'],
  ['toggle_user', 'toggle_user'],
  ['update_system_config', 'update_system_config'],
];

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user && setUser(d.user))
      .catch(() => {});
  }, []);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/audit?${params}`);
      if (res.ok) setEntries(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return (
    <AppLayout userRole={user?.role || 'admin'} userName={user?.name}>
      <div className="px-6 lg:px-12 py-10 max-w-[1280px] mx-auto">
        <header className="ap-fade-up mb-10">
          <p className="eyebrow mb-3">Admin · sección 04 · bitácora</p>
          <h1 className="font-display tracking-editorial text-[clamp(2.25rem,4vw,3.5rem)] leading-none">
            Auditoría
            <span className="text-lime">.</span>
          </h1>
          <p className="text-bone-2 mt-3 text-[15px]">
            Persistida en Supabase ·{' '}
            <span className="text-bone-0 font-mono">{entries.length}</span> entradas mostradas
          </p>
        </header>

        <div className="bg-ink-1 border border-ink-3 rounded-lg overflow-hidden mb-8">
          <div className="flex flex-wrap items-center gap-3 p-3 border-b border-ink-3">
            <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-3 pl-2">
              filtro · acción
            </p>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 px-3 bg-ink-2 border border-ink-3 rounded text-sm text-bone-0 outline-none focus:border-lime/60 cursor-pointer"
            >
              {ACTIONS.map(([v, l]) => (
                <option key={v} value={v} className="bg-ink-1">
                  {l}
                </option>
              ))}
            </select>
            {actionFilter && (
              <button
                onClick={() => setActionFilter('')}
                className="text-bone-3 hover:text-bone-0 p-1.5 rounded hover:bg-ink-3"
                aria-label="Limpiar filtro"
              >
                <IconClose size={16} />
              </button>
            )}
            <div className="ml-auto">
              <button
                onClick={fetchAudit}
                className="inline-flex items-center gap-2 h-9 px-3 rounded border border-ink-3 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors text-sm"
              >
                <IconRefresh size={14} /> Recargar
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-bone-2 font-mono text-sm py-12 text-center">
            <span className="ap-pulse-dot">cargando bitácora…</span>
          </p>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<IconShield size={40} />}
            title="Sin entradas registradas"
            description={
              actionFilter
                ? `No hay registros para "${actionFilter}". Limpia el filtro o realiza la acción para verla aquí.`
                : 'La bitácora se llenará a medida que los usuarios operen en el sistema.'
            }
          />
        ) : (
          <ul className="space-y-2">
            {entries.map((e, i) => (
              <AuditRow key={e.id} entry={e} index={i} />
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}

function AuditRow({ entry, index }: { entry: AuditEntry; index: number }) {
  const [open, setOpen] = useState(false);
  const ts = new Date(entry.timestamp);
  const dateLabel = ts.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeLabel = ts.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const variant: 'default' | 'success' | 'warning' | 'error' =
    entry.action.startsWith('delete')
      ? 'error'
      : entry.action.startsWith('create')
      ? 'success'
      : entry.action.startsWith('update') || entry.action.startsWith('toggle')
      ? 'warning'
      : 'default';

  return (
    <li
      className="ap-fade-up"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <article className="bg-ink-1 border border-ink-3 rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen((s) => !s)}
          className="w-full flex items-center gap-5 p-4 text-left hover:bg-ink-2 transition-colors"
        >
          <div className="shrink-0 w-24 text-right border-r border-ink-3 pr-4">
            <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-3">
              {dateLabel}
            </p>
            <p className="font-mono text-xs text-bone-1 mt-0.5">{timeLabel}</p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={variant} dot>
                {entry.action}
              </Badge>
              {entry.entity && (
                <span className="font-mono text-[10px] uppercase tracking-ticker text-bone-3">
                  · {entry.entity}
                </span>
              )}
            </div>
            <p className="text-bone-0 text-sm truncate">{entry.summary}</p>
            {entry.userEmail && (
              <p className="font-mono text-[11px] text-bone-3 mt-1">
                {entry.userRole} · {entry.userEmail}
              </p>
            )}
          </div>

          <span className={`text-bone-3 transition-transform ${open ? 'rotate-90' : ''}`}>
            <IconArrowRight size={16} />
          </span>
        </button>

        {open && entry.metadata && (
          <pre className="border-t border-ink-3 p-4 bg-ink-2 font-mono text-[11px] text-bone-1 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
        )}
      </article>
    </li>
  );
}
