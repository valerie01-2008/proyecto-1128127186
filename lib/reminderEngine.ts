import { format, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { sql } from './supabase';
import { sendReminderEmail } from './emailService';
import type { Reminder, SystemConfig } from './types';

interface ReminderWithContext extends Reminder {
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  eventLocation?: string;
  userEmail: string;
  userTimezone: string;
  retryLogId?: string;
  retryCount?: number;
  nextRetryAt?: string;
}

interface ProcessResult {
  processed: number;
  sent: number;
  postponedByWindow: number;
  failed: number;
  retried: number;
}

const DEFAULT_CONFIG: SystemConfig = {
  maxEventsPerUser: 50,
  notificationWindow: {
    startHour: 6,
    endHour: 22,
  },
  defaultTimezone: 'America/Bogota',
};

export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const result = await sql`
      SELECT value
      FROM system_config
      WHERE key = 'settings'
      LIMIT 1
    `;

    if (result.length === 0) {
      return DEFAULT_CONFIG;
    }

    const parsed = result[0].value;
    return {
      maxEventsPerUser: parsed.maxEventsPerUser ?? DEFAULT_CONFIG.maxEventsPerUser,
      notificationWindow: {
        startHour: parsed.notificationWindow?.startHour ?? DEFAULT_CONFIG.notificationWindow.startHour,
        endHour: parsed.notificationWindow?.endHour ?? DEFAULT_CONFIG.notificationWindow.endHour,
      },
      defaultTimezone: parsed.defaultTimezone ?? DEFAULT_CONFIG.defaultTimezone,
    };
  } catch (error) {
    console.error('Error loading system_config:', error);
    return DEFAULT_CONFIG;
  }
}

function mapReminderRow(row: any): Reminder {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    anticipationMin: row.anticipation_min,
    channel: row.channel,
    customMessage: row.custom_message ?? undefined,
    fireAt: row.fire_at,
    status: row.status,
    snoozeCount: row.snooze_count,
    createdAt: row.created_at,
  };
}

function parseNotificationWindowText(minutes: number): string {
  if (minutes === 1440) {
    return 'mañana';
  }

  if (minutes < 60) {
    return `en ${minutes} minutos`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return hours === 1 ? 'en 1 hora' : `en ${hours} horas`;
  }

  const minutesText = remainder === 1 ? '1 minuto' : `${remainder} minutos`;
  return `en ${hours} hora${hours > 1 ? 's' : ''} y ${minutesText}`;
}

export function buildEmailContent({
  eventTitle,
  anticipationMin,
  eventStartAt,
  eventLocation,
  customMessage,
  userTimezone,
}: {
  eventTitle: string;
  anticipationMin: number;
  eventStartAt: string;
  eventLocation?: string;
  customMessage?: string;
  userTimezone: string;
}): { subject: string; html: string } {
  const eventDate = new Date(eventStartAt);
  const localTime = format(toZonedTime(eventDate, userTimezone), "eeee, d 'de' MMMM 'a las' HH:mm", {
    timeZone: userTimezone,
  });
  const anticipationText = parseNotificationWindowText(anticipationMin);
  const subject = `AgendaPro: Recordatorio ${anticipationText} de «${eventTitle}»`;
  const bodyMessage = customMessage
    ? customMessage
    : `Tu evento ${eventTitle} comenzará ${anticipationText} a las ${format(
        toZonedTime(eventDate, userTimezone),
        'HH:mm',
        { timeZone: userTimezone }
      )}.`;

  const locationHtml = eventLocation
    ? `<tr><td style="padding: 12px 0; color: #334155; font-size: 15px;">Lugar: <strong>${eventLocation}</strong></td></tr>`
    : '';

  const html = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:24px; font-family:Arial, sans-serif; color:#0f172a;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden;">
            <tr>
              <td style="padding:24px; background:#6366f1; color:#ffffff; text-align:center; font-size:20px; font-weight:700;">AgendaPro</td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 16px; font-size:22px; color:#111827;">Recordatorio de evento</h1>
                <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#475569;">
                  ${bodyMessage}
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                  <tr>
                    <td style="padding:16px; color:#0f172a; font-size:15px;">
                      <strong>Evento</strong><br />${eventTitle}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px; color:#0f172a; font-size:15px;">
                      <strong>Hora</strong><br />${localTime}
                    </td>
                  </tr>
                  ${locationHtml}
                </table>
                <p style="margin:24px 0 0; font-size:14px; color:#64748b;">AgendaPro te ayuda a no olvidar nada. Si necesitas cambiar algo, hazlo desde tu agenda.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 24px; text-align:center; font-size:12px; color:#94a3b8;">
                AgendaPro • Correo transaccional automático
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return { subject, html };
}

