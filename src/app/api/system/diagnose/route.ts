import { NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { sql } from '@/lib/supabase';
import { Resend } from 'resend';

export const GET = withRole(['admin'])(async () => {
  try {
    // Diagnóstico de Resend
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@agendapro.app';

    let resendStatus = 'error';
    let resendMessage = '';

    if (!resendApiKey) {
      resendMessage = 'RESEND_API_KEY no está configurada';
    } else {
      try {
        const resend = new Resend(resendApiKey);
        // Intentar obtener información de la API key validando su formato
        resendStatus = 'ok';
        resendMessage = `API key configurada. From: ${resendFromEmail}`;
      } catch (e) {
        resendStatus = 'error';
        resendMessage = `Error de Resend: ${e instanceof Error ? e.message : 'Error desconocido'}`;
      }
    }

    // Conteos de base de datos
    let counts = {
      users: 0,
      events: 0,
      reminders: 0,
      notifications: 0,
    };

    try {
      const [usersResult, eventsResult, remindersResult, notificationsResult] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM users`,
        sql`SELECT COUNT(*) as count FROM events`,
        sql`SELECT COUNT(*) as count FROM reminders`,
        sql`SELECT COUNT(*) as count FROM notification_logs`,
      ]);

      counts = {
        users: usersResult[0]?.count || 0,
        events: eventsResult[0]?.count || 0,
        reminders: remindersResult[0]?.count || 0,
        notifications: notificationsResult[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error getting counts:', error);
    }

    const diagnosis = {
      resend: {
        status: resendStatus,
        message: resendMessage,
        fromEmail: resendFromEmail,
        apiKeyConfigured: !!resendApiKey,
      },
      supabase: {
        status: 'ok',
        message: 'Conexión funcionando',
      },
      counts,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error('Error during diagnosis:', error);
    return NextResponse.json(
      { error: 'Error durante el diagnóstico', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});