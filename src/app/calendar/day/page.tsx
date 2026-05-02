'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DayView from '@/components/calendar/DayView';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  category: string;
  priority: string;
  status: string;
}

export default function DayCalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState('America/Bogota');

  useEffect(() => {
    // Obtener fecha de la URL o usar hoy
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get('date');
      if (dateParam) {
        setCurrentDate(new Date(dateParam));
      }
    }

    // Obtener timezone del usuario
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      // Obtener eventos del día actual
      const from = currentDate.toISOString().split('T')[0];
      const to = from; // Mismo día

      const response = await fetch(`/api/calendar?from=${from}&to=${to}`);

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
    router.replace(`/calendar/day?date=${dateStr}`);
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
        <h1 className="text-3xl font-bold text-gray-900">Vista Diaria</h1>
        <div className="flex gap-2">
          <Link
            href={`/calendar?date=${currentDate.toISOString().split('T')[0]}`}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Vista mensual
          </Link>
          <Link
            href={`/calendar/week?date=${currentDate.toISOString().split('T')[0]}`}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Vista semanal
          </Link>
        </div>
      </div>

      {/* Vista diaria */}
      <DayView
        currentDate={currentDate}
        events={events}
        onDateChange={handleDateChange}
        userTimezone={userTimezone}
      />
    </div>
  );
}