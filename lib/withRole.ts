import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "./withAuth";
import type { UserRole } from "./types";

export async function requireRole(request: NextRequest, roles: UserRole[]) {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!roles.includes(authResult.role)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  return authResult;
}

export function withRole(roles: UserRole[]) {
  return (handler: (req: NextRequest, user: any) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const roleResult = await requireRole(req, roles);

      if (roleResult instanceof NextResponse) {
        return roleResult; // Error response
      }

      return handler(req, roleResult);
    };
  };
}
