import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { deleteReminder, recordAudit } from '@/lib/dataService';

interface RouteParams {
  params:
    | Promise<{ id: string; reminderId: string }>
    | { id: string; reminderId: string };
}

export const DELETE = withAuth(
  async (_req: NextRequest, userId: string, context: RouteParams) => {
    try {
      const { id: eventId, reminderId } = await Promise.resolve(context.params);
      const deleted = await deleteReminder(reminderId, userId);
      if (!deleted) {
        return NextResponse.json(
          { error: 'Recordatorio no encontrado' },
          { status: 404 }
        );
      }
      await recordAudit('delete_reminder', userId, {
        entity: 'reminder',
        entityId: reminderId,
        summary: `Recordatorio ${reminderId} eliminado del evento ${eventId}`,
        eventId,
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
);
