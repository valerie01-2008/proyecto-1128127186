'use client';

import { useState, useEffect } from 'react';

interface SystemConfig {
  maxEventsPerUser: number;
  emailNotificationsEnabled: boolean;
  notificationWindowStart: string;
  notificationWindowEnd: string;
  maxRetryAttempts: number;
  retryIntervalMinutes: number;
  updatedAt: string;
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchConfig();
        setShowWarning(false);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SystemConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
    setShowWarning(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando configuración...</div>;
  }

  if (!config) {
    return <div className="text-center py-12">Error al cargar configuración</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Configuración Global</h1>
      </div>

      {/* Advertencia */}
      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Cambios en parámetros del motor
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Los cambios en los parámetros del motor de notificaciones se aplicarán en el próximo ciclo del cron.
                  Los usuarios existentes no se verán afectados hasta entonces.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Parámetros del Sistema</h2>
          <p className="mt-1 text-sm text-gray-600">
            Última actualización: {new Date(config.updatedAt).toLocaleString('es-ES')}
          </p>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Límite de eventos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límite máximo de eventos por usuario
            </label>
            <input
              type="number"
              value={config.maxEventsPerUser}
              onChange={(e) => handleChange('maxEventsPerUser', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              min="1"
              max="1000"
            />
            <p className="mt-1 text-sm text-gray-500">
              Número máximo de eventos que un usuario puede crear.
            </p>
          </div>

          {/* Notificaciones por email */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.emailNotificationsEnabled}
                onChange={(e) => handleChange('emailNotificationsEnabled', e.target.checked)}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Habilitar notificaciones por email
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Si está desactivado, el motor no enviará ningún email.
            </p>
          </div>

          {/* Ventana horaria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inicio de ventana horaria
              </label>
              <input
                type="time"
                value={config.notificationWindowStart}
                onChange={(e) => handleChange('notificationWindowStart', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Hora a partir de la cual se pueden enviar notificaciones.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fin de ventana horaria
              </label>
              <input
                type="time"
                value={config.notificationWindowEnd}
                onChange={(e) => handleChange('notificationWindowEnd', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Hora hasta la cual se pueden enviar notificaciones.
              </p>
            </div>
          </div>

          {/* Reintentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de reintentos
              </label>
              <input
                type="number"
                value={config.maxRetryAttempts}
                onChange={(e) => handleChange('maxRetryAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                min="0"
                max="10"
              />
              <p className="mt-1 text-sm text-gray-500">
                Número máximo de veces que se reintentará enviar una notificación fallida.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo entre reintentos (minutos)
              </label>
              <input
                type="number"
                value={config.retryIntervalMinutes}
                onChange={(e) => handleChange('retryIntervalMinutes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                min="1"
                max="60"
              />
              <p className="mt-1 text-sm text-gray-500">
                Tiempo de espera entre reintentos de envío.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}