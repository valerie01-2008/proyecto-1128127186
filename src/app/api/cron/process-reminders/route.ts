import { NextRequest, NextResponse } from 'next/server';
import { processPendingReminders } from '@/lib/reminderEngine';

export const POST = async (request: NextRequest) => {
  try {
    // Verificar CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const summary = await processPendingReminders();

    return NextResponse.json({
      success: true,
      processed: summary.processed,
      sent: summary.sent,
      postponed_by_window: summary.postponedByWindow,
      failed: summary.failed,
      retried: summary.retried,
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};