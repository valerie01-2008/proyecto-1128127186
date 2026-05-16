import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'agendaProSession';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

  // Rutas de API públicas
  const publicApiPaths = ['/api/system/mode', '/api/auth/login', '/api/auth/register'];
  const isPublicApiPath = publicApiPaths.some(path => pathname.startsWith(path));

  if (isPublicPath || isPublicApiPath) {
    return NextResponse.next();
  }

  // Verificar si hay cookie de autenticación
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    // Redirigir a login si no hay token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Para rutas de admin, verificar rol
  if (pathname.startsWith('/admin')) {
    // TODO: Verificar rol del usuario desde el token
    // Por ahora, permitir acceso (se implementará cuando tengamos el JWT parsing)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};