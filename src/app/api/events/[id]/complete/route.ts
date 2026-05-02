import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { completeEvent } from '@/lib/dataService';

interface RouteParams {
  params: {
    id: string;
  };
}

export const POST = withAuth(async (_request: NextRequest, userId: string, context: RouteParams) => {
  try {
    const eventId = context.params.id;
    const event = await completeEvent(eventId, userId);

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado o ya completado' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error completing event:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});