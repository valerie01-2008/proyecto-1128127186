import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { recordAudit } from '@/lib/dataService';
import crypto from 'crypto';

// GET /api/users - Lista todos los usuarios (solo admin)
export const GET = withRole(['admin'])(async (_request: NextRequest) => {
  try {
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
      ORDER BY created_at DESC
    `;

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      timezone: user.timezone,
      active: user.active,
      createdAt: user.created_at,
      activeEventsCount: parseInt(user.active_events_count) || 0,
      lastSession: user.last_session,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

// POST /api/users - Crear nuevo usuario (solo admin)
export const POST = withRole(['admin'])(async (request: NextRequest, userId: string) => {
  try {
    const { name, email, timezone = 'UTC' } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 });
    }

    // Verificar si el email ya existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    // Generar contraseña temporal
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const passwordHash = hashPassword(tempPassword);

    // Crear usuario
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash, role, timezone, must_change_password, active)
      VALUES (${name}, ${email}, ${passwordHash}, 'user', ${timezone}, true, true)
      RETURNING id, name, email, role, timezone, created_at
    `;

    // Registrar auditoría
    await recordAudit('create_user', userId, { newUserId: newUser[0].id, email });

    return NextResponse.json({
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role,
        timezone: newUser[0].timezone,
        createdAt: newUser[0].created_at,
      },
      tempPassword, // Solo se retorna una vez
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});