function getNextValidWindow(fireAt: Date, timeZone: string, windowStart: number, windowEnd: number): Date {
  const local = toZonedTime(fireAt, timeZone);
  const hour = local.getHours() + local.getMinutes() / 60;
  const candidate = new Date(local);

  if (hour < windowStart) {
    candidate.setHours(windowStart, 0, 0, 0);
  } else if (hour >= windowEnd) {
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(windowStart, 0, 0, 0);
  }

  return fromZonedTime(candidate, timeZone);
}

function isInNotificationWindow(fireAt: Date, timeZone: string, windowStart: number, windowEnd: number): boolean {
  const local = toZonedTime(fireAt, timeZone);
  const hour = local.getHours() + local.getMinutes() / 60;
  return hour >= windowStart && hour < windowEnd;
}

async function insertNotificationLog(params: {
  reminderId: string;
  eventId: string;
  userId: string;
  channel: 'email';
  status: 'entregada' | 'reintentando' | 'no_entregada';
  retryCount: number;
  nextRetryAt?: Date | null;
  errorDetail?: string | null;
  messageSent?: string | null;
}) {
  const result = await sql`
    INSERT INTO notification_log (reminder_id, event_id, user_id, channel, status, retry_count, next_retry_at, error_detail, message_sent)
    VALUES (
      ${params.reminderId},
      ${params.eventId},
      ${params.userId},
      ${params.channel},
      ${params.status},
      ${params.retryCount},
      ${params.nextRetryAt ? params.nextRetryAt.toISOString() : null},
      ${params.errorDetail || null},
      ${params.messageSent || null}
    )
    RETURNING id
  `;

  return result[0];
}

async function updateNotificationLog(logId: string, updates: {
  status?: 'entregada' | 'reintentando' | 'no_entregada';
  sentAt?: Date | null;
  retryCount?: number;
  nextRetryAt?: Date | null;
  errorDetail?: string | null;
  messageSent?: string | null;
}) {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(updates.status);
  }
  if (updates.sentAt !== undefined) {
    fields.push(`sent_at = $${idx++}`);
    values.push(updates.sentAt ? updates.sentAt.toISOString() : null);
  }
  if (updates.retryCount !== undefined) {
    fields.push(`retry_count = $${idx++}`);
    values.push(updates.retryCount);
  }
  if (updates.nextRetryAt !== undefined) {
    fields.push(`next_retry_at = $${idx++}`);
    values.push(updates.nextRetryAt ? updates.nextRetryAt.toISOString() : null);
  }
  if (updates.errorDetail !== undefined) {
    fields.push(`error_detail = $${idx++}`);
    values.push(updates.errorDetail);
  }
  if (updates.messageSent !== undefined) {
    fields.push(`message_sent = $${idx++}`);
    values.push(updates.messageSent);
  }

  if (fields.length === 0) {
    return null;
  }

  const query = `UPDATE notification_log SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id`;
  values.push(logId);

  const result = await sql.unsafe(query, values);
  return result[0];
}

