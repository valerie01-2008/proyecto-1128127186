import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';

// GET /api/notifications - Obtener historial de notificaciones
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const global = searchParams.get('global') === 'true';

    let query = sql`
      SELECT
        nl.id,
        nl.reminder_id,
        nl.sent_at,
        nl.status,
        nl.error_detail,
        r.event_id,
        r.anticipation_min,
        r.channel,
        e.title as event_title,
        u.name as user_name,
        u.email as user_email
      FROM notification_log nl
      JOIN reminders r ON nl.reminder_id = r.id
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
    `;

    // Si no es global, filtrar por userId
    if (!global) {
      query = sql`${query} WHERE r.user_id = ${userId}`;
    } else {
      // Verificar que sea admin si global=true
      const user = await sql`SELECT role FROM users WHERE id = ${userId}`;
      if (user.length === 0 || user[0].role !== 'admin') {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
      }
    }

    query = sql`${query} ORDER BY nl.sent_at DESC LIMIT 100`;

    const notifications = await query;

    const formattedNotifications = notifications.map((row: any) => ({
      id: row.id,
      reminderId: row.reminder_id,
      sentAt: row.sent_at,
      status: row.status,
      errorDetail: row.error_detail,
      eventId: row.event_id,
      anticipationMin: row.anticipation_min,
      channel: row.channel,
      eventTitle: global ? row.event_title : undefined,
      userName: global ? row.user_name : undefined,
      userEmail: global ? row.user_email : undefined,
    }));

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});