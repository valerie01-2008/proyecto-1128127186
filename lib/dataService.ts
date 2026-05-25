import fs from "fs";
import path from "path";
import { HomeDataSchema, AppConfigSchema, CreateEventRequestSchema, UpdateEventRequestSchema, CreateReminderRequestSchema } from "./validators";
import type { HomeData, AppConfig, Event, EventWithDetails, EventAttachment, CreateEventRequest, CreateReminderRequest, NotificationLog, Reminder, UpdateEventRequest } from "./types";
import { sql } from "./supabase";
import { detectOverlap } from "./eventService";
import { del, put } from "@vercel/blob";
import { recalculateRemindersForEvent } from "./reminderEngine";

/**
 * Lee un archivo JSON desde la carpeta /data y lo tipifica.
 * Solo ejecutable en el servidor (Server Components, API Routes).
 */
export function readJsonData<T>(relativePath: string): T {
  const fullPath = path.join(process.cwd(), "data", relativePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Archivo de datos no encontrado: ${relativePath}`);
  }

  const raw = fs.readFileSync(fullPath, "utf-8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Error al parsear JSON: ${relativePath}`);
  }
}

/**
 * Lee y valida los datos de la página Home desde home.json
 */
export function readHomeData(): HomeData {
  const data = readJsonData("home.json");
  return HomeDataSchema.parse(data);
}

/**
 * Lee y valida la configuración de la aplicación desde config.json
 */
export function readAppConfig(): AppConfig {
  const data = readJsonData("config.json");
  return AppConfigSchema.parse(data);
}

/**
 * Obtiene el modo del sistema (seed o live)
 */
export async function getSystemMode(): Promise<'seed' | 'live'> {
  // 'live' cuando Supabase está configurado Y las migrations principales están aplicadas.
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_PRISMA_URL) {
    return 'seed';
  }
  try {
    const result = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count
        FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('users', 'events', 'reminders')
    `;
    return Number(result[0]?.count ?? 0) >= 3 ? 'live' : 'seed';
  } catch {
    return 'seed';
  }
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(id: string): Promise<any> {
  const result = await sql`
    SELECT id, name, email, password_hash, role, timezone, login_attempts, locked_until, active, created_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    timezone: row.timezone,
    loginAttempts: row.login_attempts,
    lockedUntil: row.locked_until,
    active: row.active,
    createdAt: row.created_at,
  };
}

/**
 * Registra una operación en la auditoría
 */
export async function recordAudit(operation: string, userId?: string, details?: any): Promise<void> {
  // TODO: Implementar auditoría real
  console.log('Audit:', { operation, userId, details, timestamp: new Date() });
}

// ========== FUNCIONES DE EVENTOS ==========

/**
 * Obtiene todos los eventos del usuario con filtros opcionales
 */
