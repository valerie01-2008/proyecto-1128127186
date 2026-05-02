import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { getGlobalReport } from '@/lib/dataService';

// GET /api/reports/global?from=2026-01-01&to=2026-12-31 (solo admin)
export const GET = withRole(['admin'])(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Parámetros from y to requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de fechas
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }

    const report = await getGlobalReport();
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating global report:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});