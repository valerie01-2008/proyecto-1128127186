import { NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';

export const GET = withRole(['admin'])(async () => {
  try {
    // TODO: Implementar diagnóstico real
    const diagnosis = {
      supabase: { status: 'unknown', message: 'No implementado' },
      blob: { status: 'unknown', message: 'No implementado' },
      resend: { status: 'unknown', message: 'No implementado' },
      migrations: { status: 'unknown', message: 'No implementado' },
      seed: { status: 'unknown', message: 'No implementado' },
      counts: {
        users: 0,
        events: 0,
        reminders: 0,
        notifications: 0,
      },
    };

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error('Error during diagnosis:', error);
    return NextResponse.json(
      { error: 'Error durante el diagnóstico' },
      { status: 500 }
    );
  }
});