import { sql } from '@/lib/supabase';

export interface EventOverlap {
  id: string;
  title: string;
}

/**
 * Verifica si hay eventos del mismo usuario que se solapan con el nuevo evento.
 * Retorna los eventos solapados (puede ser un array vacío).
 */
export async function detectOverlap(
  userId: string,
  startAt: Date,
  endAt: Date | null,
  excludeEventId?: string
): Promise<EventOverlap[]> {
  // Si no hay end_at, usar start_at + 1 hora como estimación
  const effectiveEndAt = endAt || new Date(startAt.getTime() + 60 * 60 * 1000);

  let query = sql`
    SELECT id, title
    FROM events
    WHERE user_id = ${userId}
      AND status = 'pendiente'
      AND start_at < ${effectiveEndAt.toISOString()}
      AND (end_at IS NULL OR end_at > ${startAt.toISOString()})
  `;

  if (excludeEventId) {
    query = sql`${query} AND id != ${excludeEventId}`;
  }

  const result = await query;
  return result.map((row: any) => ({ id: row.id, title: row.title })) as EventOverlap[];
}