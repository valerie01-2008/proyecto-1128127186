import { NextRequest, NextResponse } from "next/server";
import { verifyJwt, AUTH_COOKIE_NAME } from "./auth";
import { getUserById } from "./dataService";

export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    const userId = String(payload.userId ?? "");
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return user;
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export function withAuth(handler: (req: NextRequest, userId: string, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    const authResult = await requireAuth(req);

    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    // Add Cache-Control: no-store
    const response = await handler(req, authResult.id, context);
    response.headers.set('Cache-Control', 'no-store');

    return response;
  };
}

export function withRole(requiredRoles: string[]) {
  return function (handler: (req: NextRequest, userId: string, userRole: string) => Promise<NextResponse>) {
    return withAuth(async (req: NextRequest, userId: string) => {
      const user = await getUserById(userId);
      if (!user || !requiredRoles.includes(user.role)) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
      }
      return handler(req, userId, user.role);
    });
  };
}
