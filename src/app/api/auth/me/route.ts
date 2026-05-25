import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, AUTH_COOKIE_NAME } from '@/lib/auth';
import { getUserById } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const payload = await verifyJwt(token);
    const user = await getUserById(String(payload.userId ?? ''));
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
}