async function getLatestRetryLog(reminderId: string) {
  const result = await sql`
    SELECT id, retry_count, next_retry_at, status, error_detail
    FROM notification_log
    WHERE reminder_id = ${reminderId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return result.length > 0 ? result[0] : null;
}

export async function selectPendingReminders(): Promise<ReminderWithContext[]> {
  const rows = await sql`
    SELECT r.*, e.title AS event_title, e.start_at AS event_start_at, e.location AS event_location,
           u.email AS user_email, u.timezone AS user_timezone
    FROM reminders r
    JOIN events e ON e.id = r.event_id
    JOIN users u ON u.id = r.user_id
    WHERE r.fire_at <= NOW() AND r.status IN ('pendiente', 'pendiente_horario')
  `;

  return rows.map((row: any) => ({
    ...mapReminderRow(row),
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventStartAt: row.event_start_at,
    eventLocation: row.event_location,
    userEmail: row.user_email,
    userTimezone: row.user_timezone,
  }));
}

export async function selectPendingRetries(): Promise<ReminderWithContext[]> {
  const rows = await sql`
    SELECT r.*, e.title AS event_title, e.start_at AS event_start_at, e.location AS event_location,
           u.email AS user_email, u.timezone AS user_timezone,
           n.id AS retry_log_id, n.retry_count, n.next_retry_at
    FROM reminders r
    JOIN events e ON e.id = r.event_id
    JOIN users u ON u.id = r.user_id
    JOIN notification_log n ON n.id = (
      SELECT id FROM notification_log WHERE reminder_id = r.id ORDER BY created_at DESC LIMIT 1
    )
    WHERE n.status = 'reintentando' AND n.next_retry_at <= NOW()
  `;

  return rows.map((row: any) => ({
    ...mapReminderRow(row),
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventStartAt: row.event_start_at,
    eventLocation: row.event_location,
    userEmail: row.user_email,
    userTimezone: row.user_timezone,
    retryLogId: row.retry_log_id,
    retryCount: row.retry_count,
    nextRetryAt: row.next_retry_at,
  }));
}

async function markReminderSent(reminder: ReminderWithContext, messageSent: string | null) {
  const latestLog = reminder.retryLogId
    ? { id: reminder.retryLogId, retryCount: reminder.retryCount ?? 0 }
    : await getLatestRetryLog(reminder.id);

  if (latestLog && reminder.retryLogId) {
    await updateNotificationLog(latestLog.id, {
      status: 'entregada',
      sentAt: new Date(),
      messageSent,
      nextRetryAt: null,
      errorDetail: null,
      retryCount: latestLog.retryCount,
    });
  } else if (latestLog && latestLog.status === 'reintentando') {
    await updateNotificationLog(latestLog.id, {
      status: 'entregada',
      sentAt: new Date(),
      messageSent,
      nextRetryAt: null,
      errorDetail: null,
      retryCount: latestLog.retry_count,
    });
  } else {
    await insertNotificationLog({
      reminderId: reminder.id,
      eventId: reminder.eventId,
      userId: reminder.userId,
      channel: 'email',
      status: 'entregada',
      retryCount: 0,
      nextRetryAt: null,
      errorDetail: null,
      messageSent,
    });
  }

  await sql`
    UPDATE reminders
    SET status = 'enviado'
    WHERE id = ${reminder.id}
  `;
}

async function handleReminderFailure(reminder: ReminderWithContext, errorMessage: string, maxAttempts: number) {
  const now = new Date();
  const nextAttempt = new Date(now.getTime() + 2 * 60 * 1000);

  const latestLog = reminder.retryLogId
    ? { id: reminder.retryLogId, retryCount: reminder.retryCount ?? 0 }
    : await getLatestRetryLog(reminder.id);

  if (latestLog) {
    const currentCount = latestLog.retryCount ?? 0;
    const nextCount = currentCount + 1;

    if (nextCount >= maxAttempts) {
      await updateNotificationLog(latestLog.id, {
        status: 'no_entregada',
        errorDetail: errorMessage,
        retryCount: nextCount,
        nextRetryAt: null,
      });
      await sql`
        UPDATE reminders
        SET status = 'no_entregada', fire_at = ${now.toISOString()}
        WHERE id = ${reminder.id}
      `;
      return { failed: true, retried: true };
    }

    await updateNotificationLog(latestLog.id, {
      status: 'reintentando',
      errorDetail: errorMessage,
      retryCount: nextCount,
      nextRetryAt: nextAttempt,
      messageSent: null,
    });
  } else {
    await insertNotificationLog({
      reminderId: reminder.id,
      eventId: reminder.eventId,
      userId: reminder.userId,
      channel: 'email',
      status: 'reintentando',
      retryCount: 1,
      nextRetryAt: nextAttempt,
      errorDetail: errorMessage,
      messageSent: null,
    });
  }

  await sql`
    UPDATE reminders
    SET fire_at = ${nextAttempt.toISOString()}
    WHERE id = ${reminder.id}
  `;

  return { failed: false, retried: true };
}

export async function processReminder(reminder: ReminderWithContext, config: SystemConfig) {
  const fireAt = new Date(reminder.fireAt);
  const inWindow = isInNotificationWindow(fireAt, reminder.userTimezone, config.notificationWindow.startHour, config.notificationWindow.endHour);

  if (!inWindow) {
    const nextFireAt = getNextValidWindow(fireAt, reminder.userTimezone, config.notificationWindow.startHour, config.notificationWindow.endHour);
    await sql`
      UPDATE reminders
      SET fire_at = ${nextFireAt.toISOString()}, status = 'pendiente_horario'
      WHERE id = ${reminder.id}
    `;
    return { postponed: true, sent: false, failed: false, retried: false };
  }

  const { subject, html } = buildEmailContent({
    eventTitle: reminder.eventTitle,
    anticipationMin: reminder.anticipationMin,
    eventStartAt: reminder.eventStartAt,
    eventLocation: reminder.eventLocation,
    customMessage: reminder.customMessage,
    userTimezone: reminder.userTimezone,
  });

  const result = await sendReminderEmail({
    to: reminder.userEmail,
    subject,
    html,
  });

  if (result.success) {
    await markReminderSent(reminder, html);
    return { postponed: false, sent: true, failed: false, retried: Boolean(reminder.retryLogId) };
  }

  const failure = await handleReminderFailure(reminder, result.error ?? 'Error de envío', config.maxEventsPerUser);
  return {
    postponed: false,
    sent: false,
    failed: failure.failed,
    retried: failure.retried,
  };
}

export async function recalculateRemindersForEvent(eventId: string, newStartAt: Date) {
  const rows = await sql`
    SELECT id, anticipation_min, status
    FROM reminders
    WHERE event_id = ${eventId}
  `;

  const now = new Date();

  for (const row of rows) {
    const fireAt = new Date(newStartAt.getTime() - row.anticipation_min * 60 * 1000);
    const status = fireAt <= now ? 'enviado' : 'pendiente';

    await sql`
      UPDATE reminders
      SET fire_at = ${fireAt.toISOString()}, status = ${status}
      WHERE id = ${row.id}
    `;
  }
}

export async function processPendingReminders() {
  const config = await getSystemConfig();
  const pending = await selectPendingReminders();
  const retries = await selectPendingRetries();

  const summary: ProcessResult = {
    processed: 0,
    sent: 0,
    postponedByWindow: 0,
    failed: 0,
    retried: 0,
  };

  const processedReminders = new Set<string>();

  for (const reminder of pending) {
    if (processedReminders.has(reminder.id)) continue;
    processedReminders.add(reminder.id);
    summary.processed += 1;
    const result = await processReminder(reminder, config);
    if (result.sent) summary.sent += 1;
    if (result.postponed) summary.postponedByWindow += 1;
    if (result.failed) summary.failed += 1;
    if (result.retried) summary.retried += 1;
  }

  for (const reminder of retries) {
    if (processedReminders.has(reminder.id)) continue;
    processedReminders.add(reminder.id);
    summary.processed += 1;
    const result = await processReminder(reminder, config);
    if (result.sent) summary.sent += 1;
    if (result.postponed) summary.postponedByWindow += 1;
    if (result.failed) summary.failed += 1;
    if (result.retried) summary.retried += 1;
  }

  return summary;
}
