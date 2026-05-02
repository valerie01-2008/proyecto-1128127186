import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { uploadAttachment, deleteAttachment } from '@/lib/dataService';

interface RouteParams {
  params: {
    id: string;
  };
}

export const POST = withAuth(async (request: NextRequest, userId: string, context: RouteParams) => {
  try {
    const _eventId = context.params.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo requerido' },
        { status: 400 }
      );
    }

    const attachment = await uploadAttachment(_eventId, userId, file);
    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('Error uploading attachment:', error);

    if (error instanceof Error) {
      if (error.message.includes('Tipo de archivo no permitido') ||
          error.message.includes('Archivo demasiado grande')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('Evento no encontrado')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, userId: string, _context: RouteParams) => {
  try {
    // const _eventId = context.params.id;
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('attachmentId');

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'ID de adjunto requerido' },
        { status: 400 }
      );
    }

    const deleted = await deleteAttachment(attachmentId, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Adjunto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});