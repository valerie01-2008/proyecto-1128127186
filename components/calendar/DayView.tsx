'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconChevronLeft,
  IconChevronRight,
  IconLocation,
  IconClock,
  IconArrowRight,
  IconPlus,
} from '@/components/icons';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  location?: string | null;
  category: string;
  priority: string;
  status: string;
}

interface DayViewProps {
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

// Ventana editorial 06:00 – 22:00
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

export default function DayView({
  currentDate,
  events,
  onDateChange,
  userTimezone,
}: DayViewProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dayEvents = events
    .filter(
      (event) =>
        new Date(event.start_at).toDateString() ===
        currentDate.toDateString(),
    )
    .sort(
      (a, b) =>
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    );

  const isEventPast = (event: CalendarEvent) =>
    new Date(event.start_at) < currentTime;

  const isToday = currentDate.toDateString() === new Date().toDateString();

  const handleSlotClick = (hour: number) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    router.push(`/events/new?date=${dateStr}&time=${timeStr}`);
  };

  const weekday = new Intl.DateTimeFormat('es-ES', {
    timeZone: userTimezone,
    weekday: 'long',
  }).format(currentDate);
  const dayNum = new Intl.DateTimeFormat('es-ES', {
    timeZone: userTimezone,
    day: 'numeric',
  }).format(currentDate);
  const monthName = new Intl.DateTimeFormat('es-ES', {
    timeZone: userTimezone,
    month: 'long',
  }).format(currentDate);
  const yearLabel = new Intl.DateTimeFormat('es-ES', {
    timeZone: userTimezone,
    year: 'numeric',
  }).format(currentDate);

  return (
    <section className="bg-ink-1 border border-ink-3 rounded-lg overflow-hidden">
      {/* Cabecera editorial */}
      <header className="px-6 py-6 border-b border-ink-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="eyebrow mb-3">
              Agenda · día {isToday && '· hoy'}
            </p>
            <h2 className="font-display tracking-editorial text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.05]">
              <span className="capitalize">{weekday}</span>
              <span className="text-bone-3 mx-2">·</span>
              <span className="italic text-bone-2">
                {dayNum} {monthName}
              </span>
              <span className="text-bone-3 mx-2">·</span>
              <span className="font-mono text-base text-bone-3 align-middle">
                {yearLabel}
              </span>
            </h2>
            <p className="mt-3 text-bone-2 text-sm">
              <span className="text-bone-0 font-mono">{dayEvents.length}</span>{' '}
              evento{dayEvents.length === 1 ? '' : 's'} programado
              {dayEvents.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                onDateChange(
                  new Date(currentDate.getTime() - 24 * 60 * 60 * 1000),
                )
              }
              className="h-9 w-9 inline-flex items-center justify-center rounded border border-ink-3 bg-ink-1 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors"
              aria-label="Día anterior"
            >
              <IconChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                onDateChange(
                  new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
                )
              }
              className="h-9 w-9 inline-flex items-center justify-center rounded border border-ink-3 bg-ink-1 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors"
              aria-label="Día siguiente"
            >
              <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <div className="grid grid-cols-[88px_1fr]">
        {/* Columna de horas */}
        <div className="border-r border-ink-3">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-20 px-3 pt-2 border-b border-ink-3 last:border-b-0"
            >
              <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-2">
                {hour.toString().padStart(2, '0')}:00
              </p>
            </div>
          ))}
        </div>

        {/* Columna principal */}
        <div>
          {HOURS.map((hour) => {
            const hourEvents = dayEvents.filter(
              (e) => new Date(e.start_at).getHours() === hour,
            );
            const currentHour = currentTime.getHours();
            const showLine = isToday && currentHour === hour;
            const minuteOffset = isToday
              ? (currentTime.getMinutes() / 60) * 80
              : 0;

            return (
              <div
                key={hour}
                className="relative h-20 border-b border-ink-3 last:border-b-0"
              >
                {showLine && (
                  <div
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                    style={{ top: `${minuteOffset}px` }}
                  >
                    <span className="block h-px bg-lime/80" />
                    <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-lime ap-pulse-dot" />
                  </div>
                )}

                {hourEvents.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleSlotClick(hour)}
                    className="group h-full w-full flex items-center pl-4 pr-6 hover:bg-ink-2 transition-colors"
                    aria-label={`Crear evento a las ${hour}:00`}
                  >
                    <span className="flex-1 h-px border-t border-dashed border-ink-3 group-hover:border-ink-4" />
                    <span className="ml-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-ticker text-bone-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconPlus size={12} /> añadir
                    </span>
                  </button>
                ) : (
                  <ul className="h-full px-4 py-2 flex flex-col gap-2">
                    {hourEvents.map((event, i) => {
                      const past = isEventPast(event);
                      const start = new Date(event.start_at);
                      const end = event.end_at ? new Date(event.end_at) : null;
                      const startLabel = new Intl.DateTimeFormat('es-ES', {
                        timeZone: userTimezone,
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(start);
                      const endLabel = end
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
                            onClick={() => router.push(`/events/${event.id}`)}
                            className={`group relative w-full flex items-stretch gap-3 text-left bg-ink-1 border border-ink-3 rounded hover:border-ink-4 hover:bg-ink-2 transition-colors overflow-hidden ${
                              past ? 'opacity-60' : ''
                            }`}
                          >
                            <span
                              className={`w-1 shrink-0 ${
                                CATEGORY_BG[event.category] ||
                                CATEGORY_BG.otro
                              }`}
                            />
                            {event.priority === 'urgente' && (
                              <span className="absolute left-1 top-0 bottom-0 w-px bg-crimson" />
                            )}
                            <div className="flex-1 min-w-0 py-2 pr-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    CATEGORY_BG[event.category] ||
                                    CATEGORY_BG.otro
                                  }`}
                                />
                                <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-2">
                                  {CATEGORY_LABEL[event.category] || 'Otro'}
                                </p>
                                {event.priority === 'urgente' && (
                                  <p className="font-mono text-[10px] uppercase tracking-ticker text-crimson">
                                    urgente
                                  </p>
                                )}
                              </div>
                              <p className="font-display text-base tracking-editorial text-bone-0 truncate">
                                {event.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 font-mono text-[11px] text-bone-2">
                                <span className="inline-flex items-center gap-1.5">
                                  <IconClock size={12} />
                                  {startLabel}
                                  {endLabel && (
                                    <span className="text-bone-3">
                                      {' '}
                                      → {endLabel}
                                    </span>
                                  )}
                                </span>
                                {event.location && (
                                  <span className="inline-flex items-center gap-1.5 truncate">
                                    <IconLocation size={12} />
                                    <span className="truncate">
                                      {event.location}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="self-center pr-3 text-bone-3 group-hover:text-lime transition-colors">
                              <IconArrowRight size={16} />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
