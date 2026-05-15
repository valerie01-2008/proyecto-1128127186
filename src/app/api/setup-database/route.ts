import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseClient, executeSql } from '@/lib/supabase';

// GET: Verificar conexión y listar tablas
export async function GET() {
  try {
    const client = requireSupabaseClient();

    // Listar tablas existentes
    const { data, error } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) throw error;

    // Contar filas en cada tabla
    const tables: Record<string, number> = {};

    if (data && Array.isArray(data)) {
      for (const row of data) {
        const tableName = (row as any).table_name;
        try {
          const { count } = await client
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          tables[tableName] = count || 0;
        } catch {
          // Ignorar errores de tablas que no se pueden leer
        }
      }
    }

    return NextResponse.json({
      connected: true,
      tables,
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST: Crear tablas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action !== 'create-all') {
      return NextResponse.json(
        { error: 'Acción no soportada' },
        { status: 400 }
      );
    }

    const results = [];

    // Definir todas las tablas SQL
    const tables = [
      // Tabla: users
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            email text NOT NULL UNIQUE,
            password_hash text NOT NULL,
            role text NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
            timezone text NOT NULL DEFAULT 'UTC',
            login_attempts integer DEFAULT 0,
            locked_until timestamp with time zone,
            active boolean DEFAULT true,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          );
          ALTER TABLE users ENABLE ROW LEVEL SECURITY;
          CREATE POLICY service_role_all ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
          CREATE INDEX idx_users_email ON users(email);
          CREATE INDEX idx_users_active ON users(active);
        `,
      },
      // Tabla: events
      {
        name: 'events',
        sql: `
          CREATE TABLE IF NOT EXISTS events (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title text NOT NULL,
            start_at timestamp with time zone NOT NULL,
            end_at timestamp with time zone,
            location text,
            description text,
            category text NOT NULL CHECK (category IN ('personal', 'trabajo', 'salud', 'educacion', 'otro')),
            priority text NOT NULL CHECK (priority IN ('normal', 'alta', 'urgente')) DEFAULT 'normal',
            status text NOT NULL CHECK (status IN ('pendiente', 'completado', 'cancelado')) DEFAULT 'pendiente',
            is_synced boolean DEFAULT false,
            archived_at timestamp with time zone,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          );
          ALTER TABLE events ENABLE ROW LEVEL SECURITY;
          CREATE POLICY service_role_all ON events FOR ALL TO service_role USING (true) WITH CHECK (true);
          CREATE INDEX idx_events_user_id ON events(user_id);
          CREATE INDEX idx_events_start_at ON events(start_at);
          CREATE INDEX idx_events_status ON events(status);
        `,
      },
      // Tabla: reminders
      {
        name: 'reminders',
        sql: `
          CREATE TABLE IF NOT EXISTS reminders (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            anticipation_min integer NOT NULL CHECK (anticipation_min > 0),
            channel text NOT NULL CHECK (channel IN ('email')) DEFAULT 'email',
            custom_message text,
            fire_at timestamp with time zone NOT NULL,
            status text NOT NULL CHECK (status IN ('pendiente', 'pendiente_horario', 'enviado', 'no_entregada')) DEFAULT 'pendiente',
            snooze_count integer DEFAULT 0,
            created_at timestamp with time zone DEFAULT now()
          );
          ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
          CREATE POLICY service_role_all ON reminders FOR ALL TO service_role USING (true) WITH CHECK (true);
          CREATE INDEX idx_reminders_user_id ON reminders(user_id);
          CREATE INDEX idx_reminders_event_id ON reminders(event_id);
          CREATE INDEX idx_reminders_fire_at ON reminders(fire_at);
          CREATE INDEX idx_reminders_status ON reminders(status);
        `,
      },
      // Tabla: notification_logs
      {
        name: 'notification_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS notification_logs (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            reminder_id uuid NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
            event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            channel text NOT NULL CHECK (channel IN ('email')) DEFAULT 'email',
            sent_at timestamp with time zone,
            status text NOT NULL CHECK (status IN ('entregada', 'no_entregada', 'reintentando')) DEFAULT 'reintentando',
            retry_count integer DEFAULT 0,
            next_retry_at timestamp with time zone,
            error_detail text,
            message_sent text,
            created_at timestamp with time zone DEFAULT now()
          );
          ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
          CREATE POLICY service_role_all ON notification_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
          CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
          CREATE INDEX idx_notification_logs_reminder_id ON notification_logs(reminder_id);
          CREATE INDEX idx_notification_logs_status ON notification_logs(status);
        `,
      },
      // Tabla: event_attachments
      {
        name: 'event_attachments',
        sql: `
          CREATE TABLE IF NOT EXISTS event_attachments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            filename text NOT NULL,
            blob_path text NOT NULL,
            file_size integer NOT NULL,
            content_type text NOT NULL,
            created_at timestamp with time zone DEFAULT now()
          );
          ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;
          CREATE POLICY service_role_all ON event_attachments FOR ALL TO service_role USING (true) WITH CHECK (true);
          CREATE INDEX idx_event_attachments_event_id ON event_attachments(event_id);
        `,
      },
      // Tabla: system_config
      {
        name: 'system_config',
        sql: `
          CREATE TABLE IF NOT EXISTS system_config (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            max_events_per_user integer NOT NULL DEFAULT 1000,
            notification_window_start_hour integer NOT NULL DEFAULT 8,
            notification_window_end_hour integer NOT NULL DEFAULT 22,
            default_timezone text NOT NULL DEFAULT 'UTC',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          );
          ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
          CREATE POLICY service_role_all ON system_config FOR ALL TO service_role USING (true) WITH CHECK (true);
        `,
      },
    ];

    // Crear cada tabla
    for (const table of tables) {
      try {
        await executeSql(table.sql);
        results.push({
          table: table.name,
          status: 'success',
          message: `Tabla ${table.name} creada exitosamente`,
        });
      } catch (error) {
        results.push({
          table: table.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    // Notificar a PostgREST que recargue el schema
    try {
      await executeSql("NOTIFY pgrst, 'reload schema';");
    } catch (error) {
      console.warn('Error notificando a PostgREST:', error);
    }

    const hasErrors = results.some((r) => r.status === 'error');

    return NextResponse.json(
      {
        success: !hasErrors,
        results,
      },
      { status: hasErrors ? 500 : 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
