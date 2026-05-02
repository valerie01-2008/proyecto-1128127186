'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { UserReport } from '@/lib/reportService';

export default function ReportsPage() {
  const [report, setReport] = useState<UserReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  const generateReport = async () => {
    if (!from || !to) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/reports/my?from=${from}&to=${to}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        console.error('Error generating report');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    if (!from || !to) return;

    try {
      const response = await fetch(`/api/reports/my?from=${from}&to=${to}&format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-agendapro.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mis Reportes</h1>
      </div>

      {/* Selector de período */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>
      </div>

      {/* Reporte */}
      {report && report.events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay eventos en este período</p>
          <p className="text-gray-400 text-sm mt-1">Crea tu primer evento y empieza a llevar el control de tu agenda.</p>
        </div>
      ) : report ? (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Eventos Creados</h3>
              <p className="text-3xl font-bold text-gray-900">{report.metrics.eventsCreated}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Eventos Completados</h3>
              <p className="text-3xl font-bold text-green-600">{report.metrics.eventsCompleted}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Tasa de Cumplimiento</h3>
              <p className="text-3xl font-bold text-blue-600">
                {report.metrics.completionRate !== null ? `${report.metrics.completionRate.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Recordatorios Enviados</h3>
              <p className="text-3xl font-bold text-purple-600">{report.metrics.remindersSent}</p>
            </div>
          </div>

          {/* Gráfica de categorías */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categoría</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lista de eventos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Eventos del Período</h2>
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Exportar CSV
              </button>
            </div>
            <div className="space-y-4">
              {report.events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {event.category} • {event.priority} • {event.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(event.startAt)}
                        {event.completedAt && ` • Completado: ${formatDate(event.completedAt)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Recordatorios enviados</p>
                      <p className="font-semibold">{event.remindersSent}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Estado vacío */}
      {!report && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Selecciona un período y genera tu reporte</p>
        </div>
      )}
    </div>
  );
}