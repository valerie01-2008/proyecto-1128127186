'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { SeedModeBanner } from '@/components/SeedModeBanner';
import { QuotaAlert } from '@/components/QuotaAlert';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { useGlobalErrorHandler } from '@/lib/useGlobalErrorHandler';
import {
  IconArrowRight,
  IconCalendar,
  IconBell,
  IconReports,
  IconPlus,
  IconLocation,
  IconSparkle,
} from '@/components/icons';

interface EventItem {
  id: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  location?: string | null;
  category?: string;
  priority?: 'normal' | 'alta' | 'urgente';
  status?: string;
}

interface DashboardData {
  mode: 'seed' | 'live';
  upcomingEvents: EventItem[];
  todayReminders: unknown[];
  quotaAlert: boolean;
  activeEventCount?: number;
  maxEvents?: number;
}

interface SessionUser {
  name: string;
  email: string;
  role: string;
}

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

const PRIORITY_VARIANT: Record<string, 'default' | 'warning' | 'error'> = {
  normal: 'default',
  alta: 'warning',
  urgente: 'error',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleResponse } = useGlobalErrorHandler();

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, meRes] = await Promise.all([
          handleResponse(await fetch('/api/dashboard')),
          fetch('/api/auth/me').catch(() => null),
        ]);
        const dashboard: DashboardData = await dashRes.json();
        setData(dashboard);
        if (meRes && meRes.ok) {
          const me = await meRes.json();
          setUser(me.user || me);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    })();
  }, [handleResponse]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-bone-2 font-mono text-sm">
          <span className="ap-pulse-dot">cargando…</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="p-10 max-w-xl">
          <div className="bg-crimson-soft border border-crimson/30 rounded p-5 text-bone-1">
            <p className="font-mono text-xs uppercase tracking-ticker text-crimson mb-2">
              error
            </p>
            <p>{error || 'No se pudo cargar el dashboard'}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const now = new Date();
  const greetingHour = now.getHours();
  const greeting =
    greetingHour < 6
      ? 'Buenas madrugadas'
      : greetingHour < 12
      ? 'Buenos días'
      : greetingHour < 19
      ? 'Buenas tardes'
      : 'Buenas noches';

  return (
    <AppLayout userRole={user?.role} userName={user?.name}>
      <div className="px-6 lg:px-12 py-8 lg:py-12 max-w-[1280px] mx-auto">
        {data.mode === 'seed' && <SeedModeBanner />}
        {data.quotaAlert && data.activeEventCount != null && data.maxEvents && (
          <QuotaAlert
            activeEventCount={data.activeEventCount}
            maxEvents={data.maxEvents}
          />
        )}

        {/* Hero editorial */}
        <header className="ap-fade-up mb-10 lg:mb-14">
          <p className="eyebrow mb-3">
            Dashboard ·{' '}
            {now.toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <h1 className="font-display tracking-editorial text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] mb-4">
            {greeting},
            <br />
            <span className="italic text-bone-2">
              {user?.name?.split(' ')[0] || 'Usuario'}
            </span>
            <span className="text-lime">.</span>
          </h1>
          <p className="text-bone-1 text-lg max-w-2xl leading-relaxed">
            Tienes{' '}
            <span className="text-bone-0 font-mono">
              {data.upcomingEvents.length}
            </span>{' '}
            evento{data.upcomingEvents.length === 1 ? '' : 's'} en los próximos
            7 días y{' '}
            <span className="text-bone-0 font-mono">
              {data.activeEventCount ?? 0}
            </span>{' '}
            activo{data.activeEventCount === 1 ? '' : 's'} en total.
          </p>
        </header>

        {/* Stat strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-3 border border-ink-3 rounded-lg overflow-hidden mb-12">
          <StatTile
            label="Próximos 7 días"
            value={data.upcomingEvents.length}
            Icon={IconCalendar}
          />
          <StatTile
            label="Activos"
            value={data.activeEventCount ?? 0}
            suffix={`/${data.maxEvents ?? 500}`}
            Icon={IconSparkle}
          />
          <StatTile
            label="Recordatorios hoy"
            value={data.todayReminders.length}
            Icon={IconBell}
          />
          <StatTile
            label="Cuota usada"
            value={`${Math.round(((data.activeEventCount ?? 0) / (data.maxEvents ?? 500)) * 100)}%`}
            Icon={IconReports}
          />
        </section>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
          {/* Próximos eventos */}
          <section className="bg-ink-1 border border-ink-3 rounded-lg overflow-hidden">
            <header className="flex items-center justify-between p-6 border-b border-ink-3">
              <div>
                <p className="eyebrow mb-1">Agenda</p>
                <h2 className="font-display text-2xl tracking-editorial">
                  Próximos eventos
                </h2>
              </div>
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 h-9 px-3 rounded bg-ink-2 border border-ink-3 hover:border-bone-2 text-sm transition-colors"
              >
                <IconPlus size={16} /> Nuevo
              </Link>
            </header>

            {data.upcomingEvents.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<IconCalendar size={40} />}
                  title="Tu agenda está despejada"
                  description="No tienes eventos en los próximos 7 días. Es buen momento para planear algo."
                  action={
                    <Link
                      href="/events/new"
                      className="inline-flex items-center gap-2 h-10 px-4 rounded bg-lime text-ink-0 text-sm font-medium hover:bg-bone-0 transition-colors"
                    >
                      <IconPlus size={16} /> Crear primer evento
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-ink-3">
                {data.upcomingEvents.map((e, i) => (
                  <EventRow key={e.id} event={e} index={i} />
                ))}
              </ul>
            )}
          </section>

          {/* Sidebar derecho */}
          <aside className="space-y-8">
            <section className="bg-ink-1 border border-ink-3 rounded-lg p-6">
              <p className="eyebrow mb-2">Atajos</p>
              <h3 className="font-display text-xl tracking-editorial mb-5">
                Movimientos rápidos
              </h3>
              <div className="space-y-2">
                <QuickAction
                  href="/calendar"
                  Icon={IconCalendar}
                  label="Ver calendario mensual"
                />
                <QuickAction
                  href="/events/new"
                  Icon={IconPlus}
                  label="Nuevo evento"
                />
                <QuickAction
                  href="/notifications"
                  Icon={IconBell}
                  label="Historial de notificaciones"
                />
                <QuickAction
                  href="/reports"
                  Icon={IconReports}
                  label="Reporte personal"
                />
              </div>
            </section>

            <section className="bg-ink-1 border border-ink-3 rounded-lg p-6">
              <p className="eyebrow mb-2">Motor</p>
              <h3 className="font-display text-xl tracking-editorial mb-3">
                Recordatorios automáticos
              </h3>
              <p className="text-bone-2 text-sm leading-relaxed mb-4">
                El sistema evalúa los recordatorios cada 5 minutos y envía
                correos dentro de tu ventana 06:00–22:00.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-bone-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime ap-pulse-dot" />
                  Operativo
                </span>
                <span className="font-mono text-xs text-bone-3">cron · */5</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

function StatTile({
  label,
  value,
  suffix,
  Icon,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  Icon: (p: { size?: number; className?: string }) => React.ReactElement;
}) {
  return (
    <div className="bg-ink-1 p-5 lg:p-6">
      <div className="flex items-start justify-between mb-3">
        <p className="eyebrow">{label}</p>
        <span className="text-bone-3">
          <Icon size={18} />
        </span>
      </div>
      <p className="font-display text-3xl lg:text-4xl tracking-editorial text-bone-0">
        {value}
        {suffix && <span className="font-mono text-base text-bone-3">{suffix}</span>}
      </p>
    </div>
  );
}

function EventRow({ event, index }: { event: EventItem; index: number }) {
  const start = new Date(event.startAt);
  const isToday = start.toDateString() === new Date().toDateString();
  const dateLabel = isToday
    ? 'Hoy'
    : start.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' });
  const timeLabel = start.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <li
      className="ap-fade-up"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <Link
        href={`/events/${event.id}`}
        className="group flex items-center gap-5 p-5 hover:bg-ink-2 transition-colors"
      >
        <div className="text-right shrink-0 w-20">
          <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-2">
            {dateLabel}
          </p>
          <p className="font-display text-2xl text-bone-0 tracking-editorial leading-none mt-1">
            {timeLabel}
          </p>
        </div>

        <div className="h-12 w-px bg-ink-3 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {event.category && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[event.category] || CATEGORY_DOT.otro}`}
              />
            )}
            <p className="text-[11px] font-mono uppercase tracking-ticker text-bone-2">
              {CATEGORY_LABEL[event.category || 'otro'] || 'Otro'}
            </p>
          </div>
          <h3 className="font-display text-xl text-bone-0 tracking-editorial truncate">
            {event.title}
          </h3>
          {event.location && (
            <p className="flex items-center gap-1.5 text-sm text-bone-2 mt-1.5">
              <IconLocation size={14} /> {event.location}
            </p>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
          {event.priority && event.priority !== 'normal' && (
            <Badge variant={PRIORITY_VARIANT[event.priority]} dot>
              {event.priority}
            </Badge>
          )}
          <span className="text-bone-3 group-hover:text-lime transition-colors">
            <IconArrowRight size={18} />
          </span>
        </div>
      </Link>
    </li>
  );
}

function QuickAction({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: (p: { size?: number; className?: string }) => React.ReactElement;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 p-3 rounded border border-ink-3 bg-ink-1 hover:bg-ink-2 hover:border-ink-4 transition-colors"
    >
      <span className="flex items-center gap-3 text-sm text-bone-1 group-hover:text-bone-0">
        <span className="text-bone-2 group-hover:text-lime transition-colors">
          <Icon size={18} />
        </span>
        {label}
      </span>
      <IconArrowRight
        size={16}
        className="text-bone-3 group-hover:text-bone-0 transition-colors"
      />
    </Link>
  );
}
