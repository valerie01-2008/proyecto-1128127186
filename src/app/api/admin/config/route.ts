import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';
import { recordAudit } from '@/lib/dataService';

// GET /api/admin/config - Obtener configuración global (solo admin)
export const GET = withRole(['admin'])(async (_request: NextRequest) => {
  try {
    const config = await sql`
      SELECT
        max_events_per_user,
        email_notifications_enabled,
        notification_window_start,
        notification_window_end,
        max_retry_attempts,
        retry_interval_minutes,
        updated_at
      FROM system_config
      LIMIT 1
    `;

    if (config.length === 0) {
      return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 });
    }

    const row = config[0];
    return NextResponse.json({
      maxEventsPerUser: row.max_events_per_user,
      emailNotificationsEnabled: row.email_notifications_enabled,
      notificationWindowStart: row.notification_window_start,
      notificationWindowEnd: row.notification_window_end,
      maxRetryAttempts: row.max_retry_attempts,
      retryIntervalMinutes: row.retry_interval_minutes,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

// PUT /api/admin/config - Actualizar configuración global (solo admin)
export const PUT = withRole(['admin'])(async (request: NextRequest, userId: string) => {
  try {
    const {
      maxEventsPerUser,
      emailNotificationsEnabled,
      notificationWindowStart,
      notificationWindowEnd,
      maxRetryAttempts,
      retryIntervalMinutes,
    } = await request.json();

    // Validaciones básicas
    if (maxRetryAttempts < 0 || retryIntervalMinutes < 0) {
      return NextResponse.json({ error: 'Los valores de reintento deben ser positivos' }, { status: 400 });
    }

    // Actualizar configuración
    await sql`
      UPDATE system_config
      SET
        max_events_per_user = ${maxEventsPerUser},
        email_notifications_enabled = ${emailNotificationsEnabled},
        notification_window_start = ${notificationWindowStart},
        notification_window_end = ${notificationWindowEnd},
        max_retry_attempts = ${maxRetryAttempts},
        retry_interval_minutes = ${retryIntervalMinutes},
        updated_at = NOW()
      WHERE id = 1
    `;

    // Registrar auditoría
    await recordAudit('update_system_config', userId, {
      maxEventsPerUser,
      emailNotificationsEnabled,
      notificationWindowStart,
      notificationWindowEnd,
      maxRetryAttempts,
      retryIntervalMinutes,
    });

    return NextResponse.json({
      success: true,
      message: 'Los cambios en los parámetros del motor se aplicarán en el próximo ciclo del cron.',
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});