import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';
import { recordAudit } from '@/lib/dataService';

// GET /api/users/[id] - Ver usuario específico (solo admin)
export const GET = withRole(['admin'])(async (_request: NextRequest, context: any) => {
  try {
    const targetUserId = context.params.id;

    const users = await sql`
      SELECT
        id,
        name,
        email,
        role,
        timezone,
        active,
        created_at,
        (
          SELECT COUNT(*)
          FROM events
          WHERE events.user_id = users.id AND events.status = 'pendiente'
        ) as active_events_count,
        (
          SELECT MAX(created_at)
          FROM user_sessions
          WHERE user_sessions.user_id = users.id
        ) as last_session
      FROM users
      WHERE id = ${targetUserId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = users[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      timezone: user.timezone,
      active: user.active,
      createdAt: user.created_at,
      activeEventsCount: parseInt(user.active_events_count) || 0,
      lastSession: user.last_session,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

// PUT /api/users/[id] - Actualizar usuario (solo admin)
export const PUT = withRole(['admin'])(async (request: NextRequest, userId: string, context: any) => {
  try {
    const targetUserId = context.params.id;
    const { name, email, role, timezone, active } = await request.json();

    // Verificar que el usuario existe
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${targetUserId}
    `;

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar usuario
    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, role = ${role}, timezone = ${timezone}, active = ${active}
      WHERE id = ${targetUserId}
    `;

    // Registrar auditoría
    await recordAudit('update_user', userId, { targetUserId, changes: { name, email, role, timezone, active } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});