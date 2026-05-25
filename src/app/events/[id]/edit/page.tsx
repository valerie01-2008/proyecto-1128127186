'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import EventForm from '@/components/events/EventForm';
import { IconChevronLeft } from '@/components/icons';
import type { Event, UpdateEventRequest } from '@/lib/types';

interface SessionUser {
  name: string;
  role: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user && setUser(d.user))
      .catch(() => {});
  }, []);

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        setEvent(await res.json());
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

  async function handleSubmit(data: UpdateEventRequest) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar');
      }
      router.push(`/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout userRole={user?.role} userName={user?.name}>
      <div className="px-6 lg:px-12 py-10 max-w-3xl mx-auto">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-1.5 text-bone-3 hover:text-bone-0 transition-colors text-sm mb-8 font-mono uppercase tracking-ticker text-[11px]"
        >
          <IconChevronLeft size={14} /> Volver al evento
        </Link>

        <header className="ap-fade-up mb-10">
          <p className="eyebrow mb-3">Editar · sección 04</p>
          <h1 className="font-display tracking-editorial text-[clamp(2.25rem,4vw,3.5rem)] leading-none">
            Ajusta los
            <br />
            <span className="italic text-bone-2">detalles</span>
            <span className="text-lime">.</span>
          </h1>
        </header>

        {loading ? (
          <p className="text-bone-2 font-mono text-sm">
            <span className="ap-pulse-dot">cargando evento…</span>
          </p>
        ) : !event ? (
          <p className="text-crimson font-mono text-sm">{error || 'Evento no disponible'}</p>
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded border border-crimson/30 bg-crimson-soft p-4">
                <p className="font-mono text-[11px] uppercase tracking-ticker text-crimson mb-1">
                  Error
                </p>
                <p className="text-bone-1 text-sm">{error}</p>
              </div>
            )}
            <EventForm event={event} onSubmit={handleSubmit} isLoading={saving} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
