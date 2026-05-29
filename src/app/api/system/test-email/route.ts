import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { sendReminderEmail } from '@/lib/emailService';

/**
 * POST /api/system/test-email
 * Envía un correo de prueba a la dirección del usuario autenticado
 * Requiere autenticación
 */
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .success { color: #22c55e; font-weight: bold; }
            .code { background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Correo de Prueba — AgendaPro</h1>
            </div>
            <div class="content">
              <p>¡Hola!</p>
              <p>Este es un <span class="success">correo de prueba</span> enviado desde AgendaPro para verificar que el sistema de notificaciones está funcionando correctamente.</p>
              
              <h3>✅ Verificación Exitosa</h3>
              <p>Si recibiste este correo, significa que:</p>
              <ul>
                <li>Resend API está configurado correctamente</li>
                <li>Tu dirección de correo es válida</li>
                <li>El sistema puede enviar notificaciones de recordatorios</li>
              </ul>

              <h3>📝 Información Técnica</h3>
              <div class="code">
                <strong>Servicio:</strong> Resend<br>
                <strong>Tipo:</strong> Email de prueba<br>
                <strong>Timestamp:</strong> ${new Date().toISOString()}<br>
                <strong>Destinatario:</strong> ${email}
              </div>

              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Este es un correo automatizado. Por favor, no respondas a este mensaje.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await sendReminderEmail({
      to: email,
      subject: '📧 Correo de Prueba - AgendaPro',
      html: testEmailHtml,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Correo de prueba enviado exitosamente',
        email,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Error desconocido al enviar correo',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        error: 'Error al enviar correo de prueba',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
