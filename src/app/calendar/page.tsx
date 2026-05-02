'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MonthView from '@/components/calendar/MonthView';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  category: string;
  priority: string;
  status: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState('America/Bogota');

  useEffect(() => {
    // Obtener timezone del usuario (simulado por ahora)
    // TODO: Obtener del contexto de autenticación
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      // Obtener rango del mes actual
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Extender el rango para incluir eventos que puedan solaparse
      const from = new Date(startOfMonth);
      from.setDate(from.getDate() - 7); // Una semana antes
      const to = new Date(endOfMonth);
      to.setDate(to.getDate() + 7); // Una semana después

      const response = await fetch(
        `/api/calendar?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`
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

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    // Actualizar URL
    const dateStr = newDate.toISOString().split('T')[0];
    router.replace(`/calendar?date=${dateStr}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
        <div className="flex gap-2">
          <Link
            href="/calendar/week"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Vista semanal
          </Link>
          <Link
            href={`/calendar/day?date=${currentDate.toISOString().split('T')[0]}`}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Vista diaria
          </Link>
        </div>
      </div>

      {/* Vista mensual */}
      <MonthView
        currentDate={currentDate}
        events={events}
        onDateChange={handleDateChange}
        userTimezone={userTimezone}
      />
    </div>
  );
}