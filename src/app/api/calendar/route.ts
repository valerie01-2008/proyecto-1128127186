import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  category: string;
  priority: string;
  status: string;
}

export const GET = withAuth(async (_request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(_request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Parámetros from y to requeridos' },
        { status: 400 }
      );
    }

    // Query optimizada para calendario - solo campos visuales
    const result = await sql`
      SELECT id, title, start_at, end_at, category, priority, status
      FROM events
      WHERE user_id = ${userId}
        AND status = 'pendiente'
        AND start_at >= ${from}
        AND start_at <= ${to}
      ORDER BY start_at ASC
    `;

    const events: CalendarEvent[] = result.map((row: any) => ({
      id: row.id,
      title: row.title,
      start_at: row.start_at,
      end_at: row.end_at,
      category: row.category,
      priority: row.priority,
      status: row.status,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});