import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';
import type { NotificationLog } from '@/lib/types';

// GET /api/notifications - Obtener historial de notificaciones
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const global = searchParams.get('global') === 'true';

    let query;

    // Si no es global, filtrar por userId
    if (!global) {
      query = sql`
        SELECT
          nl.id,
          nl.reminder_id,
          nl.event_id,
          nl.user_id,
          nl.channel,
          nl.sent_at,
          nl.status,
          nl.retry_count,
          nl.next_retry_at,
          nl.error_detail,
          nl.message_sent,
          nl.created_at
        FROM notification_logs nl
        WHERE nl.user_id = ${userId}
        ORDER BY nl.sent_at DESC LIMIT 100
      `;
    } else {
      // Verificar que sea admin si global=true
      const user = await sql`SELECT role FROM users WHERE id = ${userId}`;
      if (user.length === 0 || user[0].role !== 'admin') {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
      }

      query = sql`
        SELECT
          nl.id,
          nl.reminder_id,
          nl.event_id,
          nl.user_id,
          nl.channel,
          nl.sent_at,
          nl.status,
          nl.retry_count,
          nl.next_retry_at,
          nl.error_detail,
          nl.message_sent,
          nl.created_at
        FROM notification_logs nl
        ORDER BY nl.sent_at DESC LIMIT 100
      `;
    }

    const notifications = await query;

    // Mapear a NotificationLog correctamente
    const formattedNotifications: NotificationLog[] = notifications.map((row: any) => ({
      id: row.id,
      reminderId: row.reminder_id,
      eventId: row.event_id,
      userId: row.user_id,
      channel: row.channel,
      sentAt: row.sent_at,
      status: row.status,
      retryCount: row.retry_count,
      nextRetryAt: row.next_retry_at,
      errorDetail: row.error_detail,
      messageSent: row.message_sent,
      createdAt: row.created_at,
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});