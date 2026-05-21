'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SeedModeBanner } from '@/components/SeedModeBanner';
import { QuotaAlert } from '@/components/QuotaAlert';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { useGlobalErrorHandler } from '@/lib/useGlobalErrorHandler';

interface DashboardData {
  mode: 'seed' | 'live';
  upcomingEvents: any[];
  todayReminders: any[];
  quotaAlert: boolean;
  activeEventCount?: number;
  maxEvents?: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleResponse } = useGlobalErrorHandler();
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    const handleShowQuotaModal = () => setQuotaModalOpen(true);
    window.addEventListener('showQuotaModal', handleShowQuotaModal);
    return () => window.removeEventListener('showQuotaModal', handleShowQuotaModal);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await handleResponse(await fetch('/api/dashboard'));
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async () => {
    // TODO: Implementar bootstrap
    console.log('Bootstrap clicked');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchDashboardData} className="mt-4">
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole="user">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Bienvenido a AgendaPro. Gestiona tus eventos y recordatorios.</p>
          </div>

          {data?.mode === 'seed' && (
            <SeedModeBanner onBootstrap={handleBootstrap} />
          )}

          {data?.quotaAlert && data.activeEventCount && data.maxEvents && (
            <QuotaAlert activeEventCount={data.activeEventCount} maxEvents={data.maxEvents} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Próximos eventos */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Próximos eventos</h2>
                <Button size="sm">Crear evento</Button>
              </div>
              {data?.upcomingEvents.length === 0 ? (
                <EmptyState
                  icon={<span className="text-4xl">📅</span>}
                  title="Tu agenda está despejada"
                  description="¿Qué tienes planeado?"
                  action={<Button>+ Nuevo Evento</Button>}
                />
              ) : (
                <div className="space-y-3">
                  {/* TODO: Renderizar eventos */}
                  <p className="text-gray-500">Próximamente: lista de eventos</p>
                </div>
              )}
            </Card>

            {/* Recordatorios de hoy */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recordatorios de hoy</h2>
              {data?.todayReminders.length === 0 ? (
                <EmptyState
                  icon={<span className="text-4xl">🔔</span>}
                  title="No hay recordatorios para hoy"
                  description="Tus recordatorios aparecerán aquí cuando llegue el momento."
                />
              ) : (
                <div className="space-y-3">
                  {/* TODO: Renderizar recordatorios */}
                  <p className="text-gray-500">Próximamente: lista de recordatorios</p>
                </div>
              )}
            </Card>
          </div>

          {/* Acceso rápido */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceso rápido</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">📅</span>
                <span className="text-sm">Ver calendario</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">📝</span>
                <span className="text-sm">Crear evento</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">🔔</span>
                <span className="text-2xl">Ver notificaciones</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm">Ver reportes</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <QuotaModal isOpen={quotaModalOpen} onClose={() => setQuotaModalOpen(false)} />
    </AppLayout>
  );
}

function QuotaModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Límite de eventos alcanzado</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-gray-700">
              Has alcanzado el límite de 500 eventos activos. Archiva o elimina eventos para continuar.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
              <a
                href="/events?status=completado"
                className="px-4 py-2 bg-violet-400 text-white rounded-lg hover:bg-violet-500"
              >
                Gestionar eventos completados
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}