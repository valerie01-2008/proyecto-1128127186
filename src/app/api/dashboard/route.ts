import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import {
  getSystemMode,
  getEvents,
  getActiveEventCount,
} from '@/lib/dataService';

const MAX_EVENTS = 500;

export const GET = withAuth(async (_req, userId) => {
  try {
    const mode = await getSystemMode();

    if (mode === 'seed') {
      return NextResponse.json({
        mode,
        upcomingEvents: [],
        todayReminders: [],
        quotaAlert: false,
        activeEventCount: 0,
        maxEvents: MAX_EVENTS,
      });
    }

    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingEvents = await getEvents(userId, {
      status: 'pendiente',
      from: now.toISOString(),
      to: sevenDays.toISOString(),
      limit: 8,
    });

    const activeEventCount = await getActiveEventCount(userId);
    const quotaAlert = activeEventCount >= MAX_EVENTS * 0.9;

    return NextResponse.json({
      mode,
      upcomingEvents,
      todayReminders: [], // se llena cuando el motor esté activo
      quotaAlert,
      activeEventCount,
      maxEvents: MAX_EVENTS,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});
