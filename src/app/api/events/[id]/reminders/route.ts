import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/withAuth';
import { getReminders, createReminder, recordAudit } from '@/lib/dataService';
import type { CreateReminderRequest } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

async function getId(context: RouteParams): Promise<string> {
  const p = await Promise.resolve(context.params);
  return p.id;
}

export const GET = withAuth(async (_req: NextRequest, userId: string, context: RouteParams) => {
  try {
    const eventId = await getId(context);
    const reminders = await getReminders(eventId, userId);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest, userId: string, context: RouteParams) => {
  try {
    const eventId = await getId(context);
    const body: CreateReminderRequest = await req.json();

    const reminder = await createReminder(eventId, userId, body);
    await recordAudit('create_reminder', userId, {
      entity: 'reminder',
      entityId: reminder.id,
      summary: `Recordatorio +${reminder.anticipationMin}min añadido al evento ${eventId}`,
      eventId,
      anticipationMin: reminder.anticipationMin,
    });
    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    if (error instanceof ZodError) {
      const first = error.issues[0];
      const message = first ? `${first.path.join('.')}: ${first.message}` : 'Datos inválidos';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message.includes('Máximo')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes('no encontrado')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
