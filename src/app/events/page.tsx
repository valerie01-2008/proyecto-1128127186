'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { Event } from '@/lib/types';
import {
  IconSearch,
  IconPlus,
  IconChevronDown,
  IconLocation,
  IconEdit,
  IconArrowRight,
  IconEvents,
  IconClose,
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
const PRIORITY_VARIANT: Record<string, 'default' | 'warning' | 'error'> = {
  normal: 'default',
  alta: 'warning',
  urgente: 'error',
};

type Filters = {
  status: '' | 'pendiente' | 'completado' | 'cancelado';
  category: '' | 'personal' | 'trabajo' | 'salud' | 'educacion' | 'otro';
  priority: '' | 'normal' | 'alta' | 'urgente';
  search: string;
  from: string;
  to: string;
};

const EMPTY_FILTERS: Filters = {
  status: '',
  category: '',
  priority: '',
  search: '',
  from: '',
  to: '',
};

interface SessionUser {
  name: string;
  role: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user && setUser(d.user))
      .catch(() => {});
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      const response = await fetch(`/api/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchEvents, 250);
    return () => clearTimeout(t);
  }, [fetchEvents]);

  const handleFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((p) => ({ ...p, [key]: value }));

  const activeFilters =
    !!filters.status ||
    !!filters.category ||
    !!filters.priority ||
    !!filters.from ||
    !!filters.to;

  return (
    <AppLayout userRole={user?.role} userName={user?.name}>
      <div className="px-6 lg:px-12 py-10 max-w-[1280px] mx-auto">
        <header className="ap-fade-up flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow mb-3">Sección 03 · gestión</p>
            <h1 className="font-display tracking-editorial text-[clamp(2.25rem,4vw,3.5rem)] leading-none">
              Tus eventos
              <span className="text-lime">.</span>
            </h1>
            <p className="text-bone-2 mt-3 text-[15px]">
              <span className="text-bone-0 font-mono">{events.length}</span> resultado
              {events.length === 1 ? '' : 's'}{' '}
              {activeFilters && <span className="text-bone-3">· con filtros aplicados</span>}
            </p>
          </div>

          <Link
            href="/events/new"
            className="hidden sm:inline-flex h-11 px-5 items-center gap-2 rounded bg-lime text-ink-0 font-medium hover:bg-bone-0 transition-colors"
          >
            <IconPlus size={18} /> Nuevo evento
          </Link>
        </header>

        {/* Search + filter strip */}
        <div className="bg-ink-1 border border-ink-3 rounded-lg overflow-hidden mb-8">
          <div className="flex items-center gap-3 p-3 border-b border-ink-3">
            <span className="text-bone-3 pl-2">
              <IconSearch size={18} />
            </span>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilter('search', e.target.value)}
              placeholder="Buscar por título o descripción…"
              className="flex-1 bg-transparent outline-none text-bone-0 placeholder:text-bone-3 text-[15px]"
            />
            {filters.search && (
              <button
                onClick={() => handleFilter('search', '')}
                className="text-bone-3 hover:text-bone-0 p-1"
                aria-label="Limpiar búsqueda"
              >
                <IconClose size={16} />
              </button>
            )}
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`h-9 px-3 rounded text-sm font-mono uppercase tracking-ticker border transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-ink-2 border-ink-4 text-bone-0'
                  : 'border-ink-3 text-bone-2 hover:text-bone-0'
              }`}
            >
              filtros
              <IconChevronDown
                size={14}
                className={showFilters ? 'rotate-180 transition-transform' : 'transition-transform'}
              />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 border-b border-ink-3 ap-fade-up">
              <SelectField
                label="Estado"
                value={filters.status}
                onChange={(v) => handleFilter('status', v as Filters['status'])}
                options={[
                  ['', 'Todos'],
                  ['pendiente', 'Pendiente'],
                  ['completado', 'Completado'],
                  ['cancelado', 'Cancelado'],
                ]}
              />
              <SelectField
                label="Categoría"
                value={filters.category}
                onChange={(v) => handleFilter('category', v as Filters['category'])}
                options={[
                  ['', 'Todas'],
                  ['personal', 'Personal'],
                  ['trabajo', 'Trabajo'],
                  ['salud', 'Salud'],
                  ['educacion', 'Educación'],
                  ['otro', 'Otro'],
                ]}
              />
              <SelectField
                label="Prioridad"
                value={filters.priority}
                onChange={(v) => handleFilter('priority', v as Filters['priority'])}
                options={[
                  ['', 'Todas'],
                  ['normal', 'Normal'],
                  ['alta', 'Alta'],
                  ['urgente', 'Urgente'],
                ]}
              />
              <DateField
                label="Desde"
                value={filters.from}
                onChange={(v) => handleFilter('from', v)}
              />
              <DateField
                label="Hasta"
                value={filters.to}
                onChange={(v) => handleFilter('to', v)}
              />
              {activeFilters && (
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="col-span-2 md:col-span-5 text-left font-mono text-[11px] uppercase tracking-ticker text-bone-3 hover:text-bone-0 mt-1"
                >
                  ✕ limpiar todos los filtros
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-bone-2 font-mono text-sm py-12 text-center">
            <span className="ap-pulse-dot">cargando eventos…</span>
          </p>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<IconEvents size={40} />}
            title={filters.search ? 'Sin resultados' : 'Tu agenda está vacía'}
            description={
              filters.search
                ? `No encontramos eventos para "${filters.search}". Prueba otras palabras o limpia los filtros.`
                : 'Aún no has creado eventos. Crea el primero para empezar a recibir recordatorios.'
            }
            action={
              <Link
                href="/events/new"
                className="inline-flex h-10 px-4 items-center gap-2 rounded bg-lime text-ink-0 font-medium hover:bg-bone-0 transition-colors"
              >
                <IconPlus size={16} /> {filters.search ? 'Crear evento' : 'Crear primer evento'}
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {events.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-3 mb-1">
        {label}
      </p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 pl-3 pr-8 bg-ink-2 border border-ink-3 rounded text-sm text-bone-0 outline-none focus:border-lime/60 appearance-none cursor-pointer"
        >
          {options.map(([v, l]) => (
            <option key={v} value={v} className="bg-ink-1 text-bone-0">
              {l}
            </option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-bone-3 pointer-events-none">
          <IconChevronDown size={14} />
        </span>
      </div>
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-3 mb-1">
        {label}
      </p>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 bg-ink-2 border border-ink-3 rounded text-sm text-bone-0 outline-none focus:border-lime/60 [color-scheme:dark]"
      />
    </label>
  );
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;
  const day = start.toLocaleDateString('es-CO', { day: '2-digit' });
  const month = start.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  const time = start.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const endTime = end
    ? end.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : null;
  const isPast = start < new Date();
  const completed = event.status === 'completado';
  const cancelled = event.status === 'cancelado';

  return (
    <li
      className="ap-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <Link
        href={`/events/${event.id}`}
        className="group flex items-stretch gap-5 p-5 bg-ink-1 border border-ink-3 rounded-lg hover:bg-ink-2 hover:border-ink-4 transition-colors"
      >
        {/* Date column */}
        <div className="shrink-0 w-16 text-center border-r border-ink-3 pr-5 flex flex-col justify-center">
          <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-3">
            {month}
          </p>
          <p className="font-display text-4xl tracking-editorial text-bone-0 leading-none my-1">
            {day}
          </p>
          <p className="font-mono text-xs text-bone-2">{time}</p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                CATEGORY_DOT[event.category] || CATEGORY_DOT.otro
              }`}
            />
            <span className="font-mono text-[10px] uppercase tracking-ticker text-bone-2">
              {CATEGORY_LABEL[event.category] || 'Otro'}
            </span>
            {(completed || cancelled || isPast) && (
              <span
                className={`font-mono text-[10px] uppercase tracking-ticker ${
                  completed
                    ? 'text-lime'
                    : cancelled
                    ? 'text-crimson'
                    : 'text-bone-3'
                }`}
              >
                · {completed ? 'completado' : cancelled ? 'cancelado' : 'pasado'}
              </span>
            )}
          </div>

          <h3
            className={`font-display text-2xl tracking-editorial truncate ${
              completed || cancelled ? 'text-bone-2 line-through decoration-1' : 'text-bone-0'
            }`}
          >
            {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-bone-2">
            {endTime && (
              <span className="font-mono text-xs">
                {time}–{endTime}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5">
                <IconLocation size={14} /> {event.location}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-bone-2 text-sm mt-2 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="shrink-0 flex flex-col items-end justify-between gap-3">
          {event.priority && event.priority !== 'normal' && (
            <Badge variant={PRIORITY_VARIANT[event.priority]} dot>
              {event.priority}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <Link
              href={`/events/${event.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="text-bone-3 hover:text-bone-0 p-1.5 rounded hover:bg-ink-3 transition-colors"
              aria-label="Editar"
              title="Editar"
            >
              <IconEdit size={16} />
            </Link>
            <span className="text-bone-3 group-hover:text-lime transition-colors">
              <IconArrowRight size={18} />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
