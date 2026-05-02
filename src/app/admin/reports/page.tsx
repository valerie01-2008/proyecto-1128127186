'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GlobalReport {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  totalNotifications: number;
  successfulNotifications: number;
  failedNotifications: number;
  categoryDistribution: Array<{ category: string; count: number }>;
  userActivity: Array<{ user: string; events: number; completed: number }>;
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<GlobalReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/global');
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Generando reporte...</div>;
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Reportes Globales</h1>
          <button
            onClick={generateReport}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
          >
            Generar Reporte
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Haz clic en "Generar Reporte" para ver las métricas globales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reportes Globales</h1>
        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Actualizar Reporte'}
        </button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Usuarios</h3>
          <p className="text-3xl font-bold text-gray-900">{report.totalUsers}</p>
          <p className="text-sm text-gray-600">{report.activeUsers} activos</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Eventos</h3>
          <p className="text-3xl font-bold text-blue-600">{report.totalEvents}</p>
          <p className="text-sm text-gray-600">{report.completedEvents} completados</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Eventos Pendientes</h3>
          <p className="text-3xl font-bold text-orange-600">{report.pendingEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Notificaciones</h3>
          <p className="text-3xl font-bold text-green-600">{report.successfulNotifications}</p>
          <p className="text-sm text-gray-600">{report.failedNotifications} fallidas</p>
        </div>
      </div>

      {/* Gráfica de categorías */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Eventos por Categoría</h2>
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

      {/* Actividad de usuarios */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad de Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Eventos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa de Cumplimiento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.userActivity.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.events}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.completed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.events > 0 ? `${Math.round((user.completed / user.events) * 100)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}