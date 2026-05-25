import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/withAuth';
import { getEvents, createEvent } from '@/lib/dataService';
import type { CreateEventRequest } from '@/lib/types';

export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pendiente' | 'completado' | 'cancelado' | null;
    const category = searchParams.get('category');
    const priority = searchParams.get('priority') as 'normal' | 'alta' | 'urgente' | null;
    const search = searchParams.get('search');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const events = await getEvents(userId, {
      status: status || undefined,
      category: category || undefined,
      priority: priority || undefined,
      search: search || undefined,
      from: from || undefined,
      to: to || undefined,
      limit,
      offset,
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body: CreateEventRequest = await request.json();
    const event = await createEvent(userId, body);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);

    // Duck-type: Next.js empaqueta zod por route, así que `instanceof ZodError`
    // puede dar false entre chunks distintos. Comparamos por nombre como fallback.
    if (error instanceof ZodError || (error as { name?: string } | null)?.name === 'ZodError') {
      const zErr = error as ZodError;
      const first = zErr.issues?.[0];
      const message = first ? `${first.path.join('.')}: ${first.message}` : 'Datos inválidos';
      return NextResponse.json({ error: message, issues: zErr.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message.includes('solapa')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('límite máximo')) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});