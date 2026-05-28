'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import EventForm from '@/components/events/EventForm';
import { IconChevronLeft } from '@/components/icons';
import type {
  EventWithDetails,
  UpdateEventRequest,
  CreateReminderRequest,
  Reminder,
} from '@/lib/types';

interface SessionUser {
  name: string;
  role: string;
}

// El form puede mandar `reminders` opcional aunque UpdateEventRequest no lo tipe.
type SubmitData = UpdateEventRequest & { reminders?: CreateReminderRequest[] };

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [originalReminders, setOriginalReminders] = useState<Reminder[]>([]);
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
        const data: EventWithDetails = await res.json();
        setEvent(data);
        setOriginalReminders(data.reminders || []);
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

  async function handleSubmit(data: SubmitData) {
    setSaving(true);
    setError(null);
    try {
      // 1. Actualizar el evento (sin reminders — la API PUT no los maneja)
      const { reminders: _ignored, ...eventPatch } = data;
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPatch),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar');
      }

      // 2. Sincronizar recordatorios: borrar todos los anteriores y crear los nuevos.
      //    (Más simple que diff por contenido y suficiente para el v1 — el motor
      //    recalcula fire_at en cada insert.)
      const targetReminders = data.reminders || [];
      const targetCount = targetReminders.length;
      const originalCount = originalReminders.length;

      // Si nada cambió por cantidad ni se tocó la lista, no sincronizar
      // (heurística simple — para diff por contenido alcanza con re-crear todo)
      const shouldSync = targetCount !== originalCount || targetCount > 0;
      if (shouldSync) {
        // Borrar los originales
        await Promise.all(
          originalReminders.map((r) =>
            fetch(`/api/events/${eventId}/reminders/${r.id}`, { method: 'DELETE' })
          )
        );
        // Crear los nuevos secuencialmente para preservar orden
        for (const r of targetReminders) {
          await fetch(`/api/events/${eventId}/reminders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(r),
          });
        }
      }

      router.push(`/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }

  const initialReminders: CreateReminderRequest[] = originalReminders.map((r) => ({
    anticipationMin: r.anticipationMin,
    channel: 'email',
    customMessage: r.customMessage,
  }));

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
            <EventForm
              event={event}
              initialReminders={initialReminders}
              onSubmit={handleSubmit}
              isLoading={saving}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
