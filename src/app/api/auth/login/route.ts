import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';
import { hashPassword, verifyPassword, createJwt } from '@/lib/auth';
import crypto from 'crypto';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

// POST /api/auth/login - Login de usuario O crear primer usuario
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const existingUsers = await sql`
      SELECT id, password_hash, role, name FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      // Usuario existe - verificar contraseña
      const user = existingUsers[0];
      const isValidPassword = verifyPassword(password, user.password_hash);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        );
      }

      // Crear JWT
      const token = await createJwt({
        userId: user.id,
        email,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email,
          name: user.name,
          role: user.role,
        },
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 60, // 30 minutos
      });

      return response;
    }

    // No existe - crear nuevo usuario (solo si hay nombre)
    if (!name) {
      return NextResponse.json(
        { error: 'Para crear nuevo usuario necesitas proporcionar nombre' },
        { status: 400 }
      );
    }

    // Verificar si hay al menos un admin registrado
    const adminCount = await sql`
      SELECT COUNT(*) as count FROM users WHERE role = 'admin'
    `;

    const role = adminCount[0].count === 0 ? 'admin' : 'user';

    const passwordHash = hashPassword(password);
    const newUser = await sql`
      INSERT INTO users (id, name, email, password_hash, role, timezone, active)
      VALUES (${crypto.randomUUID()}, ${name}, ${email}, ${passwordHash}, ${role}, 'UTC', true)
      RETURNING id, email, name, role
    `;

    if (newUser.length === 0) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    const user = newUser[0];
    const token = await createJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: role === 'admin' ? 'Primer usuario creado como admin' : 'Usuario creado exitosamente',
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60,
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
