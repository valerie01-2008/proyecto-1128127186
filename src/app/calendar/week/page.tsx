'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WeekView from '@/components/calendar/WeekView';
import { AppLayout } from '@/components/AppLayout';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  category: string;
  priority: string;
  status: string;
}

interface SessionUser {
  name: string;
  email: string;
  role: string;
}

type ViewMode = 'month' | 'week' | 'day';

const VIEW_OPTIONS: { value: ViewMode; label: string; href: (d: string) => string }[] = [
  { value: 'month', label: 'mes', href: (d) => `/calendar?date=${d}` },
  { value: 'week', label: 'semana', href: (d) => `/calendar/week?date=${d}` },
  { value: 'day', label: 'día', href: (d) => `/calendar/day?date=${d}` },
];

export default function WeekCalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userTimezone, setUserTimezone] = useState('America/Bogota');

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get('date');
      if (dateParam) {
        const parsed = new Date(dateParam);
        if (!Number.isNaN(parsed.getTime())) setCurrentDate(parsed);
      }
    }
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => me && setUser(me.user || me))
      .catch(() => null);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const from = new Date(startOfWeek);
        from.setDate(from.getDate() - 1);
        const to = new Date(endOfWeek);
        to.setDate(to.getDate() + 1);

        const response = await fetch(
          `/api/calendar?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`,
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentDate]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    const dateStr = newDate.toISOString().split('T')[0];
    router.replace(`/calendar/week?date=${dateStr}`);
  };

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
    }).format(d);

  const yearLabel = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
  }).format(currentDate);

  const todayString = currentDate.toISOString().split('T')[0];
  const isOnTodayWeek = (() => {
    const today = new Date();
    return today >= startOfWeek && today <= endOfWeek;
  })();

  if (loading) {
    return (
      <AppLayout userRole={user?.role} userName={user?.name}>
        <div className="min-h-[60vh] flex items-center justify-center text-bone-2 font-mono text-sm">
          <span className="ap-pulse-dot">cargando semana…</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={user?.role} userName={user?.name}>
      <div className="px-6 lg:px-12 py-8 lg:py-12 max-w-[1400px] mx-auto">
        <header className="ap-fade-up mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Calendario · vista semanal</p>
              <h1 className="font-display tracking-editorial text-[clamp(2rem,4vw,3.25rem)] leading-[0.95]">
                Semana del{' '}
                <span className="capitalize">{fmt(startOfWeek)}</span>{' '}
                <span className="text-bone-3">al</span>{' '}
                <span className="italic text-bone-2 capitalize">
                  {fmt(endOfWeek)}
                </span>
                <span className="text-lime">.</span>
              </h1>
              <p className="text-bone-2 text-sm mt-3 font-mono uppercase tracking-ticker">
                {yearLabel} ·{' '}
                <span className="text-bone-0">{events.length}</span> evento
                {events.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleDateChange(new Date())}
                disabled={isOnTodayWeek}
                className="h-10 px-4 inline-flex items-center gap-2 rounded border border-ink-3 bg-ink-1 hover:bg-ink-2 hover:border-ink-4 text-sm text-bone-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                Hoy
              </button>

              <nav className="inline-flex rounded border border-ink-3 bg-ink-1 p-1 gap-1 font-mono text-[11px] uppercase tracking-ticker">
                {VIEW_OPTIONS.map((opt) => {
                  const active = opt.value === 'week';
                  return (
                    <Link
                      key={opt.value}
                      href={opt.href(todayString)}
                      className={`px-3 py-1.5 rounded-sm transition-colors ${
                        active
                          ? 'bg-bone-0 text-ink-0'
                          : 'text-bone-2 hover:text-bone-0'
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>

        <WeekView
          currentDate={currentDate}
          events={events}
          onDateChange={handleDateChange}
          userTimezone={userTimezone}
        />
      </div>
    </AppLayout>
  );
}
