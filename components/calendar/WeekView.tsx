'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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

const CATEGORY_COLORS = {
  personal: 'bg-violet-300',
  trabajo: 'bg-blue-500',
  salud: 'bg-green-500',
  educacion: 'bg-amber-500',
  otro: 'bg-gray-500',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekView({ currentDate, events, onDateChange, userTimezone }: WeekViewProps) {
  const router = useRouter();

  // Obtener el inicio de la semana (domingo)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Generar los 7 días de la semana
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  // Filtrar eventos de esta semana
  const weekEvents = events.filter(event => {
    const eventDate = new Date(event.start_at);
    return eventDate >= startOfWeek && eventDate < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  // Calcular posiciones de eventos con overlaps
  const getEventPosition = (event: CalendarEvent, dayIndex: number) => {
    const startTime = new Date(event.start_at);
    const endTime = event.end_at ? new Date(event.end_at) : new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora por defecto

    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
    const duration = Math.max(endHour - startHour, 0.5); // Mínimo 30 min

    const top = startHour * 60; // pixels (60px por hora)
    const height = duration * 60;

    // Calcular overlaps para determinar columna
    const dayEvents = weekEvents.filter(e => {
      const eDate = new Date(e.start_at);
      return eDate.toDateString() === weekDays[dayIndex].toDateString();
    });

    const overlappingEvents = dayEvents.filter(e => {
      if (e.id === event.id) return false;
      const eStart = new Date(e.start_at);
      const eEnd = e.end_at ? new Date(e.end_at) : new Date(eStart.getTime() + 60 * 60 * 1000);
      return (startTime < eEnd && endTime > eStart);
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

  const formatDayHeader = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      timeZone: userTimezone,
      weekday: 'short',
      day: 'numeric',
    }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header con navegación */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => onDateChange(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          Semana del {formatDayHeader(startOfWeek)} al {formatDayHeader(weekDays[6])}
        </h2>

        <button
          onClick={() => onDateChange(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Header de días */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-3 text-center text-sm font-medium text-gray-500 border-r">
          Hora
        </div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`p-3 text-center text-sm font-medium border-r last:border-r-0 ${
              isToday(day) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            {formatDayHeader(day)}
          </div>
        ))}
      </div>

      {/* Cuadrícula de horas */}
      <div className="relative">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b">
            {/* Columna de hora */}
            <div className="p-2 text-xs text-gray-500 border-r text-center">
              {hour.toString().padStart(2, '0')}:00
            </div>

            {/* Columnas de días */}
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="relative border-r last:border-r-0 min-h-[60px] cursor-pointer hover:bg-gray-50"
                onClick={() => handleTimeSlotClick(day, hour)}
              >
                {/* Eventos del día */}
                {weekEvents
                  .filter(event => {
                    const eventDate = new Date(event.start_at);
                    return eventDate.toDateString() === day.toDateString() &&
                           Math.floor(new Date(event.start_at).getHours()) === hour;
                  })
                  .map((event) => {
                    const position = getEventPosition(event, dayIndex);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`
                          absolute p-1 text-xs text-white rounded cursor-pointer overflow-hidden
                          ${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]}
                          ${event.priority === 'urgente' ? 'border-2 border-red-500 animate-pulse' : ''}
                        `}
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height}px`,
                          left: `${position.left}%`,
                          width: `${position.width}%`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/events/${event.id}`);
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {new Intl.DateTimeFormat('es-ES', {
                            timeZone: userTimezone,
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(event.start_at))}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}