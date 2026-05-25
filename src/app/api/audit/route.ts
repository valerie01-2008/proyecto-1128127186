import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withAuth';
import { sql } from '@/lib/supabase';

export const GET = withRole(['admin'])(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200);
    const action = searchParams.get('action') || null;
    const userId = searchParams.get('userId') || null;

    const rows = await sql<
      {
        id: string;
        timestamp: string;
        user_id: string | null;
        user_email: string | null;
        user_role: string | null;
        action: string;
        entity: string | null;
        entity_id: string | null;
        summary: string;
        metadata: Record<string, unknown> | null;
      }[]
    >`
      SELECT id, timestamp, user_id, user_email, user_role, action, entity, entity_id, summary, metadata
      FROM audit_log
      WHERE (${action}::text IS NULL OR action = ${action})
        AND (${userId}::uuid IS NULL OR user_id = ${userId}::uuid)
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        userId: r.user_id,
        userEmail: r.user_email,
        userRole: r.user_role,
        action: r.action,
        entity: r.entity,
        entityId: r.entity_id,
        summary: r.summary,
        metadata: r.metadata,
      }))
    );
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
