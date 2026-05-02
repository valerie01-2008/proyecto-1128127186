'use client';

import { useState, useEffect } from 'react';
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

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateChange: (date: Date) => void;
  userTimezone: string;
}

const CATEGORY_COLORS = {
  personal: 'bg-violet-500',
  trabajo: 'bg-blue-500',
  salud: 'bg-green-500',
  educacion: 'bg-amber-500',
  otro: 'bg-gray-500',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DayView({ currentDate, events, onDateChange, userTimezone }: DayViewProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar eventos del día actual
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start_at);
    return eventDate.toDateString() === currentDate.toDateString();
  });

  // Calcular posición de la línea de tiempo actual
  const getCurrentTimePosition = () => {
    const now = new Date();
    const nowInTimezone = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
    const hours = nowInTimezone.getHours() + nowInTimezone.getMinutes() / 60;
    return hours * 60; // 60px por hora
  };

  // Verificar si un evento ya pasó
  const isEventPast = (event: CalendarEvent) => {
    const eventTime = new Date(event.start_at);
    return eventTime < currentTime;
  };

  const handleTimeSlotClick = (hour: number, minute: number = 0) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    router.push(`/events/new?date=${dateStr}&time=${timeStr}`);
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header con navegación */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => onDateChange(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          {new Intl.DateTimeFormat('es-ES', {
            timeZone: userTimezone,
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(currentDate)}
        </h2>

        <button
          onClick={() => onDateChange(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Línea de tiempo */}
      <div className="relative">
        {/* Línea de tiempo actual (solo si es hoy) */}
        {isToday && (
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
            style={{ top: `${getCurrentTimePosition()}px` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute -left-2 -top-1 w-4 h-4 bg-red-500 rounded-full" />
          </motion.div>
        )}

        {HOURS.map((hour) => (
          <div key={hour} className="relative">
            {/* Línea de hora */}
            <div className="flex border-b">
              <div className="w-20 p-2 text-xs text-gray-500 border-r text-center">
                {formatTime(hour)}
              </div>
              <div
                className="flex-1 min-h-[60px] cursor-pointer hover:bg-gray-50 relative"
                onClick={() => handleTimeSlotClick(hour)}
              >
                {/* Eventos de esta hora */}
                {dayEvents
                  .filter(event => new Date(event.start_at).getHours() === hour)
                  .map((event) => {
                    const startTime = new Date(event.start_at);
                    const endTime = event.end_at ? new Date(event.end_at) : new Date(startTime.getTime() + 60 * 60 * 1000);
                    const startMinutes = startTime.getMinutes();
                    const duration = Math.max((endTime.getTime() - startTime.getTime()) / (1000 * 60), 30); // Mínimo 30 min

                    const top = (startMinutes / 60) * 60; // Posición dentro de la hora
                    const height = (duration / 60) * 60;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isEventPast(event) ? 0.6 : 1, x: 0 }}
                        className={`
                          absolute left-2 right-2 p-2 rounded-lg cursor-pointer overflow-hidden
                          ${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]} text-white
                          ${event.priority === 'urgente' ? 'border-2 border-red-500 animate-pulse' : ''}
                          ${isEventPast(event) ? 'opacity-60' : ''}
                        `}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/events/${event.id}`);
                        }}
                      >
                        <div className="font-medium text-sm truncate">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {new Intl.DateTimeFormat('es-ES', {
                            timeZone: userTimezone,
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(startTime)}
                          {event.end_at && ` - ${new Intl.DateTimeFormat('es-ES', {
                            timeZone: userTimezone,
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(endTime)}`}
                        </div>
                      </motion.div>
                    );
                  })}

                {/* Franjas de 15 minutos para clics */}
                {[0, 15, 30, 45].map((minute) => (
                  <div
                    key={minute}
                    className="absolute left-0 right-0 h-[15px] cursor-pointer hover:bg-blue-50 hover:bg-opacity-50"
                    style={{ top: `${(minute / 60) * 60}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimeSlotClick(hour, minute);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}