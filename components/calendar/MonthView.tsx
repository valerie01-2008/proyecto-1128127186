'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconArrowRight,
} from '@/components/icons';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  category: string;
  priority: string;
  status: string;
}

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateChange: (date: Date) => void;
  userTimezone: string;
}

const CATEGORY_BG: Record<string, string> = {
  personal: 'bg-cat-personal',
  trabajo: 'bg-cat-trabajo',
  salud: 'bg-cat-salud',
  educacion: 'bg-cat-educacion',
  otro: 'bg-cat-otro',
};

const CATEGORY_LABEL: Record<string, string> = {
  personal: 'Personal',
  trabajo: 'Trabajo',
  salud: 'Salud',
  educacion: 'Educación',
  otro: 'Otro',
};

const WEEK_LABELS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export default function MonthView({
  currentDate,
  events,
  onDateChange,
  userTimezone,
}: MonthViewProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  const days: Date[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const eventsByDay = events.reduce<Record<string, CalendarEvent[]>>(
    (acc, event) => {
      const eventDate = new Date(event.start_at);
      const dayKey = eventDate.toDateString();
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(event);
      return acc;
    },
    {},
  );

  Object.values(eventsByDay).forEach((arr) =>
    arr.sort(
      (a, b) =>
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    ),
  );

  const handleDayClick = (day: Date) => {
    const dayEvents = eventsByDay[day.toDateString()] || [];
    if (dayEvents.length === 0) {
      router.push(`/calendar/day?date=${day.toISOString().split('T')[0]}`);
    } else {
      setSelectedDay(day);
    }
  };

  const formatDayInTimezone = (date: Date) =>
    new Intl.DateTimeFormat('es-ES', {
      timeZone: userTimezone,
      day: 'numeric',
    }).format(date);

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();

  const isCurrentMonth = (date: Date) =>
    date.getMonth() === currentDate.getMonth();

  const monthLabel = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  return (
    <section className="bg-ink-1 border border-ink-3 rounded-lg overflow-hidden">
      {/* Header de navegación */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-ink-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              onDateChange(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1,
                  1,
                ),
              )
            }
            className="h-9 w-9 inline-flex items-center justify-center rounded border border-ink-3 bg-ink-1 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors"
            aria-label="Mes anterior"
          >
            <IconChevronLeft size={18} />
          </button>
          <button
            onClick={() =>
              onDateChange(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  1,
                ),
              )
            }
            className="h-9 w-9 inline-flex items-center justify-center rounded border border-ink-3 bg-ink-1 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors"
            aria-label="Mes siguiente"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        <h2 className="font-display tracking-editorial text-2xl lg:text-3xl">
          <span className="capitalize">{monthLabel.split(' ')[0]}</span>{' '}
          <span className="italic text-bone-2">
            {monthLabel.split(' ').slice(1).join(' ')}
          </span>
        </h2>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] uppercase tracking-ticker text-bone-3">
          <span className="h-1.5 w-1.5 rounded-full bg-lime ap-pulse-dot" />
          en vivo
        </div>
      </header>

      {/* Cabecera de días de la semana */}
      <div className="grid grid-cols-7 border-b border-ink-3">
        {WEEK_LABELS.map((day) => (
          <div
            key={day}
            className="px-3 py-3 font-mono text-[11px] uppercase tracking-ticker text-bone-2 border-r border-ink-3 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Cuadrícula del mes */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = eventsByDay[day.toDateString()] || [];
          const hasEvents = dayEvents.length > 0;
          const isCurrentDay = isToday(day);
          const inCurrentMonth = isCurrentMonth(day);
          const isLastRow = index >= days.length - 7;
          const isLastCol = (index + 1) % 7 === 0;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`relative min-h-[112px] lg:min-h-[128px] text-left px-2.5 py-2 transition-colors group
                ${isLastCol ? '' : 'border-r border-ink-3'}
                ${isLastRow ? '' : 'border-b border-ink-3'}
                ${isCurrentDay ? 'bg-ink-2' : 'bg-ink-1 hover:bg-ink-2'}
                ${!inCurrentMonth ? 'opacity-60' : ''}
              `}
            >
              {isCurrentDay && (
                <span className="absolute inset-px rounded-[2px] border border-lime/70 pointer-events-none" />
              )}

              <div className="flex items-start justify-between">
                <span
                  className={`font-display tracking-editorial leading-none text-2xl lg:text-3xl ${
                    inCurrentMonth ? 'text-bone-0' : 'text-bone-3'
                  }`}
                >
                  {formatDayInTimezone(day)}
                </span>
                {isCurrentDay && (
                  <span className="h-1.5 w-1.5 rounded-full bg-lime mt-2 ap-pulse-dot" />
                )}
              </div>

              {hasEvents && (
                <div className="mt-3 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className={`block h-1.5 w-full rounded-full ${
                        CATEGORY_BG[event.category] || CATEGORY_BG.otro
                      } ${
                        event.priority === 'urgente' ? 'ring-1 ring-crimson' : ''
                      }`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-2 mt-1.5">
                      +{dayEvents.length - 3} más
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal de eventos del día */}
      {selectedDay && (
        <DayModal
          day={selectedDay}
          events={eventsByDay[selectedDay.toDateString()] || []}
          userTimezone={userTimezone}
          onClose={() => setSelectedDay(null)}
          onPick={(id) => {
            router.push(`/events/${id}`);
            setSelectedDay(null);
          }}
        />
      )}
    </section>
  );
}

function DayModal({
  day,
  events,
  userTimezone,
  onClose,
  onPick,
}: {
  day: Date;
  events: CalendarEvent[];
  userTimezone: string;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    timeZone: userTimezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(day);

  const yearLabel = new Intl.DateTimeFormat('es-ES', {
    timeZone: userTimezone,
    year: 'numeric',
  }).format(day);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-ink-0/85 backdrop-blur-sm ap-fade-up"
        onClick={onClose}
      />
      <div className="relative bg-ink-1 border border-ink-3 rounded-lg w-full max-w-lg shadow-lift ap-fade-up">
        <header className="flex items-start justify-between px-6 py-5 border-b border-ink-3">
          <div>
            <p className="eyebrow mb-2">Agenda · día</p>
            <h3 className="font-display tracking-editorial text-2xl">
              <span className="capitalize">{dateLabel}</span>
            </h3>
            <p className="font-mono text-xs text-bone-3 mt-1">{yearLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded border border-ink-3 bg-ink-1 text-bone-2 hover:text-bone-0 hover:border-ink-4 transition-colors"
            aria-label="Cerrar"
          >
            <IconClose size={18} />
          </button>
        </header>

        <ul className="max-h-[60vh] overflow-y-auto divide-y divide-ink-3">
          {events.map((event, i) => {
            const start = new Date(event.start_at);
            const end = event.end_at ? new Date(event.end_at) : null;
            const timeStart = new Intl.DateTimeFormat('es-ES', {
              timeZone: userTimezone,
              hour: '2-digit',
              minute: '2-digit',
            }).format(start);
            const timeEnd = end
              ? new Intl.DateTimeFormat('es-ES', {
                  timeZone: userTimezone,
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(end)
              : null;

            return (
              <li
                key={event.id}
                className="ap-fade-up"
                style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
              >
                <button
                  type="button"
                  onClick={() => onPick(event.id)}
                  className="group w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-ink-2 transition-colors"
                >
                  <span
                    className={`h-10 w-1 rounded-full shrink-0 ${
                      CATEGORY_BG[event.category] || CATEGORY_BG.otro
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-2">
                        {timeStart}
                        {timeEnd && ` — ${timeEnd}`}
                      </p>
                      {event.priority === 'urgente' && (
                        <span className="font-mono text-[10px] uppercase tracking-ticker text-crimson">
                          urgente
                        </span>
                      )}
                    </div>
                    <p className="font-display text-lg tracking-editorial text-bone-0 truncate">
                      {event.title}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-3 mt-1">
                      {CATEGORY_LABEL[event.category] || 'Otro'}
                    </p>
                  </div>
                  <IconArrowRight
                    size={16}
                    className="text-bone-3 group-hover:text-lime transition-colors shrink-0"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
