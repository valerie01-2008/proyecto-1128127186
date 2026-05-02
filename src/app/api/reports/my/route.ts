import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getUserReport } from '@/lib/dataService';

// GET /api/reports/my?from=2026-01-01&to=2026-12-31
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const format = searchParams.get('format');

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

    if (format === 'csv') {
      const { generateUserReportCSV } = await import('@/lib/reportService');
      const report = await getUserReport(userId, from, to);
      const csv = generateUserReportCSV(report);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="reporte-agendapro.csv"',
        },
      });
    }

    const report = await getUserReport(userId, from, to);
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating user report:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});