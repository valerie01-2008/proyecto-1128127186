'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { Badge } from '@/components/Badge';
import { EventWithDetails } from '@/lib/types';
import {
  IconChevronLeft,
  IconEdit,
  IconTrash,
  IconCheck,
  IconClock,
  IconLocation,
  IconPaperclip,
  IconBell,
  IconTag,
  IconFlag,
} from '@/components/icons';

const CATEGORY_LABEL: Record<string, string> = {
  personal: 'Personal',
  trabajo: 'Trabajo',
  salud: 'Salud',
  educacion: 'Educación',
  otro: 'Otro',
};
const CATEGORY_DOT: Record<string, string> = {
  personal: 'bg-cat-personal',
  trabajo: 'bg-cat-trabajo',
  salud: 'bg-cat-salud',
  educacion: 'bg-cat-educacion',
  otro: 'bg-cat-otro',
};
const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  pendiente: 'warning',
  completado: 'success',
  cancelado: 'error',
};
const PRIORITY_VARIANT: Record<string, 'default' | 'warning' | 'error'> = {
  normal: 'default',
  alta: 'warning',
  urgente: 'error',
};

interface SessionUser {
  name: string;
  role: string;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<'complete' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user && setUser(d.user))
      .catch(() => {});
  }, []);

  const fetchEvent = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      } else if (res.status === 404) {
        setError('Evento no encontrado');
      } else {
        setError('No se pudo cargar el evento');
      }
    } catch {
      setError('No se pudo cargar el evento');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  async function complete() {
    if (!confirm('Marcar este evento como completado?')) return;
    setActing('complete');
    try {
      const res = await fetch(`/api/events/${eventId}/complete`, { method: 'POST' });
      if (res.ok) {
        await fetchEvent();
      } else {
        const e = await res.json();
        setError(e.error || 'Error al completar');
      }
    } finally {
      setActing(null);
    }
  }

  async function remove() {
    if (!confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return;
    setActing('delete');
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/events');
      } else {
        const e = await res.json();
        setError(e.error || 'Error al eliminar');
      }
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <AppLayout userRole={user?.role} userName={user?.name}>
        <div className="px-6 lg:px-12 py-10 max-w-4xl mx-auto">
          <p className="text-bone-2 font-mono text-sm">
            <span className="ap-pulse-dot">cargando evento…</span>
          </p>
        </div>
      </AppLayout>
    );
  }

  if (error || !event) {
    return (
      <AppLayout userRole={user?.role} userName={user?.name}>
        <div className="px-6 lg:px-12 py-10 max-w-2xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-ticker text-crimson mb-2">
            error
          </p>
          <h1 className="font-display text-3xl tracking-editorial mb-4">
            {error || 'Evento no disponible'}
          </h1>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-bone-2 hover:text-bone-0 transition-colors"
          >
            <IconChevronLeft size={16} /> Volver a la lista
          </Link>
        </div>
      </AppLayout>
    );
  }

  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <AppLayout userRole={user?.role} userName={user?.name}>
      <div className="px-6 lg:px-12 py-10 max-w-5xl mx-auto">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-bone-3 hover:text-bone-0 transition-colors text-sm mb-8 font-mono uppercase tracking-ticker text-[11px]"
        >
          <IconChevronLeft size={14} /> Eventos
        </Link>

        {/* Hero */}
        <header className="ap-fade-up mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`h-2 w-2 rounded-full ${CATEGORY_DOT[event.category] || CATEGORY_DOT.otro}`}
            />
            <span className="font-mono text-[11px] uppercase tracking-ticker text-bone-2">
              {CATEGORY_LABEL[event.category] || 'Otro'}
            </span>
            <span className="text-bone-3">·</span>
            <Badge variant={STATUS_VARIANT[event.status] || 'default'} dot>
              {event.status}
            </Badge>
            {event.priority && event.priority !== 'normal' && (
              <Badge variant={PRIORITY_VARIANT[event.priority]} dot>
                {event.priority}
              </Badge>
            )}
          </div>

          <h1 className="font-display tracking-editorial text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] mb-6">
            {event.title}
          </h1>

          <p className="font-mono text-bone-2 text-sm">
            <span className="text-bone-0">{fmtDate(start)}</span>
            <br />
            <span>
              {fmtTime(start)}
              {end ? `–${fmtTime(end)}` : ''}
            </span>
          </p>
        </header>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-12">
          <Link
            href={`/events/${event.id}/edit`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded border border-ink-3 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors text-sm"
          >
            <IconEdit size={16} /> Editar
          </Link>
          {event.status === 'pendiente' && (
            <button
              onClick={complete}
              disabled={!!acting}
              className="inline-flex items-center gap-2 h-10 px-4 rounded bg-lime text-ink-0 hover:bg-bone-0 transition-colors text-sm font-medium disabled:opacity-40"
            >
              <IconCheck size={16} />
              {acting === 'complete' ? 'Completando…' : 'Marcar completado'}
            </button>
          )}
          <button
            onClick={remove}
            disabled={!!acting}
            className="inline-flex items-center gap-2 h-10 px-4 rounded border border-crimson/40 text-crimson hover:bg-crimson hover:text-ink-0 transition-colors text-sm disabled:opacity-40"
          >
            <IconTrash size={16} />
            {acting === 'delete' ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>

        {/* Detail grid */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-10">
          <section className="space-y-10">
            <DetailBlock label="Ubicación" icon={<IconLocation size={14} />}>
              {event.location ? (
                <p className="text-bone-0 text-lg">{event.location}</p>
              ) : (
                <p className="text-bone-3 italic">Sin ubicación asignada</p>
              )}
            </DetailBlock>

            <DetailBlock label="Descripción">
              {event.description ? (
                <p className="text-bone-1 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              ) : (
                <p className="text-bone-3 italic">Sin descripción</p>
              )}
            </DetailBlock>

            <DetailBlock label="Adjuntos" icon={<IconPaperclip size={14} />}>
              {!event.attachments || event.attachments.length === 0 ? (
                <p className="text-bone-3 italic">No hay archivos adjuntos.</p>
              ) : (
                <ul className="space-y-2">
                  {event.attachments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3 p-3 rounded border border-ink-3 bg-ink-1 hover:bg-ink-2 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-bone-3">
                          <IconPaperclip size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-bone-0 truncate">{a.filename}</p>
                          <p className="font-mono text-[11px] text-bone-3">
                            {(a.fileSize / 1024).toFixed(1)} KB · {a.contentType}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            `/api/events/${event.id}/attachments?attachmentId=${a.id}`,
                            '_blank'
                          )
                        }
                        className="font-mono text-[11px] uppercase tracking-ticker text-lime hover:text-bone-0"
                      >
                        descargar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </DetailBlock>

            <DetailBlock label="Recordatorios" icon={<IconBell size={14} />}>
              <p className="text-bone-3 italic">
                Configuración de recordatorios en la próxima iteración (fase 5).
              </p>
            </DetailBlock>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-6 self-start">
            <div className="bg-ink-1 border border-ink-3 rounded-lg p-5">
              <p className="eyebrow mb-4">Metadatos</p>
              <dl className="space-y-3 text-sm">
                <Meta label="Categoría" icon={<IconTag size={12} />}>
                  {CATEGORY_LABEL[event.category]}
                </Meta>
                <Meta label="Prioridad" icon={<IconFlag size={12} />}>
                  {event.priority}
                </Meta>
                <Meta label="Estado">
                  {event.status}
                </Meta>
                <Meta label="Inicio" icon={<IconClock size={12} />}>
                  <span className="font-mono">
                    {start.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </Meta>
                {end && (
                  <Meta label="Fin" icon={<IconClock size={12} />}>
                    <span className="font-mono">
                      {end.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </Meta>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

function DetailBlock({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="flex items-center gap-1.5 mb-3 text-bone-3">
        {icon}
        <p className="font-mono text-[11px] uppercase tracking-ticker">{label}</p>
      </header>
      <div>{children}</div>
    </section>
  );
}

function Meta({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-bone-3 font-mono text-[11px] uppercase tracking-ticker">
        {icon}
        {label}
      </dt>
      <dd className="text-bone-0 text-sm capitalize">{children}</dd>
    </div>
  );
}
