import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';

// GET /api/notifications - Obtener historial de notificaciones
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const global = searchParams.get('global') === 'true';

    // Verificar permisos si es global
    if (global) {
      const user = await sql`SELECT role FROM users WHERE id = ${userId}`;
      if (user.length === 0 || user[0].role !== 'admin') {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
      }
    }

    // Query simple y directa
    let query = `
      SELECT
        nl.id,
        nl.reminder_id,
        nl.sent_at,
        nl.status,
        nl.error_detail,
        nl.user_id,
        nl.channel
      FROM notification_log nl
    `;

    if (!global) {
      query += ` WHERE nl.user_id = '${userId}'`;
    }

    query += ` ORDER BY nl.sent_at DESC LIMIT 100`;

    const notifications = await sql.unsafe(query);

    const formattedNotifications = (notifications as any[]).map((row: any) => ({
      id: row.id,
      reminderId: row.reminder_id,
      sentAt: row.sent_at,
      status: row.status,
      errorDetail: row.error_detail,
      channel: row.channel,
    }));

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: (error as any).message }, { status: 500 });
  }
});