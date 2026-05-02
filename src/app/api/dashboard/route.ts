import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getSystemMode } from '@/lib/dataService';

export const GET = withAuth(async () => {
  try {
    const mode = await getSystemMode();

    if (mode === 'seed') {
      return NextResponse.json({
        mode: 'seed',
        upcomingEvents: [],
        todayReminders: [],
        quotaAlert: false,
      });
    }

    // En modo live, devolver datos reales
    // Por ahora, devolver estructura vacía hasta implementar eventos
    return NextResponse.json({
      mode: 'live',
      upcomingEvents: [],
      todayReminders: [],
      quotaAlert: false,
      activeEventCount: 0,
      maxEvents: 500,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});