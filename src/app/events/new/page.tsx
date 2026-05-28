'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import EventForm from '@/components/events/EventForm';
import { IconChevronLeft } from '@/components/icons';
import type { CreateEventRequest } from '@/lib/types';

interface SessionUser {
  name: string;
  role: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user && setUser(d.user))
      .catch(() => {});
  }, []);

  async function handleSubmit(data: CreateEventRequest) {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 409) {
          setWarning(err.error || 'Hay un conflicto de solapamiento.');
          return;
        }
        throw new Error(err.error || 'No se pudo crear el evento');
      }
      router.push('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout userRole={user?.role} userName={user?.name}>
      <div className="px-6 lg:px-12 py-10 max-w-3xl mx-auto">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-bone-3 hover:text-bone-0 transition-colors text-sm mb-8 font-mono uppercase tracking-ticker text-[11px]"
        >
          <IconChevronLeft size={14} /> Volver a eventos
        </Link>

        <header className="ap-fade-up mb-10">
          <p className="eyebrow mb-3">Nuevo · sección 04</p>
          <h1 className="font-display tracking-editorial text-[clamp(2.5rem,5vw,4rem)] leading-none">
            Planea algo
            <br />
            <span className="italic text-bone-2">memorable</span>
            <span className="text-lime">.</span>
          </h1>
        </header>

        {error && (
          <Banner tone="crimson" title="No se pudo crear" body={error} />
        )}
        {warning && (
          <Banner tone="amber" title="Solapamiento" body={warning} />
        )}

        <EventForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </AppLayout>
  );
}

function Banner({
  tone,
  title,
  body,
}: {
  tone: 'crimson' | 'amber';
  title: string;
  body: string;
}) {
  const colorClass =
    tone === 'crimson'
      ? 'border-crimson/30 bg-crimson-soft text-crimson'
      : 'border-amber/30 bg-amber-soft text-amber';
  return (
    <div className={`mb-6 rounded border ${colorClass} p-4`}>
      <p className="font-mono text-[11px] uppercase tracking-ticker mb-1">
        {title}
      </p>
      <p className="text-bone-1 text-sm">{body}</p>
    </div>
  );
}