export async function getEvents(
  userId: string,
  filters?: {
    status?: 'pendiente' | 'completado' | 'cancelado';
    category?: string;
    priority?: 'normal' | 'alta' | 'urgente';
    search?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Event[]> {
  let query = sql`
    SELECT id, user_id, title, start_at, end_at, location, description,
           category, priority, status, is_synced, archived_at, created_at, updated_at
    FROM events
    WHERE user_id = ${userId}
  `;

  if (filters?.status) {
    query = sql`${query} AND status = ${filters.status}`;
  }

  if (filters?.category) {
    query = sql`${query} AND category = ${filters.category}`;
  }

  if (filters?.priority) {
    query = sql`${query} AND priority = ${filters.priority}`;
  }

  if (filters?.search) {
    query = sql`${query} AND (title ILIKE ${`%${filters.search}%`} OR description ILIKE ${`%${filters.search}%`})`;
  }

  if (filters?.from) {
    query = sql`${query} AND start_at >= ${filters.from}`;
  }

  if (filters?.to) {
    query = sql`${query} AND start_at <= ${filters.to}`;
  }

  query = sql`${query} ORDER BY start_at DESC`;

  if (filters?.limit) {
    query = sql`${query} LIMIT ${filters.limit}`;
  }

  if (filters?.offset) {
    query = sql`${query} OFFSET ${filters.offset}`;
  }

  const result = await query;
  return result.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at,
    location: row.location,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    isSynced: row.is_synced,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Obtiene estadísticas de eventos para admin (sin contenido privado)
 */
export async function getEventStatsForAdmin(
  filters?: {
    userId?: string;
    status?: 'pendiente' | 'completado' | 'cancelado';
    category?: string;
    priority?: 'normal' | 'alta' | 'urgente';
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Array<{
  id: string;
  userId: string;
  startAt: string;
  endAt?: string;
  category: string;
  priority: 'normal' | 'alta' | 'urgente';
  status: 'pendiente' | 'completado' | 'cancelado';
  createdAt: string;
}>> {
  let query = sql`
    SELECT id, user_id, start_at, end_at, category, priority, status, created_at
    FROM events
    WHERE 1=1
  `;

  if (filters?.userId) {
    query = sql`${query} AND user_id = ${filters.userId}`;
  }

  if (filters?.status) {
    query = sql`${query} AND status = ${filters.status}`;
  }

  if (filters?.category) {
    query = sql`${query} AND category = ${filters.category}`;
  }

  if (filters?.priority) {
    query = sql`${query} AND priority = ${filters.priority}`;
  }

  if (filters?.from) {
    query = sql`${query} AND start_at >= ${filters.from}`;
  }

  if (filters?.to) {
    query = sql`${query} AND start_at <= ${filters.to}`;
  }

  query = sql`${query} ORDER BY created_at DESC`;

  if (filters?.limit) {
    query = sql`${query} LIMIT ${filters.limit}`;
  }

  if (filters?.offset) {
    query = sql`${query} OFFSET ${filters.offset}`;
  }

  const result = await query;
  return result.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    startAt: row.start_at,
    endAt: row.end_at,
    category: row.category,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
  }));
}

/**
 * Obtiene un evento específico con todos sus detalles
 */
export async function getEventById(eventId: string, userId: string): Promise<EventWithDetails | null> {
  const eventResult = await sql`
    SELECT id, user_id, title, start_at, end_at, location, description,
           category, priority, status, is_synced, archived_at, created_at, updated_at
    FROM events
    WHERE id = ${eventId} AND user_id = ${userId}
  `;

  if (eventResult.length === 0) {
    return null;
  }

  const eventRow = eventResult[0];
  const event: Event = {
    id: eventRow.id,
    userId: eventRow.user_id,
    title: eventRow.title,
    startAt: eventRow.start_at,
    endAt: eventRow.end_at,
    location: eventRow.location,
    description: eventRow.description,
    category: eventRow.category,
    priority: eventRow.priority,
    status: eventRow.status,
    isSynced: eventRow.is_synced,
    archivedAt: eventRow.archived_at,
    createdAt: eventRow.created_at,
    updatedAt: eventRow.updated_at,
  };

  const attachmentsResult = await sql`
    SELECT id, event_id, filename, blob_path, file_size, content_type, created_at
    FROM event_attachments
    WHERE event_id = ${eventId}
    ORDER BY created_at DESC
  `;

  const attachments: EventAttachment[] = attachmentsResult.map((row: any) => ({
    id: row.id,
    eventId: row.event_id,
    filename: row.filename,
    blobPath: row.blob_path,
    fileSize: row.file_size,
    contentType: row.content_type,
    createdAt: row.created_at,
  }));

  const reminders = await getReminders(eventId, userId);
  const notificationHistory = await getNotificationHistory(eventId, userId);

  return {
    ...event,
    attachments,
    reminders,
    notificationHistory,
  };
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

function mapNotificationLogRow(row: any): NotificationLog {
  return {
    id: row.id,
    reminderId: row.reminder_id,
    eventId: row.event_id,
    userId: row.user_id,
    channel: row.channel,
    sentAt: row.sent_at,
    status: row.status,
    retryCount: row.retry_count,
    nextRetryAt: row.next_retry_at,
    errorDetail: row.error_detail ?? undefined,
    messageSent: row.message_sent ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getReminders(eventId: string, userId: string): Promise<Reminder[]> {
  const result = await sql`
    SELECT id, event_id, user_id, anticipation_min, channel, custom_message, fire_at, status, snooze_count, created_at
    FROM reminders
    WHERE event_id = ${eventId} AND user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return result.map((row: any) => mapReminderRow(row));
}

export async function getNotificationHistory(eventId: string, userId: string): Promise<NotificationLog[]> {
  const result = await sql`
    SELECT id, reminder_id, event_id, user_id, channel, sent_at, status, retry_count, next_retry_at, error_detail, message_sent, created_at
    FROM notification_log
    WHERE event_id = ${eventId} AND user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return result.map((row: any) => mapNotificationLogRow(row));
}


/**
 * Crea un nuevo evento (verifica cuota RN-15 y solapamiento RN-07)
 */
export async function createEvent(userId: string, data: CreateEventRequest): Promise<Event> {
  // Validar datos
  const validatedData = CreateEventRequestSchema.parse(data);

  // Verificar cuota de eventos activos (RN-15)
  const activeCount = await getActiveEventCount(userId);
  if (activeCount >= 50) { // Asumiendo cuota máxima de 50 eventos activos
    throw new Error('Has alcanzado el límite máximo de 50 eventos activos');
  }

  // Verificar solapamiento (RN-07)
  const startAt = new Date(validatedData.startAt);
  const endAt = validatedData.endAt ? new Date(validatedData.endAt) : null;
  const overlaps = await detectOverlap(userId, startAt, endAt);

  if (overlaps.length > 0) {
    throw new Error(`El evento se solapa con: ${overlaps.map(e => e.title).join(', ')}`);
  }

  // Crear evento
  const result = await sql`
    INSERT INTO events (user_id, title, start_at, end_at, location, description, category, priority)
    VALUES (${userId}, ${validatedData.title}, ${startAt.toISOString()}, ${endAt?.toISOString() || null}, ${validatedData.location || null}, ${validatedData.description || null}, ${validatedData.category}, ${validatedData.priority})
    RETURNING id, user_id, title, start_at, end_at, location, description, category, priority, status, is_synced, archived_at, created_at, updated_at
  `;

  const row = result[0];
  const event = {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at,
    location: row.location,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    isSynced: row.is_synced,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (validatedData.reminders?.length) {
    for (const reminder of validatedData.reminders) {
      await createReminder(event.id, userId, reminder);
    }
  }

  return event;
}

/**
 * Actualiza un evento existente
 */
export async function updateEvent(eventId: string, userId: string, data: UpdateEventRequest): Promise<Event | null> {
  // Validar datos
  const validatedData = UpdateEventRequestSchema.parse(data);

  // Verificar que el evento existe y pertenece al usuario
  const existing = await getEventById(eventId, userId);
  if (!existing) {
    return null;
  }

  // Si se actualiza la fecha/hora, verificar solapamiento
  let overlaps: any[] = [];
  if (validatedData.startAt || validatedData.endAt) {
    const startAt = validatedData.startAt ? new Date(validatedData.startAt) : new Date(existing.startAt);
    const endAt = validatedData.endAt ? new Date(validatedData.endAt) : (existing.endAt ? new Date(existing.endAt) : null);
    overlaps = await detectOverlap(userId, startAt, endAt, eventId);
  }

  if (overlaps.length > 0) {
    throw new Error(`El evento se solapa con: ${overlaps.map(e => e.title).join(', ')}`);
  }

  // Actualizar evento
  const updateFields: any = {};
  const updateValues: any[] = [];
  let paramIndex = 1;

  if (validatedData.title !== undefined) {
    updateFields.title = `$${paramIndex++}`;
    updateValues.push(validatedData.title);
  }
  if (validatedData.startAt !== undefined) {
    updateFields.start_at = `$${paramIndex++}`;
    updateValues.push(new Date(validatedData.startAt).toISOString());
  }
  if (validatedData.endAt !== undefined) {
    updateFields.end_at = `$${paramIndex++}`;
    updateValues.push(validatedData.endAt ? new Date(validatedData.endAt).toISOString() : null);
  }
  if (validatedData.location !== undefined) {
    updateFields.location = `$${paramIndex++}`;
    updateValues.push(validatedData.location);
  }
  if (validatedData.description !== undefined) {
    updateFields.description = `$${paramIndex++}`;
    updateValues.push(validatedData.description);
  }
  if (validatedData.category !== undefined) {
    updateFields.category = `$${paramIndex++}`;
    updateValues.push(validatedData.category);
  }
  if (validatedData.priority !== undefined) {
    updateFields.priority = `$${paramIndex++}`;
    updateValues.push(validatedData.priority);
  }
  if (validatedData.status !== undefined) {
    updateFields.status = `$${paramIndex++}`;
    updateValues.push(validatedData.status);
  }

  updateFields.updated_at = `NOW()`;

  const setClause = Object.keys(updateFields).map(key => `${key} = ${updateFields[key]}`).join(', ');

  const query = `UPDATE events SET ${setClause} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING id, user_id, title, start_at, end_at, location, description, category, priority, status, is_synced, archived_at, created_at, updated_at`;
  updateValues.push(eventId, userId);

  const result = await sql.unsafe(query, updateValues);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  const updatedEvent = {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at,
    location: row.location,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    isSynced: row.is_synced,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (validatedData.startAt) {
    await recalculateRemindersForEvent(eventId, new Date(updatedEvent.startAt));
  }

  return updatedEvent;
}

/**
 * Elimina un evento y todos sus adjuntos (RN-06)
 */
export async function deleteEvent(eventId: string, userId: string): Promise<boolean> {
  // Verificar que el evento existe y pertenece al usuario
  const existing = await getEventById(eventId, userId);
  if (!existing) {
    return false;
  }

  // Eliminar adjuntos de Blob primero (RN-06)
  for (const attachment of existing.attachments) {
    try {
      await del(attachment.blobPath);
    } catch (error) {
      console.error(`Error eliminando adjunto ${attachment.id}:`, error);
      // Continuar con la eliminación del evento aunque falle la eliminación del adjunto
    }
  }

  // Eliminar el evento (los adjuntos en BD se eliminan en cascada)
  const result = await sql`
    DELETE FROM events
    WHERE id = ${eventId} AND user_id = ${userId}
  `;

  return result.length > 0;
}

/**
 * Completa un evento (marca archived_at = NOW() — RN-09)
 */
export async function completeEvent(eventId: string, userId: string): Promise<Event | null> {
  const result = await sql`
    UPDATE events
    SET status = 'completado', archived_at = NOW(), updated_at = NOW()
    WHERE id = ${eventId} AND user_id = ${userId} AND status = 'pendiente'
    RETURNING id, user_id, title, start_at, end_at, location, description, category, priority, status, is_synced, archived_at, created_at, updated_at
  `;

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at,
    location: row.location,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    isSynced: row.is_synced,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Obtiene el conteo de eventos activos del usuario
 */
export async function getActiveEventCount(userId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM events
    WHERE user_id = ${userId} AND status = 'pendiente'
  `;

  return parseInt(result[0].count);
}

export async function createReminder(eventId: string, userId: string, data: CreateReminderRequest): Promise<Reminder> {
  const validatedData = CreateReminderRequestSchema.parse(data);

  const event = await getEventById(eventId, userId);
  if (!event) {
    throw new Error('Evento no encontrado');
  }

  const countResult = await sql`
    SELECT COUNT(*) as count
    FROM reminders
    WHERE event_id = ${eventId}
  `;

  if (parseInt(countResult[0].count) >= 5) {
    throw new Error('Máximo 5 recordatorios por evento');
  }

  const fireAt = new Date(new Date(event.startAt).getTime() - validatedData.anticipationMin * 60 * 1000);
  const status = fireAt <= new Date() ? 'enviado' : 'pendiente';

  const result = await sql`
    INSERT INTO reminders (event_id, user_id, anticipation_min, channel, custom_message, fire_at, status)
    VALUES (${eventId}, ${userId}, ${validatedData.anticipationMin}, ${validatedData.channel}, ${validatedData.customMessage || null}, ${fireAt.toISOString()}, ${status})
    RETURNING id, event_id, user_id, anticipation_min, channel, custom_message, fire_at, status, snooze_count, created_at
  `;

  return mapReminderRow(result[0]);
}

export async function updateReminder(reminderId: string, userId: string, data: Partial<CreateReminderRequest>): Promise<Reminder | null> {
  const reminderResult = await sql`
    SELECT r.*, e.start_at
    FROM reminders r
    JOIN events e ON e.id = r.event_id
    WHERE r.id = ${reminderId} AND r.user_id = ${userId}
    LIMIT 1
  `;

  if (reminderResult.length === 0) {
    return null;
  }

  const current = mapReminderRow(reminderResult[0]);
  const startAt = new Date(reminderResult[0].start_at);
  let fireAt = new Date(current.fireAt);
  let status = current.status;

  if (data.anticipationMin !== undefined) {
    const validated = CreateReminderRequestSchema.parse({
      anticipationMin: data.anticipationMin,
      channel: current.channel,
      customMessage: data.customMessage ?? current.customMessage,
    });

    fireAt = new Date(startAt.getTime() - validated.anticipationMin * 60 * 1000);
    status = fireAt <= new Date() ? 'enviado' : 'pendiente';
  }

  const result = await sql`
    UPDATE reminders
    SET anticipation_min = ${data.anticipationMin ?? current.anticipationMin},
        custom_message = ${(data.customMessage ?? current.customMessage) || null},
        fire_at = ${fireAt.toISOString()},
        status = ${status}
    WHERE id = ${reminderId} AND user_id = ${userId}
    RETURNING id, event_id, user_id, anticipation_min, channel, custom_message, fire_at, status, snooze_count, created_at
  `;

  return result.length > 0 ? mapReminderRow(result[0]) : null;
}

export async function deleteReminder(reminderId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM reminders
    WHERE id = ${reminderId} AND user_id = ${userId}
  `;

  return result.length > 0;
}

export async function snoozeReminder(reminderId: string, userId: string, minutes: number): Promise<Reminder | null> {
  const reminderResult = await sql`
    SELECT r.id, r.status, r.event_id, e.start_at
    FROM reminders r
    JOIN events e ON e.id = r.event_id
    WHERE r.id = ${reminderId} AND r.user_id = ${userId}
    LIMIT 1
  `;

  if (reminderResult.length === 0) {
    return null;
  }

  const reminderRow = reminderResult[0];
  const eventStart = new Date(reminderRow.start_at);
  const now = new Date();

  if (eventStart <= now) {
    const error = new Error('No se puede posponer un recordatorio para un evento que ya comenzó');
    (error as any).status = 409;
    throw error;
  }

  if (reminderRow.status !== 'enviado') {
    throw new Error('Solo se puede posponer un recordatorio que ya fue enviado');
  }

  const fireAt = new Date(now.getTime() + minutes * 60 * 1000);

  const updated = await sql`
    UPDATE reminders
    SET fire_at = ${fireAt.toISOString()}, status = 'pendiente', snooze_count = snooze_count + 1
    WHERE id = ${reminderId} AND user_id = ${userId}
    RETURNING id, event_id, user_id, anticipation_min, channel, custom_message, fire_at, status, snooze_count, created_at
  `;

  return updated.length > 0 ? mapReminderRow(updated[0]) : null;
}

export async function getNotificationHistoryForUser(userId: string): Promise<NotificationLog[]> {
  const result = await sql`
    SELECT id, reminder_id, event_id, user_id, channel, sent_at, status, retry_count, next_retry_at, error_detail, message_sent, created_at
    FROM notification_log
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return result.map((row: any) => mapNotificationLogRow(row));
}

/**
 * Sube un adjunto para un evento (valida tipo y tamaño)
 */
export async function uploadAttachment(
  eventId: string,
  userId: string,
  file: File
): Promise<EventAttachment> {
  // Verificar que el evento existe y pertenece al usuario
  const event = await getEventById(eventId, userId);
  if (!event) {
    throw new Error('Evento no encontrado');
  }

  // Validar tipo de archivo (solo tipos permitidos)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido');
  }

  // Validar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Archivo demasiado grande (máximo 10MB)');
  }

  // Subir a Vercel Blob
  const blob = await put(`events/${eventId}/${file.name}`, file, {
    access: 'public', // Los archivos se sirven a través de la API, no directamente
  });

  const result = await sql`
    INSERT INTO event_attachments (event_id, filename, blob_path, file_size, content_type)
    VALUES (${eventId}, ${file.name}, ${blob.url}, ${file.size}, ${file.type})
    RETURNING id, event_id, filename, blob_path, file_size, content_type, created_at
  `;

  const row = result[0];
  return {
    id: row.id,
    eventId: row.event_id,
    filename: row.filename,
    blobPath: row.blob_path,
    fileSize: row.file_size,
    contentType: row.content_type,
    createdAt: row.created_at,
  };
}

/**
 * Elimina un adjunto
 */
export async function deleteAttachment(attachmentId: string, userId: string): Promise<boolean> {
  const result = await sql`
    SELECT ea.blob_path, ea.id
    FROM event_attachments ea
    JOIN events e ON ea.event_id = e.id
    WHERE ea.id = ${attachmentId} AND e.user_id = ${userId}
  `;

  if (result.length === 0) {
    return false;
  }

  const attachment = result[0];

  // Eliminar de Blob
  try {
    await del(attachment.blob_path);
  } catch (error) {
    console.error(`Error eliminando adjunto de Blob ${attachmentId}:`, error);
  }

  // Eliminar de BD
  const deleteResult = await sql`
    DELETE FROM event_attachments
    WHERE id = ${attachmentId}
  `;

  return deleteResult.length > 0;
}

// ========== FUNCIONES DE REPORTES ==========

/**
 * Obtiene el reporte del usuario para un período
 */
export async function getUserReport(userId: string, from: string, to: string) {
  const { buildUserReport } = await import('./reportService');
  return buildUserReport(userId, from, to);
}

/**
 * Obtiene el reporte global para admin
 */
export async function getGlobalReport() {
  const { buildGlobalReport } = await import('./reportService');
  return buildGlobalReport();
}