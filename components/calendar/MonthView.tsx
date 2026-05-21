'use client';

import { useState } from 'react';
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

interface MonthViewProps {
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

export default function MonthView({ currentDate, events, onDateChange, userTimezone }: MonthViewProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Obtener el primer día del mes actual
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Comenzar desde el domingo

  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay())); // Terminar en sábado

  // Generar array de días
  const days = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Agrupar eventos por día
  const eventsByDay = events.reduce((acc, event) => {
    const eventDate = new Date(event.start_at);
    const dayKey = eventDate.toDateString();
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const handleDayClick = (day: Date) => {
    const dayEvents = eventsByDay[day.toDateString()] || [];
    if (dayEvents.length === 0) {
      // Día vacío - navegar a vista diaria
      router.push(`/calendar/day?date=${day.toISOString().split('T')[0]}`);
    } else {
      setSelectedDay(day);
    }
  };

  const formatDayInTimezone = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      timeZone: userTimezone,
      day: 'numeric',
    }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header con navegación */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          {new Intl.DateTimeFormat('es-ES', {
            month: 'long',
            year: 'numeric',
          }).format(currentDate)}
        </h2>

        <button
          onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = eventsByDay[day.toDateString()] || [];
          const hasEvents = dayEvents.length > 0;
          const isCurrentDay = isToday(day);
          const isInCurrentMonth = isCurrentMonth(day);

          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-[120px] p-2 border-r border-b cursor-pointer hover:bg-gray-50 transition-colors
                ${isCurrentDay ? 'bg-blue-50' : ''}
                ${!isInCurrentMonth ? 'text-gray-400 bg-gray-50' : 'text-gray-900'}
                ${hasEvents ? 'relative' : ''}
              `}
            >
              <div className="text-sm font-medium mb-1">
                {formatDayInTimezone(day)}
              </div>

              {/* Indicadores de eventos */}
              {hasEvents ? (
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: eventIndex * 0.1 }}
                      className={`
                        text-xs p-1 rounded truncate
                        ${event.priority === 'urgente' ? 'border-2 border-red-500 animate-pulse' : 'border border-gray-200'}
                        ${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]} text-white
                      `}
                    >
                      {event.title}
                    </motion.div>
                  ))}

                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 2} más
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  Sin eventos
                </div>
              )}

              {/* Puntos de color por categoría */}
              {hasEvents && (
                <div className="absolute top-1 right-1 flex gap-1">
                  {Array.from(new Set(dayEvents.map(e => e.category))).slice(0, 3).map((category) => (
                    <div
                      key={category}
                      className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Popup de eventos del día seleccionado */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Eventos del {formatDayInTimezone(selectedDay)}
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {eventsByDay[selectedDay.toDateString()]?.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    router.push(`/events/${event.id}`);
                    setSelectedDay(null);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]}`} />
                    <span className="font-medium text-sm">{event.title}</span>
                    {event.priority === 'urgente' && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded animate-pulse">
                        Urgente
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Intl.DateTimeFormat('es-ES', {
                      timeZone: userTimezone,
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(event.start_at))}
                    {event.end_at && ` - ${new Intl.DateTimeFormat('es-ES', {
                      timeZone: userTimezone,
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(event.end_at))}`}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}