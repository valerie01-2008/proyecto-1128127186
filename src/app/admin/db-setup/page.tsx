'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

interface DiagnosisData {
  supabase: { status: string; message: string };
  blob: { status: string; message: string };
  resend: { status: string; message: string };
  migrations: { status: string; message: string };
  seed: { status: string; message: string };
  counts: {
    users: number;
    events: number;
    reminders: number;
    notifications: number;
  };
}

export default function DbSetupPage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);

  useEffect(() => {
    runDiagnosis();
  }, []);

  const runDiagnosis = async () => {
    try {
      const response = await fetch('/api/system/diagnose');
      if (response.ok) {
        const data = await response.json();
        setDiagnosis(data);
      }
    } catch (error) {
      console.error('Error running diagnosis:', error);
    }
  };

  const runBootstrap = async () => {
    setBootstrapping(true);
    try {
      const response = await fetch('/api/system/bootstrap', {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok) {
        alert('Sistema configurado exitosamente');
        runDiagnosis(); // Recargar diagnóstico
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during bootstrap:', error);
      alert('Error durante la configuración');
    } finally {
      setBootstrapping(false);
    }
  };

  const testCron = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cron/process-reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`,
        },
      });
      const result = await response.json();
      setCronResult(result);
    } catch (error) {
      console.error('Error testing cron:', error);
      setCronResult({ error: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge variant="success">OK</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="info">Desconocido</Badge>;
    }
  };

  return (
    <AppLayout userRole="admin">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Base de Datos</h1>
            <p className="text-gray-600">Diagnóstico y configuración del sistema AgendaPro</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Diagnóstico */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Diagnóstico del Sistema</h2>
                <Button onClick={runDiagnosis} size="sm" disabled={loading}>
                  {loading ? 'Cargando...' : 'Actualizar'}
                </Button>
              </div>

              {diagnosis ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Supabase</span>
                    {getStatusBadge(diagnosis.supabase.status)}
                  </div>
                  <p className="text-sm text-gray-600">{diagnosis.supabase.message}</p>

                  <div className="flex items-center justify-between">
                    <span>Vercel Blob</span>
                    {getStatusBadge(diagnosis.blob.status)}
                  </div>
                  <p className="text-sm text-gray-600">{diagnosis.blob.message}</p>

                  <div className="flex items-center justify-between">
                    <span>Resend</span>
                    {getStatusBadge(diagnosis.resend.status)}
                  </div>
                  <p className="text-sm text-gray-600">{diagnosis.resend.message}</p>

                  <div className="flex items-center justify-between">
                    <span>Migraciones</span>
                    {getStatusBadge(diagnosis.migrations.status)}
                  </div>
                  <p className="text-sm text-gray-600">{diagnosis.migrations.message}</p>

                  <div className="flex items-center justify-between">
                    <span>Seed</span>
                    {getStatusBadge(diagnosis.seed.status)}
                  </div>
                  <p className="text-sm text-gray-600">{diagnosis.seed.message}</p>
                </div>
              ) : (
                <p className="text-gray-500">Cargando diagnóstico...</p>
              )}
            </Card>

            {/* Conteos */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas</h2>
              {diagnosis ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-violet-600">{diagnosis.counts.users}</div>
                    <div className="text-sm text-gray-600">Usuarios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{diagnosis.counts.events}</div>
                    <div className="text-sm text-gray-600">Eventos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{diagnosis.counts.reminders}</div>
                    <div className="text-sm text-gray-600">Recordatorios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{diagnosis.counts.notifications}</div>
                    <div className="text-sm text-gray-600">Notificaciones</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Cargando estadísticas...</p>
              )}
            </Card>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración</h2>
              <div className="space-y-4">
                <Button
                  onClick={runBootstrap}
                  disabled={bootstrapping}
                  className="w-full"
                >
                  {bootstrapping ? 'Configurando...' : 'Ejecutar Bootstrap'}
                </Button>
                <p className="text-sm text-gray-600">
                  Configura la base de datos con las migraciones y datos iniciales.
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Motor de Notificaciones</h2>
              <div className="space-y-4">
                <Button
                  onClick={testCron}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Probando...' : 'Probar Motor'}
                </Button>
                <p className="text-sm text-gray-600">
                  Ejecuta manualmente el motor de notificaciones para probar su funcionamiento.
                </p>

                {cronResult && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Resultado:</h4>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(cronResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}