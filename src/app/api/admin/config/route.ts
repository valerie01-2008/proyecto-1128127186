import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';
import { recordAudit } from '@/lib/dataService';

// La UI maneja "HH:MM" pero en BD guardamos la hora como entero (notification_window_*_hour)
function hourFromString(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseInt(value.split(':')[0] ?? '', 10);
    if (!Number.isNaN(n)) return n;
  }
  return fallback;
}
function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

export const GET = withRole(['admin'])(async (_request: NextRequest) => {
  try {
    const config = await sql`
      SELECT
        max_events_per_user,
        email_notifications_enabled,
        notification_window_start_hour,
        notification_window_end_hour,
        max_retry_attempts,
        retry_interval_minutes,
        default_timezone,
        updated_at
      FROM system_config
      ORDER BY created_at ASC
      LIMIT 1
    `;

    if (config.length === 0) {
      return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 });
    }

    const row = config[0];
    return NextResponse.json({
      maxEventsPerUser: row.max_events_per_user ?? 500,
      emailNotificationsEnabled: row.email_notifications_enabled ?? true,
      notificationWindowStart: `${pad2(row.notification_window_start_hour ?? 6)}:00`,
      notificationWindowEnd: `${pad2(row.notification_window_end_hour ?? 22)}:00`,
      maxRetryAttempts: row.max_retry_attempts ?? 3,
      retryIntervalMinutes: row.retry_interval_minutes ?? 2,
      defaultTimezone: row.default_timezone ?? 'America/Bogota',
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

export const PUT = withRole(['admin'])(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();

    const maxEventsPerUser = Number(body.maxEventsPerUser ?? 500);
    const emailNotificationsEnabled = Boolean(body.emailNotificationsEnabled ?? true);
    const startHour = hourFromString(body.notificationWindowStart, 6);
    const endHour = hourFromString(body.notificationWindowEnd, 22);
    const maxRetryAttempts = Number(body.maxRetryAttempts ?? 3);
    const retryIntervalMinutes = Number(body.retryIntervalMinutes ?? 2);

    if (maxRetryAttempts < 0 || retryIntervalMinutes < 0) {
      return NextResponse.json(
        { error: 'Los valores de reintento deben ser positivos' },
        { status: 400 }
      );
    }
    if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
      return NextResponse.json(
        { error: 'La ventana horaria debe estar entre 00 y 23' },
        { status: 400 }
      );
    }
    if (endHour <= startHour) {
      return NextResponse.json(
        { error: 'La hora de fin debe ser posterior a la hora de inicio' },
        { status: 400 }
      );
    }

    // id es UUID — actualizamos todas las filas (debería haber 1).
    await sql`
      UPDATE system_config
      SET
        max_events_per_user = ${maxEventsPerUser},
        email_notifications_enabled = ${emailNotificationsEnabled},
        notification_window_start_hour = ${startHour},
        notification_window_end_hour = ${endHour},
        max_retry_attempts = ${maxRetryAttempts},
        retry_interval_minutes = ${retryIntervalMinutes},
        updated_at = NOW()
    `;

    await recordAudit('update_system_config', userId, {
      maxEventsPerUser,
      emailNotificationsEnabled,
      startHour,
      endHour,
      maxRetryAttempts,
      retryIntervalMinutes,
    });

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada. Los cambios del motor se aplican en el próximo ciclo del cron.',
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
