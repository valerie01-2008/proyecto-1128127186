import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/withAuth';
import { getEventById, updateEvent, deleteEvent } from '@/lib/dataService';
import type { UpdateEventRequest } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

export const GET = withAuth(async (_request: NextRequest, userId: string, context: RouteParams) => {
  try {
    const eventId = context.params.id;
    const event = await getEventById(eventId, userId);

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, userId: string, context: RouteParams) => {
  try {
    const eventId = context.params.id;
    const body: UpdateEventRequest = await request.json();

    const event = await updateEvent(eventId, userId, body);

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);

    if (error instanceof ZodError) {
      const first = error.issues[0];
      const message = first ? `${first.path.join('.')}: ${first.message}` : 'Datos inválidos';
      return NextResponse.json({ error: message, issues: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('solapa')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (_request: NextRequest, userId: string, context: RouteParams) => {
  try {
    const eventId = context.params.id;
    const deleted = await deleteEvent(eventId, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});