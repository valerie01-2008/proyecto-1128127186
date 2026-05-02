'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';

interface Notification {
  id: string;
  event_id: string;
  event_title: string;
  channel: string;
  sent_at: string;
  status: string;
  message_sent: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando notificaciones...</p>
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
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificaciones</h1>
            <p className="text-gray-600">Historial de recordatorios enviados.</p>
          </div>

          <Card>
            {notifications.length === 0 ? (
              <EmptyState
                icon={<span className="text-4xl">🔔</span>}
                title="Historial vacío"
                description="Cuando tus recordatorios se envíen, los verás aquí."
              />
            ) : (
              <div className="space-y-4">
                {/* TODO: Renderizar notificaciones */}
                <p className="text-gray-500">Próximamente: lista de notificaciones</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}