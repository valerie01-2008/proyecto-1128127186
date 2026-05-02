import { sql } from './supabase';

export interface UserReport {
  period: {
    from: string;
    to: string;
  };
  metrics: {
    eventsCreated: number;
    eventsCompleted: number;
    eventsCancelled: number;
    completionRate: number | null; // (completed / (created - cancelled)) * 100, null if no created
    remindersSent: number;
  };
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  events: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    startAt: string;
    completedAt?: string;
    remindersSent: number;
  }>;
}

export interface GlobalReport {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  totalNotifications: number;
  successfulNotifications: number;
  failedNotifications: number;
  categoryDistribution: Array<{ category: string; count: number }>;
  userActivity: Array<{ user: string; events: number; completed: number }>;
}

/**
 * Construye el reporte del usuario para un período
 */
export async function buildUserReport(userId: string, from: string, to: string): Promise<UserReport> {
  // Eventos en el período
  const eventsResult = await sql`
    SELECT id, title, category, priority, status, start_at, archived_at
    FROM events
    WHERE user_id = ${userId}
      AND start_at >= ${from}
      AND start_at <= ${to}
    ORDER BY start_at DESC
  `;

  const events = eventsResult.map((row: any) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    status: row.status,
    startAt: row.start_at,
    completedAt: row.archived_at,
  }));

  // Notificaciones enviadas en el período
  const notificationsResult = await sql`
    SELECT e.id as event_id, COUNT(n.id) as reminders_sent
    FROM events e
    LEFT JOIN notification_log n ON n.event_id = e.id AND n.status = 'entregada'
    WHERE e.user_id = ${userId}
      AND e.start_at >= ${from}
      AND e.start_at <= ${to}
    GROUP BY e.id
  `;

  const notificationsMap = new Map<string, number>();
  notificationsResult.forEach((row: any) => {
    notificationsMap.set(row.event_id, parseInt(row.reminders_sent));
  });

  // Métricas
  const eventsCreated = events.length;
  const eventsCompleted = events.filter(e => e.status === 'completado').length;
  const eventsCancelled = events.filter(e => e.status === 'cancelado').length;
  const completionRate = eventsCreated > 0 ? ((eventsCompleted / (eventsCreated - eventsCancelled)) * 100) : null;
  const remindersSent = Array.from(notificationsMap.values()).reduce((sum, count) => sum + count, 0);

  // Distribución por categoría
  const categoryMap = new Map<string, number>();
  events.forEach(event => {
    categoryMap.set(event.category, (categoryMap.get(event.category) || 0) + 1);
  });
  const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  return {
    period: { from, to },
    metrics: {
      eventsCreated,
      eventsCompleted,
      eventsCancelled,
      completionRate,
      remindersSent,
    },
    categoryDistribution,
    events: events.map(event => ({
      id: event.id,
      title: event.title,
      category: event.category,
      priority: event.priority,
      status: event.status,
      startAt: event.startAt,
      completedAt: event.completedAt,
      remindersSent: notificationsMap.get(event.id) || 0,
    })),
  };
}

/**
 * Construye el reporte global para admin
 */
export async function buildGlobalReport(): Promise<GlobalReport> {
  // Total de usuarios
  const totalUsersResult = await sql`
    SELECT COUNT(*) as count FROM users
  `;
  const totalUsers = parseInt(totalUsersResult[0].count);

  // Usuarios activos
  const activeUsersResult = await sql`
    SELECT COUNT(*) as count FROM users WHERE active = true
  `;
  const activeUsers = parseInt(activeUsersResult[0].count);

  // Eventos totales
  const totalEventsResult = await sql`
    SELECT COUNT(*) as count FROM events
  `;
  const totalEvents = parseInt(totalEventsResult[0].count);

  // Eventos completados
  const completedEventsResult = await sql`
    SELECT COUNT(*) as count FROM events WHERE status = 'completado'
  `;
  const completedEvents = parseInt(completedEventsResult[0].count);

  // Eventos pendientes
  const pendingEventsResult = await sql`
    SELECT COUNT(*) as count FROM events WHERE status = 'pendiente'
  `;
  const pendingEvents = parseInt(pendingEventsResult[0].count);

  // Notificaciones totales
  const totalNotificationsResult = await sql`
    SELECT COUNT(*) as count FROM notification_log
  `;
  const totalNotifications = parseInt(totalNotificationsResult[0].count);

  // Notificaciones exitosas
  const successfulNotificationsResult = await sql`
    SELECT COUNT(*) as count FROM notification_log WHERE status = 'entregada'
  `;
  const successfulNotifications = parseInt(successfulNotificationsResult[0].count);

  // Notificaciones fallidas
  const failedNotifications = totalNotifications - successfulNotifications;

  // Distribución por categoría
  const categoryResult = await sql`
    SELECT category, COUNT(*) as count
    FROM events
    GROUP BY category
    ORDER BY count DESC
  `;
  const categoryDistribution = categoryResult.map((row: any) => ({
    category: row.category,
    count: parseInt(row.count),
  }));

  // Actividad de usuarios
  const userActivityResult = await sql`
    SELECT
      u.name as user,
      COUNT(e.id) as events,
      COUNT(CASE WHEN e.status = 'completado' THEN 1 END) as completed
    FROM users u
    LEFT JOIN events e ON u.id = e.user_id
    GROUP BY u.id, u.name
    ORDER BY events DESC
    LIMIT 20
  `;
  const userActivity = userActivityResult.map((row: any) => ({
    user: row.user,
    events: parseInt(row.events),
    completed: parseInt(row.completed),
  }));

  return {
    totalUsers,
    activeUsers,
    totalEvents,
    completedEvents,
    pendingEvents,
    totalNotifications,
    successfulNotifications,
    failedNotifications,
    categoryDistribution,
    userActivity,
  };
}

/**
 * Genera CSV del reporte del usuario
 */
export function generateUserReportCSV(report: UserReport): string {
  const headers = ['ID', 'Título', 'Categoría', 'Prioridad', 'Estado', 'Fecha de inicio', 'Fecha completado', 'Recordatorios enviados', 'Tasa de cumplimiento del período'];
  const rows = [
    headers.join(','),
    ...report.events.map(event => [
      event.id,
      `"${event.title.replace(/"/g, '""')}"`,
      event.category,
      event.priority,
      event.status,
      event.startAt,
      event.completedAt || '',
      event.remindersSent.toString(),
      report.metrics.completionRate ? report.metrics.completionRate.toFixed(1) + '%' : 'N/A',
    ].join(',')),
  ];
  return rows.join('\n');
}