'use client';

import { useRouter } from 'next/navigation';
import { IconChevronLeft, IconChevronRight } from '@/components/icons';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  category: string;
  priority: string;
  status: string;
}

interface WeekViewProps {
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

// Ventana editorial 06:00 – 22:00
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_PX = 64;

export default function WeekView({
  currentDate,
  events,
  onDateChange,
  userTimezone,
}: WeekViewProps) {
  const router = useRouter();

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const weekEvents = events.filter((event) => {
    const eventDate = new Date(event.start_at);
    return eventDate >= startOfWeek && eventDate < endOfWeek;
  });

  const getEventPosition = (event: CalendarEvent, dayIndex: number) => {
    const startTime = new Date(event.start_at);
    const endTime = event.end_at
      ? new Date(event.end_at)
      : new Date(startTime.getTime() + 60 * 60 * 1000);

    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
    const duration = Math.max(endHour - startHour, 0.5);

    const top = (startHour - HOURS[0]) * HOUR_PX;
    const height = duration * HOUR_PX;

    const dayEvents = weekEvents.filter((e) => {
      const eDate = new Date(e.start_at);
      return eDate.toDateString() === weekDays[dayIndex].toDateString();
    });

    const overlappingEvents = dayEvents.filter((e) => {
      if (e.id === event.id) return false;
      const eStart = new Date(e.start_at);
      const eEnd = e.end_at
        ? new Date(e.end_at)
        : new Date(eStart.getTime() + 60 * 60 * 1000);
      return startTime < eEnd && endTime > eStart;
    });

    const column = overlappingEvents.length;
    const totalColumns = overlappingEvents.length + 1;
    const width = 100 / totalColumns;
    const left = column * width;

    return { top, height, left, width };
  };

  const handleTimeSlotClick = (day: Date, hour: number) => {
    const dateStr = day.toISOString().split('T')[0];
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    router.push(`/events/new?date=${dateStr}&time=${timeStr}`);
  };

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();

  return (
    <section className="bg-ink-1 border border-ink-3 rounded-lg overflow-hidden">
      {/* Header de navegación */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-ink-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onDateChange(
                new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
              )
            }
            className="h-9 w-9 inline-flex items-center justify-center rounded border border-ink-3 bg-ink-1 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors"
            aria-label="Semana anterior"
          >
            <IconChevronLeft size={18} />
          </button>
          <button
            onClick={() =>
              onDateChange(
                new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
              )
            }
            className="h-9 w-9 inline-flex items-center justify-center rounded border border-ink-3 bg-ink-1 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors"
            aria-label="Semana siguiente"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        <div className="text-center">
          <p className="eyebrow mb-1">Semana en curso</p>
          <h2 className="font-display tracking-editorial text-xl lg:text-2xl">
            <span className="capitalize">
              {new Intl.DateTimeFormat('es-ES', {
                day: 'numeric',
                month: 'short',
              }).format(startOfWeek)}
            </span>
            <span className="text-bone-3 mx-2">—</span>
            <span className="italic text-bone-2 capitalize">
              {new Intl.DateTimeFormat('es-ES', {
                day: 'numeric',
                month: 'short',
              }).format(weekDays[6])}
            </span>
          </h2>
        </div>

        <div className="hidden sm:block w-[88px]" />
      </header>

      {/* Fila de días */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-ink-3">
        <div className="px-3 py-3 border-r border-ink-3 font-mono text-[11px] uppercase tracking-ticker text-bone-3">
          hora
        </div>
        {weekDays.map((day, index) => {
          const today = isToday(day);
          return (
            <div
              key={index}
              className={`px-3 py-3 border-r border-ink-3 last:border-r-0 ${
                today ? 'bg-ink-2' : ''
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-2">
                {new Intl.DateTimeFormat('es-ES', {
                  timeZone: userTimezone,
                  weekday: 'short',
                }).format(day)}
              </p>
              <p
                className={`font-display tracking-editorial text-2xl mt-0.5 ${
                  today ? 'text-bone-0' : 'text-bone-1'
                }`}
              >
                {new Intl.DateTimeFormat('es-ES', {
                  timeZone: userTimezone,
                  day: 'numeric',
                }).format(day)}
              </p>
              {today && (
                <span className="block h-px w-8 bg-lime mt-1.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Rejilla de horas */}
      <div className="relative overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(7,1fr)]">
          {/* Columna de horas */}
          <div className="border-r border-ink-3">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_PX}px` }}
                className="px-3 pt-1 font-mono text-[11px] uppercase tracking-ticker text-bone-3 border-b border-ink-3 last:border-b-0"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Columnas de días */}
          {weekDays.map((day, dayIndex) => {
            const today = isToday(day);
            const dayEvents = weekEvents.filter(
              (e) =>
                new Date(e.start_at).toDateString() === day.toDateString() &&
                new Date(e.start_at).getHours() >= HOURS[0] &&
                new Date(e.start_at).getHours() <= HOURS[HOURS.length - 1],
            );

            return (
              <div
                key={dayIndex}
                className={`relative border-r border-ink-3 last:border-r-0 ${
                  today ? 'bg-ink-2/40' : ''
                }`}
                style={{ height: `${HOURS.length * HOUR_PX}px` }}
              >
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeSlotClick(day, hour)}
                    style={{ height: `${HOUR_PX}px` }}
                    className="block w-full border-b border-ink-3 last:border-b-0 hover:bg-ink-2 transition-colors cursor-pointer"
                    aria-label={`Crear evento ${hour}:00`}
                  />
                ))}

                {dayEvents.map((event) => {
                  const pos = getEventPosition(event, dayIndex);
                  const isUrgent = event.priority === 'urgente';
                  const startLabel = new Intl.DateTimeFormat('es-ES', {
                    timeZone: userTimezone,
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(event.start_at));

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/events/${event.id}`);
                      }}
                      className={`absolute overflow-hidden rounded text-left ap-fade-up ${
                        CATEGORY_BG[event.category] || CATEGORY_BG.otro
                      } text-ink-0 hover:brightness-110 transition-[filter]`}
                      style={{
                        top: `${pos.top}px`,
                        height: `${Math.max(pos.height - 2, 22)}px`,
                        left: `calc(${pos.left}% + 2px)`,
                        width: `calc(${pos.width}% - 4px)`,
                      }}
                    >
                      {isUrgent && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-lime" />
                      )}
                      <div className="pl-2 pr-1.5 py-1">
                        <p className="font-mono text-[10px] uppercase tracking-ticker opacity-80 truncate">
                          {startLabel}
                        </p>
                        <p className="font-display text-sm leading-tight truncate">
                          {event.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
